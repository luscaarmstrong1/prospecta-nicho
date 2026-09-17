from __future__ import annotations

import asyncio
import hashlib
import json
import logging
import threading
import time
import urllib.error
import urllib.parse
import urllib.request
from datetime import UTC, datetime, timedelta
from pathlib import Path
from typing import Any

from workers.rfb_cnpj.cli import _filters_from_dict
from workers.rfb_cnpj.config import WorkerConfig
from workers.rfb_cnpj.job_runner import run_job
from workers.rfb_cnpj.providers import get_company_search_provider
from workers.rfb_cnpj.providers.models import ProviderProgress, ProviderUnavailableError, QueryTooBroadError
from workers.rfb_cnpj.providers.models import MunicipalityNotResolvedError
from workers.rfb_cnpj.suppression import SuppressionRule, apply_suppression, normalize_rule

LOGGER = logging.getLogger(__name__)


class JobCancelled(RuntimeError):
    pass


class JobOwnershipLost(RuntimeError):
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
        if "JOB_OWNERSHIP_LOST" in detail:
            raise JobOwnershipLost("O job nao pertence mais a esta execucao do worker.") from error
        raise RuntimeError(f"RPC Supabase {function_name} falhou. Aplique as migrations mais recentes. {detail}") from error


def _insert(config: WorkerConfig, table: str, body: dict[str, Any]) -> None:
    _request_json(config, "POST", table, "", body)


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
            "metadata": {"worker_id": config.worker_id, "run_id": job.get("run_id")},
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


def _owned_rpc_payload(config: WorkerConfig, job: dict[str, Any]) -> dict[str, Any]:
    run_id = str(job.get("run_id") or "")
    if not run_id:
        raise JobOwnershipLost("Job recebido sem run_id; aplique as migrations da fila.")
    return {"p_job_id": job["id"], "p_run_id": run_id, "p_worker_id": config.worker_id}


def _heartbeat(
    config: WorkerConfig,
    job: dict[str, Any],
    current_step: str | None = None,
    progress: int | None = None,
    search_stats: dict[str, Any] | None = None,
) -> None:
    payload = {
        **_owned_rpc_payload(config, job),
        "p_lease_seconds": config.worker_lease_seconds,
        "p_current_step": current_step,
        "p_progress": progress,
        "p_search_stats": search_stats,
    }
    rows = _rpc(config, "heartbeat_rfb_job", payload)
    if not isinstance(rows, list) or not rows:
        raise JobOwnershipLost("Lease perdido; a execucao atual nao pode mais alterar o job.")


def _transition_job(
    config: WorkerConfig,
    job: dict[str, Any],
    *,
    status: str,
    step: str,
    progress: int | None = None,
    error: Exception | None = None,
    search_stats: dict[str, Any] | None = None,
    next_retry_at: str | None = None,
    request_status: str | None = None,
) -> None:
    rows = _rpc(
        config,
        "transition_rfb_job",
        {
            **_owned_rpc_payload(config, job),
            "p_status": status,
            "p_current_step": step,
            "p_progress": progress,
            "p_error_message": str(error) if error else None,
            "p_provider_error_code": type(error).__name__ if error else None,
            "p_search_stats": search_stats,
            "p_next_retry_at": next_retry_at,
            "p_request_status": request_status,
        },
    )
    if not isinstance(rows, list) or not rows:
        raise JobOwnershipLost("Transicao recusada porque o lease do job foi perdido.")


class HeartbeatGuard:
    def __init__(self, config: WorkerConfig, job: dict[str, Any]) -> None:
        self.config = config
        self.job = job
        self._stop = threading.Event()
        self._error: Exception | None = None
        self._thread = threading.Thread(target=self._run, name=f"rfb-heartbeat-{job.get('id')}", daemon=True)

    def start(self) -> None:
        _heartbeat(self.config, self.job, "starting", 6)
        self._thread.start()

    def _run(self) -> None:
        failures = 0
        while not self._stop.wait(max(self.config.worker_heartbeat_seconds, 5)):
            try:
                _heartbeat(self.config, self.job)
                failures = 0
            except Exception as error:
                failures += 1
                LOGGER.warning(
                    "heartbeat_warning job_id=%s run_id=%s failure=%s max_failures=%s error=%s",
                    self.job.get("id"),
                    self.job.get("run_id"),
                    failures,
                    self.config.worker_heartbeat_max_failures,
                    type(error).__name__,
                )
                if isinstance(error, JobOwnershipLost) or failures >= self.config.worker_heartbeat_max_failures:
                    self._error = error
                    self._stop.set()
                    return

    def check(self) -> None:
        if self._error:
            raise JobOwnershipLost(f"Heartbeat interrompido: {self._error}") from self._error

    def stop(self) -> None:
        self._stop.set()
        if self._thread.is_alive():
            self._thread.join(timeout=max(self.config.worker_heartbeat_seconds, 5) + 2)


def _cancel_requested(config: WorkerConfig, job: dict[str, Any]) -> bool:
    run_id = urllib.parse.quote(str(job.get("run_id") or ""))
    worker_id = urllib.parse.quote(config.worker_id)
    rows = _request_json(
        config,
        "GET",
        "rfb_processing_jobs",
        f"{_job_id_query(job)}&run_id=eq.{run_id}&worker_id=eq.{worker_id}&status=eq.running&select=cancel_requested_at&limit=1",
    )
    if not isinstance(rows, list) or not rows:
        raise JobOwnershipLost("Job nao pertence mais a esta execucao.")
    return bool(rows[0].get("cancel_requested_at"))


def _patch_progress(config: WorkerConfig, job: dict[str, Any], progress: ProviderProgress) -> None:
    percent = 10
    if progress.step == "querying_provider":
        queries_total = max(int(progress.metadata.get("queries_total") or 1), 1)
        queries_completed = max(int(progress.metadata.get("queries_completed") or 0), 0)
        page_limit = max(config.minha_receita_max_pages_per_query, 1)
        completion = max(
            queries_completed / queries_total,
            min(progress.pages_read / (queries_total * page_limit), 0.98),
        )
        percent = min(69, 20 + int(completion * 49))
    elif progress.step == "search_finished":
        percent = 70
    search_stats = {
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
    }
    _heartbeat(config, job, progress.step, percent, search_stats)
    if progress.message or progress.step == "querying_provider":
        _log(
            config,
            job,
            progress.step,
            progress.message or f"Pagina {progress.pages_read}: {progress.records_kept} registros elegiveis.",
        )


def _suppression_rules(config: WorkerConfig) -> list[SuppressionRule]:
    rows = _request_json(
        config,
        "GET",
        "suppression_list",
        "?select=suppression_type,suppression_value&is_active=eq.true",
    )
    rules: list[SuppressionRule] = []
    for row in rows if isinstance(rows, list) else []:
        if not isinstance(row, dict):
            continue
        rule = normalize_rule(row.get("suppression_type"), row.get("suppression_value"))
        if rule:
            rules.append(rule)
    return rules


async def _search_records(
    config: WorkerConfig,
    job: dict[str, Any],
    guard: HeartbeatGuard,
) -> tuple[list[Any], dict[str, Any]]:
    provider = get_company_search_provider(config)
    filters = _filters_from_dict(_job_filters_snapshot(config, job))

    async def progress_callback(progress: ProviderProgress) -> None:
        guard.check()
        _patch_progress(config, job, progress)

    async def cancel_callback() -> bool:
        guard.check()
        return _cancel_requested(config, job)

    result = await provider.search(filters, progress_callback=progress_callback, cancel_callback=cancel_callback)
    if result.stopped_reason == "cancelled":
        raise JobCancelled("Job cancelado pelo administrador.")
    if _cancel_requested(config, job):
        raise JobCancelled("Job cancelado pelo administrador.")
    _heartbeat(config, job, "suppression", 76, result.stats())
    records, suppressed = apply_suppression(result.records, _suppression_rules(config))
    stats = result.stats()
    stats["suppressed_records"] = suppressed
    stats["records_after_suppression"] = len(records)
    if _cancel_requested(config, job):
        raise JobCancelled("Job cancelado pelo administrador.")
    return records, stats


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


def _cleanup_export_files(export_result: dict[str, Any] | None) -> None:
    if not export_result:
        return
    for raw_path in export_result.get("files") or []:
        if raw_path:
            Path(str(raw_path)).unlink(missing_ok=True)


def _complete_request(
    config: WorkerConfig,
    job: dict[str, Any],
    export_result: dict[str, Any],
    search_stats: dict[str, Any],
) -> dict[str, Any]:
    fields = list(export_result.get("fields") or [])
    row_count = int(export_result.get("row_count") or 0)
    files = _verified_export_files(export_result)
    target_records = int((search_stats or {}).get("target_records") or 0)
    completed_status = "completed_partial" if target_records and row_count and row_count < target_records else "ready_for_delivery"
    completed_stats = {**search_stats, "partial": completed_status == "completed_partial", "delivered_records": row_count}
    manifest: list[dict[str, Any]] = []
    for path in files:
        format_name = path.suffix.lstrip(".") or str(export_result.get("format") or "xlsx")
        checksum = _sha256_file(path)
        manifest.append(
            {
                "name": path.name,
                "format": format_name,
                "path": str(path.resolve()),
                "byte_size": path.stat().st_size,
                "checksum_sha256": checksum,
            }
        )
    result = _rpc(
        config,
        "finalize_local_rfb_job",
        {
            **_owned_rpc_payload(config, job),
            "p_job_status": completed_status,
            "p_request_status": "ready_for_delivery",
            "p_row_count": row_count,
            "p_search_stats": completed_stats,
            "p_files": manifest,
            "p_filters_snapshot": job.get("filters_snapshot") or {},
            "p_fields_snapshot": fields,
        },
    )
    if not isinstance(result, dict):
        raise RuntimeError("Finalizacao transacional retornou uma resposta invalida.")
    return result


def _schedule_retry(config: WorkerConfig, job: dict[str, Any], error: Exception) -> dict[str, Any] | None:
    attempts = int(job.get("attempts") or 1)
    max_attempts = int(job.get("max_attempts") or config.job_max_attempts)
    if attempts >= max_attempts:
        return None
    delay_seconds = [30, 120, 300][min(max(attempts - 1, 0), 2)]
    next_retry = (datetime.now(UTC) + timedelta(seconds=delay_seconds)).isoformat()
    message = str(error)
    _transition_job(
        config,
        job,
        status="queued",
        step="retry_scheduled",
        progress=0,
        error=error,
        next_retry_at=next_retry,
    )
    _log(config, job, "retry_scheduled", f"Falha temporaria; nova tentativa em {delay_seconds}s. {message}", "warning")
    return {"ok": False, "status": "retry_scheduled", "jobId": job.get("id"), "nextRetryAt": next_retry, "message": message}


def process_one_queued_job(config: WorkerConfig) -> dict[str, Any]:
    _recover_stale_jobs(config)
    job = _queued_job(config)
    if not job:
        return {"ok": True, "status": "idle", "message": "Nenhum job queued encontrado."}
    guard = HeartbeatGuard(config, job)
    export_result: dict[str, Any] | None = None
    finalized_successfully = False
    try:
        guard.start()
        _log(config, job, "running", "Worker local assumiu o job CNPJ.")
        filters_snapshot = _job_filters_snapshot(config, job)
        job["filters_snapshot"] = filters_snapshot
        filters = _filters_from_dict(filters_snapshot)
        records, search_stats = asyncio.run(_search_records(config, job, guard))
        guard.check()
        if not records:
            _transition_job(
                config,
                job,
                status="no_results",
                step="no_results",
                progress=100,
                search_stats=search_stats,
                request_status="analysis",
            )
            return {"ok": False, "status": "no_results", "jobId": job.get("id"), "message": "Nenhum registro encontrado para os filtros."}
        if _cancel_requested(config, job):
            raise JobCancelled("Job cancelado pelo administrador.")
        _heartbeat(config, job, "scoring", 82, search_stats)
        _heartbeat(config, job, "saving_local_files", 87, search_stats)
        export_result = run_job(records, filters, Path(config.output_dir), search_stats)
        guard.check()
        if _cancel_requested(config, job):
            raise JobCancelled("Job cancelado pelo administrador.")
        _heartbeat(config, job, "finalizing", 98, search_stats)
        finalized = _complete_request(config, job, export_result, search_stats)
        finalized_successfully = True
        return {
            "ok": True,
            "status": finalized.get("status", "ready_for_delivery"),
            "jobId": job.get("id"),
            "exportId": finalized.get("export_id"),
            "export": export_result,
        }
    except JobOwnershipLost as error:
        return {"ok": False, "status": "ownership_lost", "jobId": job.get("id"), "message": str(error)}
    except JobCancelled as error:
        message = str(error)
        try:
            _transition_job(
                config,
                job,
                status="cancelled",
                step="cancelled",
                error=error,
                request_status="cancelled",
            )
        except JobOwnershipLost as ownership_error:
            return {"ok": False, "status": "ownership_lost", "jobId": job.get("id"), "message": str(ownership_error)}
        return {"ok": False, "status": "cancelled", "jobId": job.get("id"), "message": message}
    except ProviderUnavailableError as error:
        try:
            retry = _schedule_retry(config, job, error)
        except JobOwnershipLost as ownership_error:
            return {"ok": False, "status": "ownership_lost", "jobId": job.get("id"), "message": str(ownership_error)}
        if retry:
            return retry
        message = str(error)
        try:
            _transition_job(
                config,
                job,
                status="failed",
                step="failed",
                error=error,
                request_status="analysis",
            )
        except JobOwnershipLost as ownership_error:
            return {"ok": False, "status": "ownership_lost", "jobId": job.get("id"), "message": str(ownership_error)}
        return {"ok": False, "status": "failed", "jobId": job.get("id"), "message": message}
    except (QueryTooBroadError, MunicipalityNotResolvedError) as error:
        message = str(error)
        try:
            _transition_job(
                config,
                job,
                status="failed",
                step="invalid_filters",
                error=error,
                request_status="analysis",
            )
        except JobOwnershipLost as ownership_error:
            return {"ok": False, "status": "ownership_lost", "jobId": job.get("id"), "message": str(ownership_error)}
        return {"ok": False, "status": "failed", "jobId": job.get("id"), "message": message}
    except Exception as error:
        message = str(error)
        try:
            _transition_job(
                config,
                job,
                status="failed",
                step="failed",
                error=error,
                request_status="analysis",
            )
        except JobOwnershipLost as ownership_error:
            return {
                "ok": False,
                "status": "ownership_lost",
                "jobId": job.get("id"),
                "message": str(ownership_error),
            }
        return {"ok": False, "status": "failed", "jobId": job.get("id"), "message": message}
    finally:
        guard.stop()
        if not finalized_successfully:
            _cleanup_export_files(export_result)


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
