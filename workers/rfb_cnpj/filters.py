from __future__ import annotations

from collections.abc import Iterable
from datetime import UTC, date, datetime, timedelta

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


def _city_in_list(value: str | None, expected: tuple[str, ...]) -> bool:
    if not expected:
        return True
    normalized = normalize_city(str(value or ""))
    return normalized in {normalize_city(city) for city in expected if str(city).strip()}


def _digits(value: str | None) -> str:
    return "".join(char for char in str(value or "") if char.isdigit())


def _parse_date(value: str | None) -> date | None:
    text = str(value or "").strip()
    if not text:
        return None
    for pattern in ("%Y-%m-%d", "%d/%m/%Y"):
        try:
            return datetime.strptime(text, pattern).date()
        except ValueError:
            continue
    return None


def _opening_window(filters: CnpjFilters) -> tuple[date | None, date | None]:
    explicit_start = _parse_date(filters.opening_date_start)
    explicit_end = _parse_date(filters.opening_date_end)
    if explicit_start or explicit_end:
        return explicit_start, explicit_end
    period = str(filters.opening_period or "").strip().casefold()
    today = datetime.now(UTC).date()
    days_by_period = {
        "ultimos_30_dias": 30,
        "ultimos 30 dias": 30,
        "30": 30,
        "ultimos_60_dias": 60,
        "ultimos 60 dias": 60,
        "60": 60,
        "ultimos_90_dias": 90,
        "ultimos 90 dias": 90,
        "90": 90,
        "ultimos_6_meses": 183,
        "ultimos 6 meses": 183,
        "6_meses": 183,
    }
    days = days_by_period.get(period)
    if not days:
        return None, None
    return today - timedelta(days=days), today


def _secondary_cnaes(record: CnpjRecord) -> set[str]:
    secondary = record.extra.get("cnaes_secundarios")
    codes: set[str] = set()
    if isinstance(secondary, list):
        for item in secondary:
            if isinstance(item, dict):
                codes.add(_digits(str(item.get("codigo") or "")))
            else:
                codes.add(_digits(str(item)))
    return {code for code in codes if code}


def _record_matches_cnae(record: CnpjRecord, cnaes: tuple[str, ...], include_secondary: bool) -> bool:
    if not cnaes:
        return True
    normalized = {_digits(cnae) for cnae in cnaes if _digits(cnae)}
    if _digits(record.cnae_principal) in normalized:
        return True
    return include_secondary and bool(_secondary_cnaes(record).intersection(normalized))


def matches_filters(record: CnpjRecord, filters: CnpjFilters) -> bool:
    cnaes = filters.cnaes or cnaes_for_segment(filters.segment)
    concessionaria_cities = cities_for_concessionaria(filters.concessionaria) if filters.concessionaria else ()
    if not _same(record.uf, filters.uf):
        return False
    if not _contains(record.municipio, filters.city):
        return False
    if not _city_in_list(record.municipio, filters.cities):
        return False
    requested_codes = {_digits(filters.city_ibge_code), *(_digits(code) for code in filters.city_ibge_codes)}
    requested_codes.discard("")
    record_ibge = _digits(str(record.extra.get("codigo_municipio_ibge") or ""))
    if requested_codes and record_ibge and record_ibge not in requested_codes:
        return False
    if concessionaria_cities and normalize_city(record.municipio) not in concessionaria_cities:
        return False
    if filters.registration_status != "QUALQUER" and not _same(record.situacao_cadastral, filters.registration_status):
        return False
    if filters.branch_type != "QUALQUER" and not _same(record.matriz_filial, filters.branch_type):
        return False
    if filters.only_headquarters and not _same(record.matriz_filial, "MATRIZ"):
        return False
    if filters.company_size and "QUALQUER" not in filters.company_size and record.porte not in filters.company_size:
        return False
    if filters.exclude_mei and str(record.porte or "").strip().casefold() == "mei":
        return False
    if not _record_matches_cnae(record, cnaes, filters.include_secondary_cnaes):
        return False
    if filters.min_capital_social is not None and (record.capital_social is None or record.capital_social < filters.min_capital_social):
        return False
    if filters.max_capital_social is not None and (record.capital_social is None or record.capital_social > filters.max_capital_social):
        return False
    start, end = _opening_window(filters)
    opening_date = _parse_date(record.data_abertura)
    if start and (not opening_date or opening_date < start):
        return False
    if end and (not opening_date or opening_date > end):
        return False
    return True


def apply_filters(records: Iterable[CnpjRecord], filters: CnpjFilters) -> list[CnpjRecord]:
    return [record for record in records if matches_filters(record, filters)]
