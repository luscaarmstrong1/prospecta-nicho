from __future__ import annotations

import json
from os import getenv
from pathlib import Path


def normalize_city(value: str) -> str:
    return " ".join(value.strip().upper().split())


def cities_for_concessionaria(name: str) -> tuple[str, ...]:
    path = getenv("RFB_CNPJ_CITY_MAPPING_FILE")
    if not path:
        return ()
    file_path = Path(path)
    if not file_path.exists():
        return ()
    payload = json.loads(file_path.read_text(encoding="utf-8"))
    if not isinstance(payload, dict):
        return ()
    cities = payload.get(name) or payload.get(name.strip().casefold())
    if not isinstance(cities, list):
        return ()
    return tuple(normalize_city(str(city)) for city in cities if str(city).strip())
