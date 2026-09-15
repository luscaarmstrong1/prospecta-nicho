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


@dataclass(frozen=True)
class WorkerConfig:
    data_dir: str = _default_data_dir()
    output_dir: str = _default_output_dir()
    storage_bucket: str | None = getenv("R2_BUCKET") or getenv("SUPABASE_STORAGE_BUCKET")


def load_config() -> WorkerConfig:
    return WorkerConfig()
