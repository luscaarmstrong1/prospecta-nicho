from __future__ import annotations


def db_status() -> dict[str, object]:
    return {"ok": True, "mode": "external-worker"}
