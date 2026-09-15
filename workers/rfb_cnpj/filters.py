from __future__ import annotations

from collections.abc import Iterable

from workers.rfb_cnpj.city_mapping import cities_for_concessionaria, normalize_city
from workers.rfb_cnpj.cnae_mapping import cnaes_for_segment
from workers.rfb_cnpj.models import CnpjFilters, CnpjRecord


def _same(value: str | None, expected: str | None) -> bool:
    if not expected:
        return True
    return str(value or "").strip().casefold() == expected.strip().casefold()


def _contains(value: str | None, expected: str | None) -> bool:
    if not expected:
        return True
    return expected.strip().casefold() in str(value or "").strip().casefold()


def matches_filters(record: CnpjRecord, filters: CnpjFilters) -> bool:
    cnaes = filters.cnaes or cnaes_for_segment(filters.segment)
    concessionaria_cities = cities_for_concessionaria(filters.concessionaria) if filters.concessionaria else ()
    if not _same(record.uf, filters.uf):
        return False
    if not _contains(record.municipio, filters.city):
        return False
    if concessionaria_cities and normalize_city(record.municipio) not in concessionaria_cities:
        return False
    if filters.registration_status != "QUALQUER" and not _same(record.situacao_cadastral, filters.registration_status):
        return False
    if filters.branch_type != "QUALQUER" and not _same(record.matriz_filial, filters.branch_type):
        return False
    if filters.company_size and "QUALQUER" not in filters.company_size and record.porte not in filters.company_size:
        return False
    if cnaes and record.cnae_principal not in cnaes:
        return False
    if filters.min_capital_social is not None and (record.capital_social or 0) < filters.min_capital_social:
        return False
    if filters.max_capital_social is not None and (record.capital_social or 0) > filters.max_capital_social:
        return False
    return True


def apply_filters(records: Iterable[CnpjRecord], filters: CnpjFilters) -> list[CnpjRecord]:
    selected: list[CnpjRecord] = []
    for record in records:
        if matches_filters(record, filters):
            selected.append(record)
        if len(selected) >= filters.quantity:
            break
    return selected
