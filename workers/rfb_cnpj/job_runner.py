from __future__ import annotations

from pathlib import Path

from workers.rfb_cnpj.generator import generate_export
from workers.rfb_cnpj.logs import log_line
from workers.rfb_cnpj.models import CnpjFilters, CnpjRecord


def run_job(records: list[CnpjRecord], filters: CnpjFilters, output_dir: Path) -> dict[str, object]:
    logs = [log_line("Job iniciado."), log_line("Filtros aplicados sem enriquecimento automatico.")]
    export = generate_export(records, filters, output_dir)
    logs.append(log_line(f"Export gerado: {export.path.name} com {export.row_count} linhas."))
    return {
        "ok": True,
        "status": "completed",
        "path": str(export.path),
        "row_count": export.row_count,
        "fields": list(export.fields),
        "format": export.format,
        "files": [str(path) for path in export.files],
        "logs": logs,
    }
