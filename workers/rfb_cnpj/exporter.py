from __future__ import annotations

import csv
import json
import os
from collections import Counter
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
    if isinstance(value, (dict, list, tuple, set)):
        value = json.dumps(value, ensure_ascii=False, sort_keys=True, default=str)
    if isinstance(value, str):
        text = value.replace("\x00", "").strip()
        return f"'{text}" if text[:1] in {"=", "+", "-", "@", "\t", "\r", "\n"} else text
    return value


def _atomic_path(path: Path) -> Path:
    return path.with_name(f".{path.stem}.{os.getpid()}.tmp{path.suffix}")


def _validate_csv(path: Path, fields: tuple[str, ...], expected_rows: int) -> None:
    if not path.exists() or path.stat().st_size <= 3:
        raise RuntimeError("CSV temporario ausente ou vazio.")
    if path.read_bytes()[:3] != b"\xef\xbb\xbf":
        raise RuntimeError("CSV temporario nao possui BOM UTF-8.")
    with path.open("r", encoding="utf-8-sig", newline="") as handle:
        reader = csv.DictReader(handle, delimiter=";")
        if tuple(reader.fieldnames or ()) != fields:
            raise RuntimeError("Cabecalho CSV diverge dos campos solicitados.")
        if sum(1 for _ in reader) != expected_rows:
            raise RuntimeError("Quantidade de linhas do CSV diverge do resultado esperado.")


def _summary_rows(
    records: list[CnpjRecord],
    fields: tuple[str, ...],
    search_stats: dict[str, Any] | None,
    filters: CnpjFilters | None,
) -> list[tuple[str, Any]]:
    rows: list[tuple[str, Any]] = [
        ("protocolo", filters.public_code if filters else "nao informado"),
        ("quantidade_solicitada", filters.quantity if filters else len(records)),
        ("quantidade_entregue", len(records)),
        ("linhas_exportadas", len(records)),
        ("campos_exportados", len(fields)),
        ("gerado_em_utc", datetime.now(UTC).isoformat()),
        ("origem", "Dados publicos do CNPJ da Receita Federal consultados pela API Minha Receita"),
        ("enriquecimento", "nao incluso no export padrao"),
    ]
    for key, value in sorted((search_stats or {}).items()):
        if isinstance(value, (str, int, float, bool)) or value is None:
            rows.append((f"busca_{key}", "" if value is None else value))
    for field in ("uf", "municipio", "cnae_principal", "porte", "situacao_cadastral", "matriz_filial"):
        counts = Counter(str(record.as_dict().get(field) or "NAO_INFORMADO") for record in records)
        for value, count in sorted(counts.items()):
            rows.append((f"distribuicao_{field}_{value}", count))
    return rows


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
        ("data_abertura_inicio", filters.opening_date_start or "sem filtro"),
        ("data_abertura_fim", filters.opening_date_end or "sem filtro"),
        ("porte", ", ".join(filters.company_size) or "qualquer"),
        ("situacao_cadastral", filters.registration_status),
        ("matriz_filial", filters.branch_type),
        ("somente_matriz", "sim" if filters.only_headquarters else "nao"),
        ("excluir_mei", "sim" if filters.exclude_mei else "nao"),
        ("cnaes", ", ".join(filters.cnaes) or "resolvidos pelo mapeamento/admin"),
        ("incluir_cnaes_secundarios", "sim" if filters.include_secondary_cnaes else "nao"),
        ("capital_social_minimo", str(filters.min_capital_social) if filters.min_capital_social is not None else "sem filtro"),
        ("capital_social_maximo", str(filters.max_capital_social) if filters.max_capital_social is not None else "sem filtro"),
        ("quantidade", str(filters.quantity)),
        ("formato_entrega", filters.delivery_format),
        ("campos", ", ".join(filters.fields)),
    ]


def write_csv(records: list[CnpjRecord], fields: tuple[str, ...], output_path: Path) -> ExportResult:
    assert_no_prohibited_fields(list(fields))
    output_path.parent.mkdir(parents=True, exist_ok=True)
    rows = _rows(records, fields)
    tmp_path = _atomic_path(output_path)
    try:
        with tmp_path.open("w", encoding="utf-8-sig", newline="") as handle:
            writer = csv.DictWriter(handle, fieldnames=list(fields), delimiter=";", lineterminator="\r\n")
            writer.writeheader()
            writer.writerows([{key: _safe_cell(value) for key, value in row.items()} for row in rows])
            handle.flush()
            os.fsync(handle.fileno())
        _validate_csv(tmp_path, fields, len(rows))
        tmp_path.replace(output_path)
    except Exception:
        tmp_path.unlink(missing_ok=True)
        raise
    return ExportResult(path=output_path, row_count=len(rows), fields=fields, format="csv", files=(output_path,))


def write_xlsx(
    records: list[CnpjRecord],
    fields: tuple[str, ...],
    output_path: Path,
    filters: CnpjFilters | None = None,
    search_stats: dict[str, Any] | None = None,
) -> ExportResult:
    assert_no_prohibited_fields(list(fields))
    try:
        from openpyxl import Workbook, load_workbook
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
    for key, value in _summary_rows(records, fields, search_stats, filters):
        summary.append([key, value])

    applied = workbook.create_sheet("Filtros aplicados")
    applied.append(["filtro", "valor"])
    for key, value in _filters_summary(filters):
        applied.append([key, value])

    readme = workbook.create_sheet("Leia-me")
    readme.append(["ProspectaNicho - entrega de base CNPJ"])
    readme.append(["Os dados empresariais desta entrega têm origem nos Dados Abertos do CNPJ da Receita Federal e foram consultados por meio da API pública Minha Receita."])
    readme.append([f"Data de extração: {datetime.now(UTC).isoformat()}."])
    readme.append(["Os dados cadastrais podem mudar após a extração e não representam intenção de compra."])
    readme.append(["Use os dados para prospecção B2B com contexto, respeitando opt-out, LGPD e políticas comerciais internas."])
    readme.append(["A entrega padrão não inclui sócios, CPF, representantes legais nem enriquecimento."])

    for sheet in workbook.worksheets:
        for column_cells in sheet.columns:
            max_length = max(len(str(cell.value or "")) for cell in column_cells)
            sheet.column_dimensions[column_cells[0].column_letter].width = min(max(max_length + 2, 14), 44)

    tmp_path = _atomic_path(output_path)
    try:
        workbook.save(tmp_path)
        workbook.close()
        validated = load_workbook(tmp_path, read_only=True, data_only=False)
        try:
            if validated.sheetnames != ["Leads", "Resumo", "Filtros aplicados", "Leia-me"]:
                raise RuntimeError("Estrutura de abas do XLSX invalida.")
            if validated["Leads"].max_row != len(rows) + 1:
                raise RuntimeError("Quantidade de linhas do XLSX diverge do resultado esperado.")
        finally:
            validated.close()
        tmp_path.replace(output_path)
    except Exception:
        workbook.close()
        tmp_path.unlink(missing_ok=True)
        raise
    return ExportResult(path=output_path, row_count=len(rows), fields=fields, format="xlsx", files=(output_path,))
