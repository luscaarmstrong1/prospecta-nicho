from __future__ import annotations

from dataclasses import dataclass
from os import getenv
from pathlib import Path


def _default_data_dir() -> str:
    if getenv("RFB_CNPJ_DATA_DIR"):
        return getenv("RFB_CNPJ_DATA_DIR", "")
    home = Path.home()
    if home and str(home) not in {".", ""}:
        return str(home / "ProspectaNicho" / "RFB")
    return "data/rfb-cnpj"


def _default_output_dir() -> str:
    if getenv("RFB_CNPJ_OUTPUT_DIR"):
        return getenv("RFB_CNPJ_OUTPUT_DIR", "")
    home = Path.home()
    if home and str(home) not in {".", ""}:
        return str(home / "ProspectaNicho" / "Exports")
    return "outputs/rfb-cnpj"


def _default_cache_dir() -> str:
    if getenv("MINHA_RECEITA_CACHE_DIR"):
        return getenv("MINHA_RECEITA_CACHE_DIR", "")
    home = Path.home()
    if home and str(home) not in {".", ""}:
        return str(home / "ProspectaNicho" / "Cache")
    return "outputs/rfb-cnpj/cache"


@dataclass(frozen=True)
class WorkerConfig:
    data_dir: str = _default_data_dir()
    output_dir: str = _default_output_dir()
    export_delivery_mode: str = getenv("EXPORT_DELIVERY_MODE") or "local"
    storage_bucket: str | None = getenv("R2_BUCKET") or getenv("SUPABASE_STORAGE_BUCKET")
    supabase_url: str | None = getenv("SUPABASE_URL")
    supabase_service_role_key: str | None = getenv("SUPABASE_SERVICE_ROLE_KEY")
    worker_id: str = getenv("RFB_WORKER_ID") or "prospectanicho-local-worker"
    company_search_provider: str = getenv("COMPANY_SEARCH_PROVIDER") or "minha_receita"
    minha_receita_base_url: str = getenv("MINHA_RECEITA_BASE_URL") or "https://minhareceita.org"
    minha_receita_page_limit: int = int(getenv("MINHA_RECEITA_PAGE_LIMIT") or "1024")
    minha_receita_timeout_seconds: float = float(getenv("MINHA_RECEITA_TIMEOUT_SECONDS") or "40")
    minha_receita_max_retries: int = int(getenv("MINHA_RECEITA_MAX_RETRIES") or "5")
    minha_receita_max_concurrency: int = int(getenv("MINHA_RECEITA_MAX_CONCURRENCY") or "3")
    minha_receita_min_interval_ms: int = int(getenv("MINHA_RECEITA_MIN_INTERVAL_MS") or "200")
    minha_receita_cache_ttl_hours: int = int(getenv("MINHA_RECEITA_CACHE_TTL_HOURS") or "24")
    minha_receita_max_pages_per_query: int = int(getenv("MINHA_RECEITA_MAX_PAGES_PER_QUERY") or "1000")
    minha_receita_oversample_factor: int = int(getenv("MINHA_RECEITA_OVERSAMPLE_FACTOR") or "2")
    minha_receita_cache_dir: str = _default_cache_dir()
    ibge_timeout_seconds: float = float(getenv("IBGE_TIMEOUT_SECONDS") or "20")
    ibge_cache_ttl_hours: int = int(getenv("IBGE_CACHE_TTL_HOURS") or "720")
    export_retention_days: int = int(getenv("EXPORT_RETENTION_DAYS") or "30")
    worker_lease_seconds: int = int(getenv("RFB_WORKER_LEASE_SECONDS") or "300")
    worker_heartbeat_seconds: int = int(getenv("RFB_WORKER_HEARTBEAT_SECONDS") or "30")
    worker_heartbeat_max_failures: int = int(getenv("RFB_WORKER_HEARTBEAT_MAX_FAILURES") or "3")
    job_max_attempts: int = int(getenv("RFB_JOB_MAX_ATTEMPTS") or "3")


def load_config() -> WorkerConfig:
    config = WorkerConfig()
    if config.export_delivery_mode not in {"local", "storage"}:
        raise ValueError("EXPORT_DELIVERY_MODE deve ser 'local' ou 'storage'.")
    if config.worker_heartbeat_seconds < 5:
        raise ValueError("RFB_WORKER_HEARTBEAT_SECONDS deve ser pelo menos 5.")
    if config.worker_lease_seconds <= config.worker_heartbeat_seconds * 2:
        raise ValueError("RFB_WORKER_LEASE_SECONDS deve ser maior que o dobro do heartbeat.")
    if config.worker_heartbeat_max_failures < 1 or config.job_max_attempts < 1:
        raise ValueError("Limites de falha e tentativas devem ser positivos.")
    return config
