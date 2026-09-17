from decimal import Decimal

from workers.rfb_cnpj.cli import _filters_from_dict


def test_filter_parser_preserves_decimal_and_boolean_meaning():
    filters = _filters_from_dict(
        {
            "segment": "energia",
            "min_capital": "1.234,56",
            "max_capital": "1,234.56",
            "exclude_mei": "false",
            "only_headquarters": "sim",
            "include_secondary_cnaes": "0",
        }
    )

    assert filters.min_capital_social == Decimal("1234.56")
    assert filters.max_capital_social == Decimal("1234.56")
    assert filters.exclude_mei is False
    assert filters.only_headquarters is True
    assert filters.include_secondary_cnaes is False


def test_filter_parser_bounds_quantity_and_uses_safe_default():
    assert _filters_from_dict({"segment": "x", "quantity": "invalida"}).quantity == 500
    assert _filters_from_dict({"segment": "x", "quantity": 0}).quantity == 1
    assert _filters_from_dict({"segment": "x", "quantity": 1_000_000}).quantity == 100_000
