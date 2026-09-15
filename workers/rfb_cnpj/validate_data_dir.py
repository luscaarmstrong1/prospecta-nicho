from __future__ import annotations

from pathlib import Path

from workers.rfb_cnpj.discover import expected_groups
from workers.rfb_cnpj.data_cli import current_snapshot_dir, required_file_names, validate_snapshot


def validate_data_dir(path: Path) -> dict[str, object]:
    if not path.exists():
        return {"ok": False, "status": "waiting_data", "path": str(path), "missing": list(expected_groups())}
    current_dir = current_snapshot_dir(path)
    if current_dir.exists() and any((current_dir / name).exists() for name in required_file_names()):
        result = validate_snapshot(current_dir)
        return {**result, "status": "ready" if result["ok"] else "waiting_data"}
    files = [item for item in path.glob("*") if item.is_file() and item.suffix.lower() in {".csv", ".zip"}]
    existing = {item.name.split(".")[0] for item in files}
    missing = [group for group in expected_groups() if group not in existing]
    return {
        "ok": not missing,
        "status": "ready" if not missing else "waiting_data",
        "path": str(path),
        "files": [item.name for item in files],
        "missing": missing,
        "accepted_formats": ["csv", "zip"],
    }
