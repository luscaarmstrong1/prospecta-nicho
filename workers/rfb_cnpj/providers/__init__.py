from __future__ import annotations

from workers.rfb_cnpj.config import WorkerConfig
from workers.rfb_cnpj.providers.base import CompanySearchProvider
from workers.rfb_cnpj.providers.minha_receita import MinhaReceitaProvider


def get_company_search_provider(config: WorkerConfig) -> CompanySearchProvider:
    provider = config.company_search_provider.strip().casefold()
    if provider in {"minha_receita", "minhareceita", "minha-receita"}:
        return MinhaReceitaProvider(config)
    raise ValueError(f"Provider de busca CNPJ nao suportado: {config.company_search_provider}")
