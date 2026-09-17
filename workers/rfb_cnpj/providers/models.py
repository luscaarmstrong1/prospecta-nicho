from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any

from workers.rfb_cnpj.models import CnpjRecord


@dataclass(frozen=True)
class ProviderHealth:
    provider: str
    status: str
    latency_ms: int | None = None
    message: str = ""


@dataclass(frozen=True)
class ProviderProgress:
    provider: str
    step: str
    pages_read: int = 0
    records_seen: int = 0
    records_kept: int = 0
    message: str = ""
    metadata: dict[str, Any] = field(default_factory=dict)


@dataclass(frozen=True)
class ProviderSearchResult:
    provider: str
    records: tuple[CnpjRecord, ...]
    pages_read: int
    records_seen: int
    records_kept: int
    stopped_reason: str
    warnings: tuple[str, ...] = ()
    extra_stats: dict[str, Any] = field(default_factory=dict)

    def stats(self) -> dict[str, Any]:
        return {
            "provider": self.provider,
            "pages_read": self.pages_read,
            "records_seen": self.records_seen,
            "records_kept": self.records_kept,
            "stopped_reason": self.stopped_reason,
            "warnings": list(self.warnings),
            **self.extra_stats,
        }


class ProviderUnavailableError(RuntimeError):
    pass


class QueryTooBroadError(ValueError):
    pass


class MunicipalityNotResolvedError(ValueError):
    pass
