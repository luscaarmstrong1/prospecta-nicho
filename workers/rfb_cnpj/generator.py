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


def generate_export(
    records: list[CnpjRecord],
    filters: CnpjFilters,
    output_dir: Path,
    search_stats: dict[str, object] | None = None,
) -> ExportResult:
    selected = apply_filters(records, filters)
    ranked = sorted(selected, key=score_record, reverse=True)[: max(filters.quantity, 1)]
    if search_stats is not None:
        search_stats["scored_records"] = len(selected)
        search_stats["delivered_records"] = len(ranked)
        search_stats["partial"] = len(ranked) < max(filters.quantity, 1)
    public_code = _safe_public_code(filters.public_code)
    output_root = output_dir.expanduser().resolve()
    request_dir = (output_root / public_code).resolve()
    if not request_dir.is_relative_to(output_root):
        raise ValueError("O diretorio do protocolo deve permanecer dentro do diretorio de exports.")
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S_%f")
    filename_base = f"prospectanicho_{public_code}_{timestamp}"
    if filters.delivery_format == "both":
        csv_result = write_csv(ranked, filters.fields, request_dir / f"{filename_base}.csv")
        try:
            xlsx_result = write_xlsx(
                ranked,
                filters.fields,
                request_dir / f"{filename_base}.xlsx",
                filters,
                search_stats,
            )
        except Exception:
            csv_result.path.unlink(missing_ok=True)
            raise
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
    return write_xlsx(ranked, filters.fields, output_path, filters, search_stats)
