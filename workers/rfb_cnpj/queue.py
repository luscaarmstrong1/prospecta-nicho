from __future__ import annotations

import asyncio
import json
import time
import urllib.error
import urllib.parse
import urllib.request
from datetime import UTC, datetime
from pathlib import Path
from typing import Any

from workers.rfb_cnpj.cli import _filters_from_dict
from workers.rfb_cnpj.config import WorkerConfig
from workers.rfb_cnpj.job_runner import run_job
from workers.rfb_cnpj.providers import get_company_search_provider
from workers.rfb_cnpj.providers.models import ProviderProgress


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


def _job_id_query(job: dict[str, Any]) -> str:
    return f"?id=eq.{urllib.parse.quote(str(job['id']))}"


def _queued_job(config: WorkerConfig) -> dict[str, Any] | None:
    query = "?select=*&status=eq.queued&order=created_at.asc&limit=1"
    rows = _request_json(config, "GET", "rfb_processing_jobs", query)
    if not isinstance(rows, list) or not rows:
        return None
    job = rows[0]
    claim_query = f"?id=eq.{urllib.parse.quote(str(job['id']))}&status=eq.queued"
    claimed = _patch(
        config,
        "rfb_processing_jobs",
        claim_query,
        {
            "status": "running",
            "progress": 5,
            "current_step": "claimed",
            "heartbeat_at": _now_iso(),
            "lease_expires_at": None,
            "worker_id": config.worker_id,
            "attempts": int(job.get("attempts") or 0) + 1,
            "started_at": _now_iso(),
            "updated_at": _now_iso(),
        },
    )
    return claimed[0] if claimed else None


def _cancel_requested(config: WorkerConfig, job: dict[str, Any]) -> bool:
    rows = _request_json(config, "GET", "rfb_processing_jobs", f"{_job_id_query(job)}&select=cancel_requested_at&limit=1")
    if not isinstance(rows, list) or not rows:
        return False
    return bool(rows[0].get("cancel_requested_at"))


def _patch_progress(config: WorkerConfig, job: dict[str, Any], progress: ProviderProgress) -> None:
    percent = 10
    if progress.step == "page_read":
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
                "pages_read": progress.pages_read,
                "records_seen": progress.records_seen,
                "records_kept": progress.records_kept,
                "message": progress.message,
                "metadata": progress.metadata,
            },
            "heartbeat_at": _now_iso(),
            "updated_at": _now_iso(),
        },
    )
    if progress.message or progress.step == "page_read":
        _log(
            config,
            job,
            progress.step,
            progress.message or f"Pagina {progress.pages_read}: {progress.records_kept} registros elegiveis.",
        )


async def _search_records(config: WorkerConfig, job: dict[str, Any]) -> tuple[list[Any], dict[str, Any]]:
    provider = get_company_search_provider(config)
    filters = _filters_from_dict(job.get("filters_snapshot") or {})

    async def progress_callback(progress: ProviderProgress) -> None:
        _patch_progress(config, job, progress)

    async def cancel_callback() -> bool:
        return _cancel_requested(config, job)

    result = await provider.search(filters, progress_callback=progress_callback, cancel_callback=cancel_callback)
    if result.stopped_reason == "cancelled":
        raise RuntimeError("Job cancelado pelo administrador.")
    return list(result.records), result.stats()


def _complete_request(config: WorkerConfig, job: dict[str, Any], export_result: dict[str, Any], search_stats: dict[str, Any]) -> None:
    request_id = str(job.get("request_id") or "")
    export_path = str(export_result.get("path") or "")
    format_name = str(export_result.get("format") or Path(export_path).suffix.lstrip(".") or "xlsx")
    fields = list(export_result.get("fields") or [])
    row_count = int(export_result.get("row_count") or 0)
    export_rows = _request_json(
        config,
        "GET",
        "exports",
        f"?select=*&job_id=eq.{urllib.parse.quote(str(job['id']))}&file_format=eq.{urllib.parse.quote(format_name)}&limit=1",
    )
    if not export_rows:
        _insert(
            config,
            "exports",
            {
                "request_id": request_id,
                "job_id": job.get("id"),
                "status": "ready",
                "row_count": row_count,
                "file_name": Path(export_path).name,
                "file_format": format_name,
                "storage_provider": "local",
                "storage_bucket": config.storage_bucket,
                "storage_path": export_path,
                "filters_snapshot": job.get("filters_snapshot") or {},
                "fields_snapshot": fields,
                "generated_by": "rfb_worker_minha_receita",
            },
        )
    _patch(
        config,
        "rfb_processing_jobs",
        _job_id_query(job),
        {
            "status": "completed",
            "progress": 100,
            "current_step": "completed",
            "search_stats": search_stats,
            "finished_at": _now_iso(),
            "updated_at": _now_iso(),
        },
    )
    if request_id:
        _patch(config, "custom_requests", f"?id=eq.{urllib.parse.quote(request_id)}", {"status": "ready", "updated_at": _now_iso()})


def process_one_queued_job(config: WorkerConfig) -> dict[str, Any]:
    job = _queued_job(config)
    if not job:
        return {"ok": True, "status": "idle", "message": "Nenhum job queued encontrado."}
    try:
        _log(config, job, "running", "Worker local assumiu o job CNPJ.")
        filters = _filters_from_dict(job.get("filters_snapshot") or {})
        records, search_stats = asyncio.run(_search_records(config, job))
        if not records:
            raise RuntimeError("A busca na Minha Receita nao retornou empresas elegiveis para os filtros informados.")
        _patch(
            config,
            "rfb_processing_jobs",
            _job_id_query(job),
            {"progress": 35, "current_step": "exporting", "updated_at": _now_iso()},
        )
        export_result = run_job(records, filters, Path(config.output_dir))
        _complete_request(config, job, export_result, search_stats)
        _log(config, job, "completed", f"Export gerado com {export_result.get('row_count', 0)} linhas.")
        return {"ok": True, "status": "completed", "jobId": job.get("id"), "export": export_result}
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
