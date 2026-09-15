from __future__ import annotations

from pathlib import Path


def storage_target(path: Path) -> dict[str, str]:
    return {"provider": "local", "path": str(path)}
