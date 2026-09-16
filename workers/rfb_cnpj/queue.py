from __future__ import annotations

import asyncio
import hashlib
import json
import time
import urllib.error
import urllib.parse
import urllib.request
import uuid
from datetime import UTC, datetime, timedelta
from pathlib import Path
from typing import Any

from workers.rfb_cnpj.cli import _filters_from_dict
from workers.rfb_cnpj.config import WorkerConfig
from workers.rfb_cnpj.job_runner import run_job
from workers.rfb_cnpj.providers import get_company_search_provider
from workers.rfb_cnpj.providers.models import ProviderProgress, ProviderUnavailableError, QueryTooBroadError


class JobCancelled(RuntimeError):
    pass


def _now_iso() -> str:
    return datetime.now(UTC).isoformat()


def _headers(config: WorkerConfig, prefer: str | None = None) -> dict[str, str]:
    if not config.supabase_service_role_key:
        raise RuntimeError("SUPABASE_SERVICE_ROLE_KEY nao configurado.")
    headers = {
        "apikey": config.supabase_service_role_key,
        "authorization": f"Bearer {config.supabase_service_role_key}",
        "content-type": "application/json",
    }
    if prefer:
        headers["prefer"] = prefer
    return headers


def _rest_url(config: WorkerConfig, table: str, query: str = "") -> str:
    if not config.supabase_url:
        raise RuntimeError("SUPABASE_URL nao configurado.")
    base = config.supabase_url.rstrip("/")
    return f"{base}/rest/v1/{table}{query}"


def _rpc_url(config: WorkerConfig, function_name: str) -> str:
    if not config.supabase_url:
        raise RuntimeError("SUPABASE_URL nao configurado.")
    base = config.supabase_url.rstrip("/")
    return f"{base}/rest/v1/rpc/{function_name}"


def _request_json(config: WorkerConfig, method: str, table: str, query = "", body: dict[str, Any] | None = None) -> Any:
    data = json.dumps(body or {}).encode("utf-8") if body is not None else None
    request = urllib.request.Request(
        _rest_url(config, table, query),
        data=data,
        headers=_headers(config, "return=representation" if method in {"PATCH", "POST"} else None),
        method=method,
    )
    with urllib.request.urlopen(request, timeout=30) as response:
        payload = response.read().decode("utf-8")
        return json.loads(payload) if payload else None


def _rpc(config: WorkerConfig, function_name: str, body: dict[str, Any]) -> Any:
    request = urllib.request.Request(
        _rpc_url(config, function_name),
        data=json.dumps(body).encode("utf-8"),
        headers=_headers(config, "return=representation"),
        method="POST",
    )
    try:
        with urllib.request.urlopen(request, timeout=30) as response:
            payload = response.read().decode("utf-8")
            return json.loads(payload) if payload else None
    except urllib.error.HTTPError as error:
        detail = error.read().decode("utf-8", errors="replace")
        raise RuntimeError(f"RPC Supabase {function_name} falhou. Aplique as migrations mais recentes. {detail}") from error


def _insert(config: WorkerConfig, table: str, body: dict[str, Any]) -> None:
    _request_json(config, "POST", table, "", body)


def _patch(config: WorkerConfig, table: str, query: str, body: dict[str, Any]) -> list[dict[str, Any]]:
    payload = _request_json(config, "PATCH", table, query, body)
    return payload if isinstance(payload, list) else []


def _log(config: WorkerConfig, job: dict[str, Any], step: str, message: str, level: str = "info") -> None:
    request_id = job.get("request_id")
    _insert(
        config,
        "rfb_job_logs",
        {
            "job_id": job.get("id"),
            "request_id": request_id,
            "level": level,
            "step": step,
            "message": message,
            "metadata": {"worker_id": config.worker_id},
        },
    )


def _request_public_code(config: WorkerConfig, request_id: str) -> str | None:
    if not request_id:
        return None
    rows = _request_json(
        config,
        "GET",
        "custom_requests",
        f"?select=public_code&id=eq.{urllib.parse.quote(request_id)}&limit=1",
    )
    if isinstance(rows, list) and rows:
        value = rows[0].get("public_code")
        return str(value) if value else None
    return None


def _canonical_request_snapshot(config: WorkerConfig, request_id: str) -> dict[str, Any]:
    if not request_id:
        return {}
    filter_rows = _request_json(
        config,
        "GET",
        "request_filters",
        f"?select=*&request_id=eq.{urllib.parse.quote(request_id)}&limit=1",
    )
    field_rows = _request_json(
        config,
        "GET",
        "request_fields",
        f"?select=field_key&request_id=eq.{urllib.parse.quote(request_id)}&order=created_at.asc",
    )
    row = filter_rows[0] if isinstance(filter_rows, list) and filter_rows else {}
    if not isinstance(row, dict):
        row = {}
    cnaes = [*(row.get("cnae_principal") or []), *(row.get("cnae_secondary") or [])]
    fields = [
        str(item.get("field_key"))
        for item in (field_rows if isinstance(field_rows, list) else [])
        if isinstance(item, dict) and item.get("field_key")
    ]
    snapshot: dict[str, Any] = {
        "uf": row.get("uf"),
        "city": row.get("city"),
        "cities": row.get("cities") or [],
        "city_ibge_code": row.get("city_ibge_code"),
        "city_ibge_codes": row.get("city_ibge_codes") or [],
        "concessionaria": row.get("concessionaria"),
        "opening_period": row.get("opening_period"),
        "opening_date_start": row.get("opening_date_start"),
        "opening_date_end": row.get("opening_date_end"),
        "company_size": row.get("company_sizes") or [],
        "registration_status": row.get("registration_status"),
        "branch_type": row.get("establishment_type"),
        "cnaes": cnaes,
        "include_secondary_cnaes": row.get("include_secondary_cnaes"),
        "exclude_mei": row.get("exclude_mei"),
        "only_headquarters": row.get("only_headquarters"),
        "min_capital": row.get("min_capital"),
        "max_capital": row.get("max_capital"),
        "quantity": row.get("desired_quantity"),
        "fields": fields,
        "delivery_format": row.get("delivery_format"),
    }
    return {key: value for key, value in snapshot.items() if value not in (None, "", [])}


def _job_filters_snapshot(config: WorkerConfig, job: dict[str, Any]) -> dict[str, Any]:
    request_id = str(job.get("request_id") or "")
    snapshot = {**_canonical_request_snapshot(config, request_id), **dict(job.get("filters_snapshot") or {})}
    if not snapshot.get("publicCode") and not snapshot.get("public_code"):
        public_code = _request_public_code(config, request_id)
        if public_code:
            snapshot["publicCode"] = public_code
    return snapshot


def _job_id_query(job: dict[str, Any]) -> str:
    return f"?id=eq.{urllib.parse.quote(str(job['id']))}"


def _queued_job(config: WorkerConfig) -> dict[str, Any] | None:
    rows = _rpc(
        config,
        "claim_next_rfb_job",
        {"p_worker_id": config.worker_id, "p_lease_seconds": config.worker_lease_seconds},
    )
    if not isinstance(rows, list) or not rows:
        return None
    return rows[0]


def _recover_stale_jobs(config: WorkerConfig) -> None:
    _rpc(config, "recover_stale_rfb_jobs", {"p_max_attempts": config.job_max_attempts})


def _lease_expires_iso(config: WorkerConfig) -> str:
    return (datetime.now(UTC) + timedelta(seconds=max(config.worker_lease_seconds, 30))).isoformat()


def _heartbeat(config: WorkerConfig, job: dict[str, Any], current_step: str | None = None, progress: int | None = None) -> None:
    body: dict[str, Any] = {
        "heartbeat_at": _now_iso(),
        "lease_expires_at": _lease_expires_iso(config),
        "updated_at": _now_iso(),
    }
    if current_step:
        body["current_step"] = current_step
    if progress is not None:
        body["progress"] = progress
    _patch(config, "rfb_processing_jobs", _job_id_query(job), body)


def _cancel_requested(config: WorkerConfig, job: dict[str, Any]) -> bool:
    rows = _request_json(config, "GET", "rfb_processing_jobs", f"{_job_id_query(job)}&select=cancel_requested_at&limit=1")
    if not isinstance(rows, list) or not rows:
        return False
    return bool(rows[0].get("cancel_requested_at"))


def _patch_progress(config: WorkerConfig, job: dict[str, Any], progress: ProviderProgress) -> None:
    percent = 10
    if progress.step == "querying_provider":
        percent = min(85, 20 + progress.pages_read * 3)
    elif progress.step == "search_finished":
        percent = 88
    _patch(
        config,
        "rfb_processing_jobs",
        _job_id_query(job),
        {
            "progress": percent,
            "current_step": progress.step,
            "search_stats": {
                "provider": progress.provider,
                "queries_total": progress.metadata.get("queries_total"),
                "queries_completed": progress.metadata.get("queries_completed"),
                "current_city": progress.metadata.get("current_city"),
                "current_city_code": progress.metadata.get("current_city_code"),
                "api_requests": progress.metadata.get("api_requests"),
                "pages_read": progress.pages_read,
                "records_seen": progress.records_seen,
                "unique_records": progress.records_kept,
                "records_kept": progress.records_kept,
                "message": progress.message,
                "metadata": progress.metadata,
            },
            "heartbeat_at": _now_iso(),
            "lease_expires_at": _lease_expires_iso(config),
            "updated_at": _now_iso(),
        },
    )
    if progress.message or progress.step == "querying_provider":
        _log(
            config,
            job,
            progress.step,
            progress.message or f"Pagina {progress.pages_read}: {progress.records_kept} registros elegiveis.",
        )


async def _heartbeat_loop(config: WorkerConfig, job: dict[str, Any], stop: asyncio.Event) -> None:
    while not stop.is_set():
        try:
            _heartbeat(config, job)
        except Exception:
            pass
        try:
            await asyncio.wait_for(stop.wait(), timeout=max(config.worker_heartbeat_seconds, 5))
        except TimeoutError:
            continue


async def _search_records(config: WorkerConfig, job: dict[str, Any]) -> tuple[list[Any], dict[str, Any]]:
    provider = get_company_search_provider(config)
    filters = _filters_from_dict(_job_filters_snapshot(config, job))

    async def progress_callback(progress: ProviderProgress) -> None:
        _patch_progress(config, job, progress)

    async def cancel_callback() -> bool:
        return _cancel_requested(config, job)

    result = await provider.search(filters, progress_callback=progress_callback, cancel_callback=cancel_callback)
    if result.stopped_reason == "cancelled":
        raise JobCancelled("Job cancelado pelo administrador.")
    return list(result.records), result.stats()


async def _search_records_with_heartbeat(config: WorkerConfig, job: dict[str, Any]) -> tuple[list[Any], dict[str, Any]]:
    stop = asyncio.Event()
    heartbeat_task = asyncio.create_task(_heartbeat_loop(config, job, stop))
    try:
        return await _search_records(config, job)
    finally:
        stop.set()
        await heartbeat_task


def _sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def _verified_export_files(export_result: dict[str, Any]) -> list[Path]:
    export_path = str(export_result.get("path") or "")
    files = [str(path) for path in (export_result.get("files") or [])] or [export_path]
    verified: list[Path] = []
    for raw_path in files:
        if not raw_path:
            continue
        path = Path(raw_path)
        if not path.exists() or path.stat().st_size <= 0:
            raise RuntimeError(f"Export local ausente ou vazio: {path}")
        verified.append(path)
    if not verified:
        raise RuntimeError("Nenhum arquivo de export foi gerado.")
    return verified


def _complete_request(config: WorkerConfig, job: dict[str, Any], export_result: dict[str, Any], search_stats: dict[str, Any]) -> None:
    request_id = str(job.get("request_id") or "")
    export_path = str(export_result.get("path") or "")
    fields = list(export_result.get("fields") or [])
    row_count = int(export_result.get("row_count") or 0)
    files = _verified_export_files(export_result)
    target_records = int((search_stats or {}).get("target_records") or 0)
    completed_status = "completed_partial" if target_records and row_count and row_count < target_records else "ready_for_delivery"
    completed_stats = {**search_stats, "partial": completed_status == "completed_partial", "delivered_records": row_count}
    for path in files:
        file_path = str(path)
        format_name = path.suffix.lstrip(".") or str(export_result.get("format") or "xlsx")
        checksum = _sha256_file(path)
        export_rows = _request_json(
            config,
            "GET",
            "exports",
            f"?select=*&job_id=eq.{urllib.parse.quote(str(job['id']))}&file_format=eq.{urllib.parse.quote(format_name)}&storage_path=eq.{urllib.parse.quote(file_path)}&limit=1",
        )
        if export_rows:
            continue
        export_id = str(uuid.uuid4())
        _insert(
            config,
            "exports",
            {
                "id": export_id,
                "request_id": request_id,
                "job_id": job.get("id"),
                "status": "ready",
                "row_count": row_count,
                "file_name": Path(file_path).name,
                "file_format": format_name,
                "storage_provider": "local",
                "storage_bucket": None,
                "storage_path": file_path,
                "filters_snapshot": job.get("filters_snapshot") or {},
                "fields_snapshot": fields,
                "generated_by": "minha_receita_worker",
            },
        )
        _insert(
            config,
            "export_files",
            {
                "export_id": export_id,
                "request_id": request_id,
                "file_name": path.name,
                "file_format": format_name,
                "storage_provider": "local",
                "storage_path": file_path,
                "byte_size": path.stat().st_size,
                "checksum": checksum,
                "checksum_sha256": checksum,
            },
        )
    _patch(
        config,
        "rfb_processing_jobs",
        _job_id_query(job),
        {
            "status": completed_status,
            "progress": 100,
            "current_step": completed_status,
            "search_stats": completed_stats,
            "finished_at": _now_iso(),
            "lease_expires_at": None,
            "worker_id": None,
            "updated_at": _now_iso(),
        },
    )
    if request_id:
        _patch(config, "custom_requests", f"?id=eq.{urllib.parse.quote(request_id)}", {"status": "ready_for_delivery", "updated_at": _now_iso()})


def _schedule_retry(config: WorkerConfig, job: dict[str, Any], error: Exception) -> dict[str, Any] | None:
    attempts = int(job.get("attempts") or 1)
    max_attempts = int(job.get("max_attempts") or config.job_max_attempts)
    if attempts >= max_attempts:
        return None
    delay_seconds = [30, 120, 300][min(max(attempts - 1, 0), 2)]
    next_retry = (datetime.now(UTC) + timedelta(seconds=delay_seconds)).isoformat()
    message = str(error)
    _patch(
        config,
        "rfb_processing_jobs",
        _job_id_query(job),
        {
            "status": "queued",
            "current_step": "retry_scheduled",
            "progress": 0,
            "error_message": message,
            "provider_error_code": type(error).__name__,
            "worker_id": None,
            "lease_expires_at": None,
            "next_retry_at": next_retry,
            "updated_at": _now_iso(),
        },
    )
    _log(config, job, "retry_scheduled", f"Falha temporaria; nova tentativa em {delay_seconds}s. {message}", "warning")
    return {"ok": False, "status": "retry_scheduled", "jobId": job.get("id"), "nextRetryAt": next_retry, "message": message}


def process_one_queued_job(config: WorkerConfig) -> dict[str, Any]:
    _recover_stale_jobs(config)
    job = _queued_job(config)
    if not job:
        return {"ok": True, "status": "idle", "message": "Nenhum job queued encontrado."}
    try:
        _log(config, job, "running", "Worker local assumiu o job CNPJ.")
        filters = _filters_from_dict(_job_filters_snapshot(config, job))
        records, search_stats = asyncio.run(_search_records_with_heartbeat(config, job))
        if not records:
            _patch(
                config,
                "rfb_processing_jobs",
                _job_id_query(job),
                {
                    "status": "no_results",
                    "progress": 100,
                    "current_step": "no_results",
                    "search_stats": search_stats,
                    "finished_at": _now_iso(),
                    "lease_expires_at": None,
                    "worker_id": None,
                    "updated_at": _now_iso(),
                },
            )
            if job.get("request_id"):
                _patch(config, "custom_requests", f"?id=eq.{urllib.parse.quote(str(job.get('request_id')))}", {"status": "analysis", "updated_at": _now_iso()})
            _log(config, job, "no_results", "Minha Receita nao retornou empresas elegiveis para os filtros informados.", "warning")
            return {"ok": False, "status": "no_results", "jobId": job.get("id"), "message": "Nenhum registro encontrado para os filtros."}
        _patch(
            config,
            "rfb_processing_jobs",
            _job_id_query(job),
            {"progress": 90, "current_step": "saving_local_files", "heartbeat_at": _now_iso(), "lease_expires_at": _lease_expires_iso(config), "updated_at": _now_iso()},
        )
        export_result = run_job(records, filters, Path(config.output_dir))
        _complete_request(config, job, export_result, search_stats)
        _log(config, job, "ready_for_delivery", f"Export local gerado com {export_result.get('row_count', 0)} linhas.")
        return {"ok": True, "status": "ready_for_delivery", "jobId": job.get("id"), "export": export_result}
    except JobCancelled as error:
        message = str(error)
        _patch(
            config,
            "rfb_processing_jobs",
            _job_id_query(job),
            {
                "status": "cancelled",
                "current_step": "cancelled",
                "error_message": message,
                "worker_id": None,
                "lease_expires_at": None,
                "finished_at": _now_iso(),
                "updated_at": _now_iso(),
            },
        )
        if job.get("request_id"):
            _patch(config, "custom_requests", f"?id=eq.{urllib.parse.quote(str(job.get('request_id')))}", {"status": "cancelled", "updated_at": _now_iso()})
        _log(config, job, "cancelled", message, "warning")
        return {"ok": False, "status": "cancelled", "jobId": job.get("id"), "message": message}
    except ProviderUnavailableError as error:
        retry = _schedule_retry(config, job, error)
        if retry:
            return retry
        message = str(error)
        _patch(
            config,
            "rfb_processing_jobs",
            _job_id_query(job),
            {
                "status": "failed",
                "current_step": "failed",
                "error_message": message,
                "provider_error_code": type(error).__name__,
                "worker_id": None,
                "lease_expires_at": None,
                "finished_at": _now_iso(),
                "updated_at": _now_iso(),
            },
        )
        _log(config, job, "failed", message, "error")
        return {"ok": False, "status": "failed", "jobId": job.get("id"), "message": message}
    except QueryTooBroadError as error:
        message = str(error)
        _patch(
            config,
            "rfb_processing_jobs",
            _job_id_query(job),
            {
                "status": "failed",
                "current_step": "invalid_filters",
                "error_message": message,
                "provider_error_code": type(error).__name__,
                "worker_id": None,
                "lease_expires_at": None,
                "finished_at": _now_iso(),
                "updated_at": _now_iso(),
            },
        )
        _log(config, job, "invalid_filters", message, "error")
        return {"ok": False, "status": "failed", "jobId": job.get("id"), "message": message}
    except Exception as error:
        message = str(error)
        _patch(
            config,
            "rfb_processing_jobs",
            _job_id_query(job),
            {
                "status": "failed",
                "current_step": "failed",
                "error_message": message,
                "provider_error_code": type(error).__name__,
                "worker_id": None,
                "lease_expires_at": None,
                "finished_at": _now_iso(),
                "updated_at": _now_iso(),
            },
        )
        _log(config, job, "failed", message, "error")
        return {"ok": False, "status": "failed", "jobId": job.get("id"), "message": message}


def watch_queue(config: WorkerConfig, once: bool = False, interval_seconds: int = 15) -> dict[str, Any]:
    if not config.supabase_url or not config.supabase_service_role_key:
        return {"ok": False, "status": "waiting_integration", "message": "Configure SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY."}
    processed = 0
    last: dict[str, Any] | None = None
    while True:
        try:
            last = process_one_queued_job(config)
            if last.get("status") != "idle":
                processed += 1
        except urllib.error.URLError as error:
            last = {"ok": False, "status": "network_error", "message": str(error)}
        if once:
            return {"ok": bool(last and last.get("ok")), "processed": processed, "last": last}
        time.sleep(max(interval_seconds, 3))
