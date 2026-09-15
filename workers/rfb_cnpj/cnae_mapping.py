from __future__ import annotations

import json
from os import getenv
from pathlib import Path

SEGMENT_CNAES = {
    "agencias de marketing": ("7311400", "7319002"),
    "contabilidades": ("6920601",),
    "energia solar": ("4321500", "3511501"),
}


def _load_external_mapping() -> dict[str, tuple[str, ...]]:
    path = getenv("RFB_CNPJ_CNAE_MAPPING_FILE")
    if not path:
        return {}
    file_path = Path(path)
    if not file_path.exists():
        return {}
    payload = json.loads(file_path.read_text(encoding="utf-8"))
    if not isinstance(payload, dict):
        return {}
    return {
        str(segment).strip().casefold(): tuple(str(cnae).replace(".", "").replace("-", "") for cnae in cnaes)
        for segment, cnaes in payload.items()
        if isinstance(cnaes, list)
    }


def cnaes_for_segment(segment: str) -> tuple[str, ...]:
    normalized = segment.strip().casefold()
    return _load_external_mapping().get(normalized) or SEGMENT_CNAES.get(normalized, ())
