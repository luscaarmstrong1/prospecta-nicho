from __future__ import annotations

from dataclasses import dataclass
from typing import Any

from workers.rfb_cnpj.city_mapping import cities_for_concessionaria
from workers.rfb_cnpj.cnae_mapping import cnaes_for_segment
from workers.rfb_cnpj.models import CnpjFilters
from workers.rfb_cnpj.municipality_resolver import ResolvedMunicipality, only_digits
from workers.rfb_cnpj.normalization import normalize_cnae
from workers.rfb_cnpj.providers.models import MunicipalityNotResolvedError, QueryTooBroadError


@dataclass(frozen=True)
class PlannedQuery:
    params: dict[str, Any]
    municipality: ResolvedMunicipality | None = None
    cnaes: tuple[str, ...] = ()


class QueryPlanner:
    def __init__(self, page_limit: int) -> None:
        self.page_limit = min(max(page_limit, 1), 1024)

    @staticmethod
    def cnaes_for(filters: CnpjFilters) -> tuple[str, ...]:
        return tuple(
            code
            for code in (normalize_cnae(cnae) for cnae in (filters.cnaes or cnaes_for_segment(filters.segment)))
            if code
        )

    @staticmethod
    def requested_cities(filters: CnpjFilters) -> tuple[str, ...]:
        cities = tuple(city for city in filters.cities if str(city).strip())
        if filters.city:
            cities = (*cities, filters.city)
        if filters.concessionaria:
            cities = (*cities, *cities_for_concessionaria(filters.concessionaria))
        unique: list[str] = []
        seen: set[str] = set()
        for city in cities:
            key = str(city).strip().casefold()
            if key and key not in seen:
                seen.add(key)
                unique.append(str(city).strip())
        return tuple(unique)

    async def build(self, filters: CnpjFilters, resolver: Any) -> tuple[PlannedQuery, ...]:
        cnaes = self.cnaes_for(filters)
        city_names = self.requested_cities(filters)
        city_codes = tuple(code for code in (only_digits(code) for code in filters.city_ibge_codes) if code)
        resolved: list[ResolvedMunicipality] = []

        if city_names:
            if len(city_names) > 1 and filters.city_ibge_code:
                raise MunicipalityNotResolvedError(
                    "city_ibge_code so pode ser usado quando uma unica cidade foi solicitada."
                )
            if city_codes and len(city_codes) != len(city_names):
                raise MunicipalityNotResolvedError(
                    "A quantidade de codigos IBGE deve corresponder exatamente a quantidade de cidades."
                )
            unresolved: list[str] = []
            for index, city in enumerate(city_names):
                known_code = None
                if len(city_names) == 1 and filters.city_ibge_code:
                    known_code = filters.city_ibge_code
                elif city_codes:
                    known_code = city_codes[index]
                municipality = await resolver.resolve(city, filters.uf, known_code)
                if municipality:
                    resolved.append(municipality)
                else:
                    unresolved.append(city)
            if unresolved:
                raise MunicipalityNotResolvedError(
                    "Nao foi possivel resolver no IBGE: " + ", ".join(unresolved) + ". Corrija cidade/UF antes de processar."
                )
        elif city_codes:
            for code in city_codes:
                municipality = resolver.from_known_code("", filters.uf, code)
                if municipality:
                    resolved.append(municipality)

        has_strong_filter = bool(resolved or cnaes)
        if not has_strong_filter:
            raise QueryTooBroadError("Informe cidade com codigo IBGE, CNAE, segmento mapeado ou concessionaria antes de processar a busca.")

        cnae_field = "cnae" if filters.include_secondary_cnaes else "cnae_fiscal"
        cnae_batches = [cnaes[index : index + 10] for index in range(0, len(cnaes), 10)] or [()]
        municipalities = resolved or [None]
        planned: list[PlannedQuery] = []
        for municipality in municipalities:
            for batch in cnae_batches:
                params: dict[str, Any] = {"limit": self.page_limit}
                if filters.uf:
                    params["uf"] = filters.uf.strip().upper()
                if municipality and municipality.ibge_code:
                    params["municipio"] = municipality.ibge_code
                if batch:
                    params[cnae_field] = ",".join(batch)
                planned.append(PlannedQuery(params=params, municipality=municipality, cnaes=tuple(batch)))
        return tuple(planned)
