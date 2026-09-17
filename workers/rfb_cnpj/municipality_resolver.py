from __future__ import annotations

import re
import sqlite3
import time
import unicodedata
from dataclasses import dataclass
from pathlib import Path
from typing import Any

import httpx


IBGE_MUNICIPIOS_URL = "https://servicodados.ibge.gov.br/api/v1/localidades/estados/{uf}/municipios"


def normalize_municipality(value: str | None) -> str:
    text = unicodedata.normalize("NFKD", str(value or ""))
    ascii_text = "".join(char for char in text if not unicodedata.combining(char))
    return re.sub(r"\s+", " ", ascii_text.strip().upper())


def only_digits(value: Any) -> str:
    return re.sub(r"\D+", "", str(value or ""))


@dataclass(frozen=True)
class ResolvedMunicipality:
    uf: str
    requested_name: str
    normalized_city: str
    ibge_code: str
    official_name: str
    source: str


class MunicipalityResolver:
    def __init__(
        self,
        cache_path: Path,
        *,
        timeout_seconds: float = 20,
        cache_ttl_hours: int = 720,
        transport: httpx.AsyncBaseTransport | None = None,
    ) -> None:
        self.cache_path = cache_path
        self.timeout_seconds = timeout_seconds
        self.cache_ttl_hours = max(cache_ttl_hours, 0)
        self.transport = transport
        self.cache_hits = 0
        self.cache_misses = 0
        self.cache_path.parent.mkdir(parents=True, exist_ok=True)
        self._init_cache()

    def _init_cache(self) -> None:
        with sqlite3.connect(self.cache_path) as conn:
            conn.execute(
                """
                create table if not exists municipios_ibge (
                  uf text not null,
                  normalized_city text not null,
                  ibge_code text not null,
                  official_name text not null,
                  resolved_at integer not null,
                  primary key (uf, normalized_city)
                )
                """
            )

    def _cache_get(self, uf: str, city: str) -> ResolvedMunicipality | None:
        normalized = normalize_municipality(city)
        with sqlite3.connect(self.cache_path) as conn:
            row = conn.execute(
                """
                select ibge_code, official_name, resolved_at from municipios_ibge
                where uf = ? and normalized_city = ?
                """,
                (uf.upper(), normalized),
            ).fetchone()
        cutoff = int(time.time()) - self.cache_ttl_hours * 3600
        if not row or self.cache_ttl_hours == 0 or int(row[2]) < cutoff:
            self.cache_misses += 1
            return None
        self.cache_hits += 1
        return ResolvedMunicipality(
            uf=uf.upper(),
            requested_name=city,
            normalized_city=normalized,
            ibge_code=str(row[0]),
            official_name=str(row[1]),
            source="cache",
        )

    def _cache_set(self, resolved: ResolvedMunicipality) -> None:
        with sqlite3.connect(self.cache_path) as conn:
            conn.execute(
                """
                insert into municipios_ibge(uf, normalized_city, ibge_code, official_name, resolved_at)
                values (?, ?, ?, ?, ?)
                on conflict(uf, normalized_city) do update set
                  ibge_code = excluded.ibge_code,
                  official_name = excluded.official_name,
                  resolved_at = excluded.resolved_at
                """,
                (
                    resolved.uf.upper(),
                    resolved.normalized_city,
                    resolved.ibge_code,
                    resolved.official_name,
                    int(time.time()),
                ),
            )

    def from_known_code(self, city: str, uf: str | None, code: str) -> ResolvedMunicipality | None:
        clean_code = only_digits(code)
        if not clean_code:
            return None
        normalized = normalize_municipality(city)
        resolved = ResolvedMunicipality(
            uf=str(uf or "").upper(),
            requested_name=city,
            normalized_city=normalized,
            ibge_code=clean_code,
            official_name=city,
            source="request_filters",
        )
        if resolved.uf and normalized:
            self._cache_set(resolved)
        return resolved

    async def resolve(self, city: str, uf: str | None, known_code: str | None = None) -> ResolvedMunicipality | None:
        if known_code:
            return self.from_known_code(city, uf, known_code)
        uf_code = str(uf or "").strip().upper()
        city_text = str(city or "").strip()
        if not uf_code or not city_text:
            return None
        cached = self._cache_get(uf_code, city_text)
        if cached:
            return cached

        normalized = normalize_municipality(city_text)
        async with httpx.AsyncClient(timeout=self.timeout_seconds, transport=self.transport) as client:
            response = await client.get(IBGE_MUNICIPIOS_URL.format(uf=uf_code), params={"orderBy": "nome"})
            response.raise_for_status()
            payload = response.json()
        municipalities = payload if isinstance(payload, list) else []
        for item in municipalities:
            if not isinstance(item, dict):
                continue
            official_name = str(item.get("nome") or "")
            if normalize_municipality(official_name) == normalized:
                resolved = ResolvedMunicipality(
                    uf=uf_code,
                    requested_name=city_text,
                    normalized_city=normalized,
                    ibge_code=only_digits(item.get("id")),
                    official_name=official_name,
                    source="ibge_api",
                )
                self._cache_set(resolved)
                return resolved
        return None
