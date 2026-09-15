from __future__ import annotations

from dataclasses import dataclass
from os import getenv


@dataclass(frozen=True)
class WorkerConfig:
    data_dir: str = getenv("RFB_CNPJ_DATA_DIR", "data/rfb-cnpj")
    output_dir: str = getenv("RFB_CNPJ_OUTPUT_DIR", "outputs/rfb-cnpj")
    storage_bucket: str | None = getenv("R2_BUCKET") or getenv("SUPABASE_STORAGE_BUCKET")


def load_config() -> WorkerConfig:
    return WorkerConfig()
