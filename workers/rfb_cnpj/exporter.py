from __future__ import annotations

import csv
import os
from decimal import Decimal
from datetime import UTC, datetime
from pathlib import Path
from typing import Any

from workers.rfb_cnpj.models import CnpjFilters, CnpjRecord, ExportResult
from workers.rfb_cnpj.privacy import assert_no_prohibited_fields


def _rows(records: list[CnpjRecord], fields: tuple[str, ...]) -> list[dict[str, Any]]:
    rows = []
    for record in records:
        data = record.as_dict()
        rows.append({field: data.get(field, "") for field in fields})
    return rows


def _safe_cell(value: Any) -> Any:
    if isinstance(value, Decimal):
        return value
    if value is None:
        return ""
    if isinstance(value, str):
        text = value.replace("\x00", "").strip()
        return f"'{text}" if text[:1] in {"=", "+", "-", "@", "\t", "\r", "\n"} else text
    return value


def _atomic_path(path: Path) -> Path:
    return path.with_name(f".{path.name}.{os.getpid()}.tmp")


def _filters_summary(filters: CnpjFilters | None) -> list[tuple[str, str]]:
    if not filters:
        return [("modo", "sem filtros informados")]
    return [
        ("segmento", filters.segment),
        ("uf", filters.uf or "qualquer"),
        ("cidade", filters.city or "qualquer"),
        ("cidades", ", ".join(filters.cities) or "nao aplicado"),
        ("codigo_municipio_ibge", filters.city_ibge_code or ", ".join(filters.city_ibge_codes) or "nao aplicado"),
        ("concessionaria", filters.concessionaria or "nao aplicada"),
        ("periodo_abertura", filters.opening_period or "sem filtro"),
        ("porte", ", ".join(filters.company_size) or "qualquer"),
        ("situacao_cadastral", filters.registration_status),
        ("matriz_filial", filters.branch_type),
        ("cnaes", ", ".join(filters.cnaes) or "resolvidos pelo mapeamento/admin"),
        ("quantidade", str(filters.quantity)),
        ("campos", ", ".join(filters.fields)),
    ]


def write_csv(records: list[CnpjRecord], fields: tuple[str, ...], output_path: Path) -> ExportResult:
    assert_no_prohibited_fields(list(fields))
    output_path.parent.mkdir(parents=True, exist_ok=True)
    rows = _rows(records, fields)
    tmp_path = _atomic_path(output_path)
    with tmp_path.open("w", encoding="utf-8-sig", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=list(fields), delimiter=";", lineterminator="\r\n")
        writer.writeheader()
        writer.writerows([{key: _safe_cell(value) for key, value in row.items()} for row in rows])
    tmp_path.replace(output_path)
    return ExportResult(path=output_path, row_count=len(rows), fields=fields, format="csv", files=(output_path,))


def write_xlsx(
    records: list[CnpjRecord],
    fields: tuple[str, ...],
    output_path: Path,
    filters: CnpjFilters | None = None,
) -> ExportResult:
    assert_no_prohibited_fields(list(fields))
    try:
        from openpyxl import Workbook
        from openpyxl.styles import Font, PatternFill
    except ImportError as exc:
        raise RuntimeError("Instale openpyxl ou xlsxwriter para gerar XLSX no worker.") from exc

    output_path.parent.mkdir(parents=True, exist_ok=True)
    rows = _rows(records, fields)
    workbook = Workbook()
    leads = workbook.active
    leads.title = "Leads"

    header_fill = PatternFill(fill_type="solid", fgColor="EAF3F7")
    for col, field in enumerate(fields, start=1):
        cell = leads.cell(row=1, column=col, value=field)
        cell.font = Font(bold=True)
        cell.fill = header_fill
    for row_index, row in enumerate(rows, start=2):
        for col, field in enumerate(fields, start=1):
            cell = leads.cell(row=row_index, column=col, value=_safe_cell(row[field]))
            if field in {"cnpj", "telefone_comercial", "phone_1", "phone_2", "cep"}:
                cell.number_format = "@"
            if field == "capital_social" and isinstance(row[field], Decimal):
                cell.number_format = '#,##0.00'
    leads.freeze_panes = "A2"
    leads.auto_filter.ref = leads.dimensions

    summary = workbook.create_sheet("Resumo")
    summary.append(["indicador", "valor"])
    summary.append(["linhas_exportadas", len(rows)])
    summary.append(["campos_exportados", len(fields)])
    summary.append(["gerado_em_utc", datetime.now(UTC).isoformat()])
    summary.append(["origem", "Dados publicos do CNPJ da Receita Federal, consultados por meio da API Minha Receita"])
    summary.append(["enriquecimento", "nao incluso no export padrao"])

    applied = workbook.create_sheet("Filtros aplicados")
    applied.append(["filtro", "valor"])
    for key, value in _filters_summary(filters):
        applied.append([key, value])

    readme = workbook.create_sheet("Leia-me")
    readme.append(["ProspectaNicho - entrega de base CNPJ"])
    readme.append(["Esta planilha usa dados publicos empresariais e nao inclui socios, CPF, dados pessoais ou enriquecimento."])
    readme.append(["Use os dados para prospeccao B2B com contexto, respeitando opt-out, LGPD e politicas internas."])

    for sheet in workbook.worksheets:
        for column_cells in sheet.columns:
            max_length = max(len(str(cell.value or "")) for cell in column_cells)
            sheet.column_dimensions[column_cells[0].column_letter].width = min(max(max_length + 2, 14), 44)

    tmp_path = _atomic_path(output_path)
    workbook.save(tmp_path)
    tmp_path.replace(output_path)
    return ExportResult(path=output_path, row_count=len(rows), fields=fields, format="xlsx", files=(output_path,))
