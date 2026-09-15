from pathlib import Path

from openpyxl import load_workbook

from workers.rfb_cnpj.exporter import write_csv, write_xlsx
from workers.rfb_cnpj.models import CnpjFilters, CnpjRecord


def test_write_csv_uses_utf8_bom_and_blocks_sensitive_fields(tmp_path: Path):
    output = tmp_path / "base.csv"
    result = write_csv([CnpjRecord(cnpj="1", razao_social="Empresa Teste")], ("cnpj", "razao_social"), output)

    assert result.row_count == 1
    assert output.read_bytes().startswith(b"\xef\xbb\xbf")


def test_write_xlsx_creates_required_operational_sheets(tmp_path: Path):
    output = tmp_path / "base.xlsx"
    result = write_xlsx(
        [CnpjRecord(cnpj="1", razao_social="Empresa Teste", cnae_principal="4321500", municipio="Campinas", uf="SP")],
        ("cnpj", "razao_social", "municipio", "uf"),
        output,
        CnpjFilters(segment="Energia solar", uf="SP"),
    )

    workbook = load_workbook(output)
    assert result.format == "xlsx"
    assert workbook.sheetnames == ["Leads", "Resumo", "Filtros aplicados", "Leia-me"]
    assert workbook["Leads"]["A1"].value == "cnpj"
