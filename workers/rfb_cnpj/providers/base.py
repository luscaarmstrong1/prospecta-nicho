from __future__ import annotations

from collections.abc import Awaitable, Callable
from typing import Any, Protocol

from workers.rfb_cnpj.models import CnpjFilters, CnpjRecord
from workers.rfb_cnpj.providers.models import ProviderHealth, ProviderProgress, ProviderSearchResult

ProgressCallback = Callable[[ProviderProgress], None | Awaitable[None]]
CancelCallback = Callable[[], bool | Awaitable[bool]]


class CompanySearchProvider(Protocol):
    name: str

    async def health(self) -> ProviderHealth:
        ...

    async def search(
        self,
        filters: CnpjFilters,
        progress_callback: ProgressCallback | None = None,
        cancel_callback: CancelCallback | None = None,
    ) -> ProviderSearchResult:
        ...

    async def get_company(self, cnpj: str) -> CnpjRecord | None:
        ...

    def normalize(self, raw_company: dict[str, Any]) -> CnpjRecord | None:
        ...
