from decimal import Decimal

import pytest

from workers.rfb_cnpj.normalization import (
    normalize_branch,
    normalize_cnae,
    normalize_cnpj,
    normalize_company_size,
    normalize_email,
    normalize_phone,
    normalize_registration_status,
    parse_date_iso,
    parse_decimal,
    tri_state_bool,
)


@pytest.mark.parametrize(
    ("raw", "expected"),
    [
        ("1.234,56", Decimal("1234.56")),
        ("1,234.56", Decimal("1234.56")),
        ("1234,56", Decimal("1234.56")),
        (1234.56, Decimal("1234.56")),
        (None, None),
        ("invalido", None),
    ],
)
def test_parse_decimal_accepts_provider_and_brazilian_formats(raw, expected):
    assert parse_decimal(raw) == expected


@pytest.mark.parametrize(
    ("raw", "expected"),
    [
        ("02", "ATIVA"),
        ("2", "ATIVA"),
        ("02 - Ativa", "ATIVA"),
        ("08 BAIXADA", "BAIXADA"),
        (None, "DESCONHECIDA"),
    ],
)
def test_registration_status_is_canonical(raw, expected):
    assert normalize_registration_status(raw) == expected


def test_company_branch_and_boolean_normalization_are_explicit():
    assert normalize_branch("01 - Matriz") == "MATRIZ"
    assert normalize_branch("2") == "FILIAL"
    assert normalize_branch(None) == "DESCONHECIDO"
    assert normalize_company_size("03") == "ME"
    assert normalize_company_size("Empresa de Pequeno Porte") == "EPP"
    assert tri_state_bool("sim") is True
    assert tri_state_bool("N") is False
    assert tri_state_bool("") is None


def test_identifiers_contacts_and_dates_are_validated():
    assert normalize_cnpj("00.000.000/0001-91") == "00000000000191"
    assert normalize_cnpj("123") == ""
    assert normalize_cnae("62.09-1-00") == "6209100"
    assert normalize_cnae("620") == ""
    assert normalize_email(" COMERCIAL@EXEMPLO.COM ") == "comercial@exemplo.com"
    assert normalize_email("sem-arroba") == ""
    assert normalize_phone("(11) 99999-0000") == "11999990000"
    assert normalize_phone("11111111111") == ""
    assert parse_date_iso("31/01/2026") == "2026-01-31"
    assert parse_date_iso("20260131") == "2026-01-31"
    assert parse_date_iso("31-01-2026") == ""
