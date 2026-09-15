from __future__ import annotations

from datetime import datetime, timezone


def log_line(message: str) -> str:
    return f"{datetime.now(timezone.utc).isoformat()} {message}"
