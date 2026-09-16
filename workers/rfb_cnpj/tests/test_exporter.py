from pathlib import Path
from decimal import Decimal

from openpyxl import load_workbook

from workers.rfb_cnpj.exporter import write_csv, write_xlsx
from workers.rfb_cnpj.models import CnpjFilters, CnpjRecord


def test_write_csv_uses_utf8_bom_and_blocks_sensitive_fields(tmp_path: Path):
    output = tmp_path / "base.csv"
    result = write_csv([CnpjRecord(cnpj="1", razao_social="=Empresa Teste")], ("cnpj", "razao_social"), output)

    assert result.row_count == 1
    content = output.read_bytes()
    assert content.startswith(b"\xef\xbb\xbf")
    assert b";" in content
    assert b"\r\n" in content
    assert "'=Empresa Teste" in output.read_text(encoding="utf-8-sig")


def test_write_xlsx_creates_required_operational_sheets(tmp_path: Path):
    output = tmp_path / "base.xlsx"
    result = write_xlsx(
        [CnpjRecord(cnpj="1", razao_social="+Empresa Teste", cnae_principal="4321500", municipio="Campinas", uf="SP", capital_social=Decimal("1234.56"))],
        ("cnpj", "razao_social", "municipio", "uf", "capital_social"),
        output,
        CnpjFilters(segment="Energia solar", uf="SP"),
    )

    workbook = load_workbook(output)
    assert result.format == "xlsx"
    assert workbook.sheetnames == ["Leads", "Resumo", "Filtros aplicados", "Leia-me"]
    assert workbook["Leads"]["A1"].value == "cnpj"
    assert workbook["Leads"]["B2"].value == "'+Empresa Teste"
    assert workbook["Leads"]["E2"].value == 1234.56
