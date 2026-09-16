from __future__ import annotations

from pathlib import Path
from datetime import datetime
import re

from workers.rfb_cnpj.exporter import write_csv, write_xlsx
from workers.rfb_cnpj.filters import apply_filters
from workers.rfb_cnpj.models import CnpjFilters, CnpjRecord, ExportResult
from workers.rfb_cnpj.scoring import score_record


def _safe_public_code(value: str | None) -> str:
    code = re.sub(r"[^A-Za-z0-9_-]+", "", str(value or "").strip().upper())
    return code or "SEM-PROTOCOLO"


def generate_export(records: list[CnpjRecord], filters: CnpjFilters, output_dir: Path) -> ExportResult:
    selected = apply_filters(records, filters)
    ranked = sorted(selected, key=score_record, reverse=True)[: max(filters.quantity, 1)]
    public_code = _safe_public_code(filters.public_code)
    request_dir = output_dir / public_code
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename_base = f"prospectanicho_{public_code}_{timestamp}"
    if filters.delivery_format == "both":
        csv_result = write_csv(ranked, filters.fields, request_dir / f"{filename_base}.csv")
        xlsx_result = write_xlsx(ranked, filters.fields, request_dir / f"{filename_base}.xlsx", filters)
        return ExportResult(
            path=xlsx_result.path,
            row_count=xlsx_result.row_count,
            fields=xlsx_result.fields,
            format="both",
            files=(csv_result.path, xlsx_result.path),
        )
    output_path = request_dir / f"{filename_base}.{filters.delivery_format}"
    if filters.delivery_format == "csv":
        return write_csv(ranked, filters.fields, output_path)
    return write_xlsx(ranked, filters.fields, output_path, filters)
