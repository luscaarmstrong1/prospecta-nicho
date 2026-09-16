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
from decimal import Decimal, InvalidOperation
from pathlib import Path
from typing import Any

import httpx

from workers.rfb_cnpj.config import WorkerConfig
from workers.rfb_cnpj.filters import matches_filters
from workers.rfb_cnpj.models import CnpjFilters, CnpjRecord
from workers.rfb_cnpj.municipality_resolver import MunicipalityResolver, normalize_municipality, only_digits
from workers.rfb_cnpj.providers.base import CancelCallback, ProgressCallback
from workers.rfb_cnpj.providers.models import (
    ProviderHealth,
    ProviderProgress,
    ProviderSearchResult,
    ProviderUnavailableError,
)
from workers.rfb_cnpj.query_planner import PlannedQuery, QueryPlanner

RETRYABLE_STATUS = {408, 425, 429, 500, 502, 503, 504}
SENSITIVE_KEYS = {"qsa", "socios", "socio", "cpf", "cnpf", "representante_legal"}
SENSITIVE_KEY_FRAGMENTS = ("cpf", "socio", "qsa", "representante")


def _digits(value: Any) -> str:
    return re.sub(r"\D+", "", str(value or ""))


def _text(value: Any) -> str:
    return str(value or "").strip()


def _is_sensitive_key(key: Any) -> bool:
    lowered = str(key or "").strip().lower()
    return lowered in SENSITIVE_KEYS or any(fragment in lowered for fragment in SENSITIVE_KEY_FRAGMENTS)


def _decimal_or_none(value: Any) -> Decimal | None:
    if value in {None, ""}:
        return None
    try:
        return Decimal(str(value).replace(".", "").replace(",", "."))
    except (InvalidOperation, TypeError, ValueError):
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
    return ""


def _bool_label(value: Any) -> str:
    text = _text(value).casefold()
    if text in {"s", "sim", "true", "1"}:
        return "SIM"
    if text in {"n", "nao", "não", "false", "0"}:
        return "NAO"
    return "DESCONHECIDO"


def _normalized_status(value: Any) -> str:
    text = _text(value).upper()
    return text or "DESCONHECIDA"


def _normalized_branch(value: Any) -> str:
    text = _text(value).upper()
    return text or "DESCONHECIDO"


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
        "codigo_municipio_ibge",
    }
    for key in keys:
        if key in payload and not _is_sensitive_key(key):
            extra[key] = payload[key]

    street = " ".join(
        part
        for part in [
            _text(payload.get("descricao_tipo_logradouro")),
            _text(payload.get("logradouro")),
            _text(payload.get("numero")),
            _text(payload.get("complemento")),
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
        extra["phone_1"] = phone
    phone_2 = _digits(payload.get("ddd_telefone_2"))
    if phone_2:
        extra["phone_2"] = phone_2
    extra["simples"] = _bool_label(payload.get("opcao_pelo_simples"))
    extra["mei"] = _bool_label(payload.get("opcao_pelo_mei"))
    natureza = payload.get("natureza_juridica")
    if isinstance(natureza, dict):
        extra["natureza_juridica_codigo"] = _digits(natureza.get("codigo"))
        extra["natureza_juridica_descricao"] = _text(natureza.get("descricao"))
    elif natureza:
        extra["natureza_juridica_descricao"] = _text(natureza)
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


def _strip_sensitive_payload(value: Any) -> Any:
    if isinstance(value, dict):
        safe: dict[str, Any] = {}
        for key, item in value.items():
            if _is_sensitive_key(key):
                continue
            safe[key] = _strip_sensitive_payload(item)
        return safe
    if isinstance(value, list):
        return [_strip_sensitive_payload(item) for item in value]
    return value


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
        self.municipality_resolver = MunicipalityResolver(
            self.cache_path,
            timeout_seconds=config.ibge_timeout_seconds,
            transport=transport,
        )
        self.query_planner = QueryPlanner(config.minha_receita_page_limit)
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
                self._cache_set(cache_key, _strip_sensitive_payload(payload))
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
            await self._paced_get("/", {"uf": "DF", "cnae_fiscal": "6209100", "limit": 1})
        except Exception as error:
            return ProviderHealth(self.name, "OFFLINE", message=str(error))
        latency = int((time.perf_counter() - started) * 1000)
        return ProviderHealth(self.name, "ONLINE", latency_ms=latency, message="Provider pronto para consultas paginadas.")

    async def _planned_queries(self, filters: CnpjFilters) -> tuple[PlannedQuery, ...]:
        return await self.query_planner.build(filters, self.municipality_resolver)

    def normalize(self, raw_company: dict[str, Any]) -> CnpjRecord | None:
        clean = {key: value for key, value in raw_company.items() if not _is_sensitive_key(key)}
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
            situacao_cadastral=_normalized_status(clean.get("descricao_situacao_cadastral") or clean.get("situacao_cadastral")),
            matriz_filial=_normalized_branch(clean.get("descricao_identificador_matriz_filial") or clean.get("matriz_filial")),
            capital_social=_decimal_or_none(clean.get("capital_social")),
            extra=_safe_extra(clean),
        )

    def _geography_matches(self, record: CnpjRecord, query: PlannedQuery, filters: CnpjFilters) -> bool:
        municipality = query.municipality
        record_code = only_digits(record.extra.get("codigo_municipio_ibge"))
        if municipality and municipality.ibge_code:
            return record_code == municipality.ibge_code if record_code else (
                normalize_municipality(record.municipio) == municipality.normalized_city
                and record.uf.strip().upper() == municipality.uf
            )
        if filters.uf and record.uf.strip().upper() != filters.uf.strip().upper():
            return False
        return True

    async def get_company(self, cnpj: str) -> CnpjRecord | None:
        payload = await self._paced_get(f"/{_digits(cnpj)}", {})
        return self.normalize(payload)

    async def search(
        self,
        filters: CnpjFilters,
        progress_callback: ProgressCallback | None = None,
        cancel_callback: CancelCallback | None = None,
    ) -> ProviderSearchResult:
        started_at = time.perf_counter()
        planned_queries = await self._planned_queries(filters)
        target = max(int(filters.quantity or 1), 1) * max(self.config.minha_receita_oversample_factor, 1)
        records: dict[str, CnpjRecord] = {}
        queries_completed = 0
        pages_read = 0
        records_seen = 0
        valid_records = 0
        geography_mismatch_count = 0
        duplicate_count = 0
        api_requests = 0
        warnings: list[str] = []
        stopped_reason = "cursor_ended"

        await _maybe_call(progress_callback, ProviderProgress(self.name, "resolving_municipalities", message="Municipios resolvidos para codigos IBGE."))
        await _maybe_call(progress_callback, ProviderProgress(self.name, "planning_queries", message=f"{len(planned_queries)} consulta(s) planejada(s)."))
        for query_index, query in enumerate(planned_queries, start=1):
            cursor: str | None = None
            previous_cursor: str | None = None
            query_pages = 0
            while pages_read < max(self.config.minha_receita_max_pages_per_query, 1):
                if await _maybe_cancel(cancel_callback):
                    stopped_reason = "cancelled"
                    break
                page_params = dict(query.params)
                if cursor:
                    page_params["cursor"] = cursor
                payload = await self._paced_get("/", page_params)
                api_requests += 1
                raw_items = payload.get("data")
                items = raw_items if isinstance(raw_items, list) else []
                pages_read += 1
                query_pages += 1
                records_seen += len(items)
                for item in items:
                    if not isinstance(item, dict):
                        continue
                    record = self.normalize(item)
                    if not record:
                        continue
                    if not self._geography_matches(record, query, filters):
                        geography_mismatch_count += 1
                        continue
                    if matches_filters(record, filters):
                        valid_records += 1
                        current = records.get(record.cnpj)
                        if current:
                            duplicate_count += 1
                            merged_extra = {**current.extra, **record.extra}
                            records[record.cnpj] = CnpjRecord(**{**record.__dict__, "extra": merged_extra})
                        else:
                            records[record.cnpj] = record
                await _maybe_call(
                    progress_callback,
                    ProviderProgress(
                        self.name,
                        "querying_provider",
                        pages_read=pages_read,
                        records_seen=records_seen,
                        records_kept=len(records),
                        metadata={
                            "query_index": query_index,
                            "queries_total": len(planned_queries),
                            "current_city": query.municipality.official_name if query.municipality else None,
                            "current_city_code": query.municipality.ibge_code if query.municipality else None,
                            "params": query.params,
                        },
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
            queries_completed += 1
            if stopped_reason in {"cancelled", "target_oversample_reached", "repeated_cursor"}:
                break
            if query_pages >= max(self.config.minha_receita_max_pages_per_query, 1):
                stopped_reason = "max_pages_reached"
                break

        await _maybe_call(
            progress_callback,
            ProviderProgress(
                self.name,
                "search_finished",
                pages_read=pages_read,
                records_seen=records_seen,
                records_kept=len(records),
                message=f"Busca finalizada: {len(records)} registros elegiveis.",
                metadata={
                    "queries_total": len(planned_queries),
                    "queries_completed": queries_completed,
                    "api_requests": api_requests,
                    "valid_records": valid_records,
                    "duplicates_removed": duplicate_count,
                    "geography_mismatch_count": geography_mismatch_count,
                    "target_records": filters.quantity,
                    "cache_hits": self.municipality_resolver.cache_hits,
                    "cache_misses": self.municipality_resolver.cache_misses,
                },
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
            extra_stats={
                "queries_total": len(planned_queries),
                "queries_completed": queries_completed,
                "api_requests": api_requests,
                "valid_records": valid_records,
                "unique_records": len(records),
                "duplicates_removed": duplicate_count,
                "geography_mismatch_count": geography_mismatch_count,
                "filtered_records": max(records_seen - valid_records - geography_mismatch_count, 0),
                "suppressed_records": 0,
                "target_records": filters.quantity,
                "cache_hits": self.municipality_resolver.cache_hits,
                "cache_misses": self.municipality_resolver.cache_misses,
                "elapsed_seconds": round(time.perf_counter() - started_at, 3),
            },
        )
