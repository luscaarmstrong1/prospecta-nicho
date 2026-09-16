from __future__ import annotations

import asyncio
import hashlib
import json
import random
import re
import sqlite3
import time
from collections.abc import Awaitable
from datetime import UTC, datetime
from pathlib import Path
from typing import Any

import httpx

from workers.rfb_cnpj.city_mapping import cities_for_concessionaria
from workers.rfb_cnpj.cnae_mapping import cnaes_for_segment
from workers.rfb_cnpj.config import WorkerConfig
from workers.rfb_cnpj.filters import matches_filters
from workers.rfb_cnpj.models import CnpjFilters, CnpjRecord
from workers.rfb_cnpj.providers.base import CancelCallback, ProgressCallback
from workers.rfb_cnpj.providers.models import (
    ProviderHealth,
    ProviderProgress,
    ProviderSearchResult,
    ProviderUnavailableError,
    QueryTooBroadError,
)

RETRYABLE_STATUS = {408, 425, 429, 500, 502, 503, 504}
SENSITIVE_KEYS = {"qsa", "socios", "socio", "cpf", "cnpf", "representante_legal"}


def _digits(value: Any) -> str:
    return re.sub(r"\D+", "", str(value or ""))


def _text(value: Any) -> str:
    return str(value or "").strip()


def _float_or_none(value: Any) -> float | None:
    if value in {None, ""}:
        return None
    try:
        return float(str(value).replace(".", "").replace(",", "."))
    except (TypeError, ValueError):
        return None


def _date_iso(value: Any) -> str:
    text = _text(value)
    if not text:
        return ""
    if re.fullmatch(r"\d{4}-\d{2}-\d{2}", text):
        return text
    match = re.fullmatch(r"(\d{2})/(\d{2})/(\d{4})", text)
    if match:
        return f"{match.group(3)}-{match.group(2)}-{match.group(1)}"
    return text


def _safe_extra(payload: dict[str, Any]) -> dict[str, Any]:
    extra: dict[str, Any] = {}
    keys = {
        "descricao_cnae",
        "cnae_fiscal_descricao",
        "descricao_tipo_logradouro",
        "logradouro",
        "numero",
        "complemento",
        "bairro",
        "cep",
        "ddd_telefone_1",
        "ddd_telefone_2",
        "correio_eletronico",
        "opcao_pelo_simples",
        "opcao_pelo_mei",
        "cnaes_secundarios",
        "natureza_juridica",
    }
    for key in keys:
        if key in payload and key.lower() not in SENSITIVE_KEYS:
            extra[key] = payload[key]

    street = " ".join(
        part
        for part in [
            _text(payload.get("descricao_tipo_logradouro")),
            _text(payload.get("logradouro")),
            _text(payload.get("numero")),
            _text(payload.get("bairro")),
        ]
        if part
    )
    if street:
        extra["endereco_comercial"] = street
    email = _text(payload.get("correio_eletronico")).lower()
    if email:
        extra["email_comercial"] = email
    phone = _digits(payload.get("ddd_telefone_1"))
    if phone:
        extra["telefone_comercial"] = phone
    secondary = payload.get("cnaes_secundarios")
    if isinstance(secondary, list):
        extra["cnaes_secundarios"] = [
            {
                "codigo": _digits(item.get("codigo") if isinstance(item, dict) else item),
                "descricao": _text(item.get("descricao") if isinstance(item, dict) else ""),
            }
            for item in secondary
            if _digits(item.get("codigo") if isinstance(item, dict) else item)
        ]
    return extra


async def _maybe_call(callback: ProgressCallback | None, progress: ProviderProgress) -> None:
    if not callback:
        return
    result = callback(progress)
    if isinstance(result, Awaitable):
        await result


async def _maybe_cancel(callback: CancelCallback | None) -> bool:
    if not callback:
        return False
    result = callback()
    if isinstance(result, Awaitable):
        return bool(await result)
    return bool(result)


class MinhaReceitaProvider:
    name = "minha_receita"

    def __init__(
        self,
        config: WorkerConfig,
        client: httpx.AsyncClient | None = None,
        transport: httpx.AsyncBaseTransport | None = None,
    ) -> None:
        self.config = config
        self.base_url = config.minha_receita_base_url.rstrip("/")
        self._client = client
        self._transport = transport
        self._last_request_at = 0.0
        self._request_lock = asyncio.Lock()
        cache_dir = Path(config.minha_receita_cache_dir)
        cache_dir.mkdir(parents=True, exist_ok=True)
        self.cache_path = cache_dir / "minha_receita.sqlite"
        self._init_cache()

    def _init_cache(self) -> None:
        with sqlite3.connect(self.cache_path) as conn:
            conn.execute(
                """
                create table if not exists minha_receita_cache (
                  cache_key text primary key,
                  payload text not null,
                  created_at integer not null
                )
                """
            )

    def _cache_key(self, path: str, params: dict[str, Any]) -> str:
        normalized = json.dumps({"path": path, "params": params}, sort_keys=True, ensure_ascii=True)
        return hashlib.sha256(normalized.encode("utf-8")).hexdigest()

    def _cache_get(self, key: str) -> dict[str, Any] | None:
        ttl_seconds = max(self.config.minha_receita_cache_ttl_hours, 0) * 3600
        if ttl_seconds <= 0:
            return None
        cutoff = int(time.time()) - ttl_seconds
        with sqlite3.connect(self.cache_path) as conn:
            row = conn.execute(
                "select payload, created_at from minha_receita_cache where cache_key = ?",
                (key,),
            ).fetchone()
        if not row or int(row[1]) < cutoff:
            return None
        payload = json.loads(str(row[0]))
        return payload if isinstance(payload, dict) else None

    def _cache_set(self, key: str, payload: dict[str, Any]) -> None:
        with sqlite3.connect(self.cache_path) as conn:
            conn.execute(
                """
                insert into minha_receita_cache(cache_key, payload, created_at)
                values (?, ?, ?)
                on conflict(cache_key) do update set payload = excluded.payload, created_at = excluded.created_at
                """,
                (key, json.dumps(payload, ensure_ascii=False), int(time.time())),
            )

    async def _client_context(self) -> httpx.AsyncClient:
        if self._client:
            return self._client
        return httpx.AsyncClient(
            base_url=self.base_url,
            timeout=self.config.minha_receita_timeout_seconds,
            transport=self._transport,
            headers={"accept": "application/json", "user-agent": "ProspectaNichoWorker/1.0"},
        )

    async def _paced_get(self, path: str, params: dict[str, Any] | None = None) -> dict[str, Any]:
        clean_params = {key: value for key, value in (params or {}).items() if value not in {None, "", ()}}
        cache_key = self._cache_key(path, clean_params)
        cached = self._cache_get(cache_key)
        if cached is not None:
            return cached

        for attempt in range(1, self.config.minha_receita_max_retries + 1):
            async with self._request_lock:
                delay = self.config.minha_receita_min_interval_ms / 1000
                elapsed = time.monotonic() - self._last_request_at
                if elapsed < delay:
                    await asyncio.sleep(delay - elapsed)
                self._last_request_at = time.monotonic()

            close_client = self._client is None
            client = await self._client_context()
            try:
                response = await client.get(path, params=clean_params)
                if response.status_code in RETRYABLE_STATUS:
                    retry_after = response.headers.get("retry-after")
                    wait = float(retry_after) if retry_after and retry_after.isdigit() else min(12, (2 ** attempt) + random.random())
                    if attempt >= self.config.minha_receita_max_retries:
                        raise ProviderUnavailableError(f"Minha Receita retornou HTTP {response.status_code}.")
                    await asyncio.sleep(wait)
                    continue
                response.raise_for_status()
                payload = response.json()
                if not isinstance(payload, dict):
                    raise ProviderUnavailableError("Resposta inesperada da Minha Receita.")
                self._cache_set(cache_key, payload)
                return payload
            except (httpx.TimeoutException, httpx.TransportError) as error:
                if attempt >= self.config.minha_receita_max_retries:
                    raise ProviderUnavailableError(f"Falha de rede na Minha Receita: {error}") from error
                await asyncio.sleep(min(12, (2 ** attempt) + random.random()))
            finally:
                if close_client:
                    await client.aclose()
        raise ProviderUnavailableError("Minha Receita indisponivel apos tentativas.")

    async def health(self) -> ProviderHealth:
        started = time.perf_counter()
        try:
            await self._paced_get("/", {"uf": "DF", "limit": 1})
        except Exception as error:
            return ProviderHealth(self.name, "OFFLINE", message=str(error))
        latency = int((time.perf_counter() - started) * 1000)
        return ProviderHealth(self.name, "ONLINE", latency_ms=latency, message="Provider pronto para consultas paginadas.")

    def _search_params(self, filters: CnpjFilters) -> dict[str, Any]:
        cnaes = tuple(_digits(cnae) for cnae in (filters.cnaes or cnaes_for_segment(filters.segment)) if _digits(cnae))
        concessionaria_cities = cities_for_concessionaria(filters.concessionaria) if filters.concessionaria else ()
        has_strong_filter = bool(filters.city or cnaes or concessionaria_cities)
        if not has_strong_filter:
            raise QueryTooBroadError("Informe cidade, CNAE, segmento mapeado ou concessionaria antes de processar a busca.")
        params: dict[str, Any] = {"limit": min(max(self.config.minha_receita_page_limit, 1), 1024)}
        if filters.uf:
            params["uf"] = filters.uf.strip().upper()
        if filters.city:
            params["municipio"] = filters.city.strip()
        elif concessionaria_cities:
            params["municipio"] = ",".join(sorted(concessionaria_cities)[:5])
        if cnaes:
            params["cnae" if filters.include_secondary_cnaes else "cnae_fiscal"] = ",".join(cnaes[:10])
        return params

    def normalize(self, raw_company: dict[str, Any]) -> CnpjRecord | None:
        clean = {key: value for key, value in raw_company.items() if key.lower() not in SENSITIVE_KEYS}
        cnpj = _digits(clean.get("cnpj"))
        if len(cnpj) != 14:
            return None
        return CnpjRecord(
            cnpj=cnpj,
            razao_social=_text(clean.get("razao_social")),
            nome_fantasia=_text(clean.get("nome_fantasia")),
            cnae_principal=_digits(clean.get("cnae_fiscal")),
            municipio=_text(clean.get("municipio")),
            uf=_text(clean.get("uf")).upper(),
            porte=_text(clean.get("porte")),
            data_abertura=_date_iso(clean.get("data_inicio_atividade") or clean.get("data_abertura")),
            situacao_cadastral=_text(clean.get("descricao_situacao_cadastral") or clean.get("situacao_cadastral") or "ATIVA").upper(),
            matriz_filial=_text(clean.get("descricao_identificador_matriz_filial") or clean.get("matriz_filial") or "MATRIZ").upper(),
            capital_social=_float_or_none(clean.get("capital_social")),
            extra=_safe_extra(clean),
        )

    async def get_company(self, cnpj: str) -> CnpjRecord | None:
        payload = await self._paced_get(f"/{_digits(cnpj)}", {})
        return self.normalize(payload)

    async def search(
        self,
        filters: CnpjFilters,
        progress_callback: ProgressCallback | None = None,
        cancel_callback: CancelCallback | None = None,
    ) -> ProviderSearchResult:
        params = self._search_params(filters)
        target = max(int(filters.quantity or 1), 1) * max(self.config.minha_receita_oversample_factor, 1)
        cursor: str | None = None
        previous_cursor: str | None = None
        records: dict[str, CnpjRecord] = {}
        pages_read = 0
        records_seen = 0
        warnings: list[str] = []
        stopped_reason = "cursor_ended"

        await _maybe_call(progress_callback, ProviderProgress(self.name, "search_started", message="Busca iniciada na Minha Receita."))
        while pages_read < max(self.config.minha_receita_max_pages_per_query, 1):
            if await _maybe_cancel(cancel_callback):
                stopped_reason = "cancelled"
                break
            page_params = dict(params)
            if cursor:
                page_params["cursor"] = cursor
            payload = await self._paced_get("/", page_params)
            raw_items = payload.get("data")
            items = raw_items if isinstance(raw_items, list) else []
            pages_read += 1
            records_seen += len(items)
            for item in items:
                if not isinstance(item, dict):
                    continue
                record = self.normalize(item)
                if record and matches_filters(record, filters):
                    current = records.get(record.cnpj)
                    if current:
                        merged_extra = {**current.extra, **record.extra}
                        records[record.cnpj] = CnpjRecord(**{**record.__dict__, "extra": merged_extra})
                    else:
                        records[record.cnpj] = record
            await _maybe_call(
                progress_callback,
                ProviderProgress(
                    self.name,
                    "page_read",
                    pages_read=pages_read,
                    records_seen=records_seen,
                    records_kept=len(records),
                    metadata={"cursor": cursor, "params": params},
                ),
            )
            if len(records) >= target:
                stopped_reason = "target_oversample_reached"
                break
            next_cursor = payload.get("cursor")
            cursor = str(next_cursor) if next_cursor not in {None, ""} else None
            if not cursor:
                stopped_reason = "cursor_ended"
                break
            if cursor == previous_cursor:
                warnings.append("Cursor repetido pela API; paginacao encerrada para evitar loop.")
                stopped_reason = "repeated_cursor"
                break
            previous_cursor = cursor
        else:
            stopped_reason = "max_pages_reached"

        await _maybe_call(
            progress_callback,
            ProviderProgress(
                self.name,
                "search_finished",
                pages_read=pages_read,
                records_seen=records_seen,
                records_kept=len(records),
                message=f"Busca finalizada: {len(records)} registros elegiveis.",
            ),
        )
        return ProviderSearchResult(
            provider=self.name,
            records=tuple(records.values()),
            pages_read=pages_read,
            records_seen=records_seen,
            records_kept=len(records),
            stopped_reason=stopped_reason,
            warnings=tuple(warnings),
        )
