from __future__ import annotations

import argparse
import csv
import json
from shutil import copyfile
from pathlib import Path
from typing import Any

from workers.rfb_cnpj.config import load_config
from workers.rfb_cnpj.discover import expected_groups
from workers.rfb_cnpj.job_runner import run_job
from workers.rfb_cnpj.models import CnpjFilters, CnpjRecord
from workers.rfb_cnpj.parser import parse_sample_rows
from workers.rfb_cnpj.privacy import allowed_export_fields, classify_privacy_risk
from workers.rfb_cnpj.validate_data_dir import validate_data_dir


def _sample_records() -> list[CnpjRecord]:
    return [
        CnpjRecord(
            cnpj="00000000000100",
            razao_social="Empresa Solar Exemplo LTDA",
            nome_fantasia="Solar Exemplo",
            cnae_principal="4321500",
            municipio="Campinas",
            uf="SP",
            porte="ME",
            data_abertura="2026-01-10",
            capital_social=25000,
        ),
        CnpjRecord(
            cnpj="00000000000291",
            razao_social="Engenharia Comercial Exemplo LTDA",
            nome_fantasia="Engenharia Exemplo",
            cnae_principal="7112000",
            municipio="Belo Horizonte",
            uf="MG",
            porte="EPP",
            data_abertura="2025-11-20",
            capital_social=80000,
        ),
    ]


def _filters_from_dict(payload: dict[str, Any]) -> CnpjFilters:
    def tuple_value(*keys: str) -> tuple[str, ...]:
        for key in keys:
            value = payload.get(key)
            if isinstance(value, list):
                return tuple(str(item) for item in value if str(item).strip())
            if isinstance(value, str) and value.strip():
                return tuple(item.strip() for item in value.split(",") if item.strip())
        return ()

    return CnpjFilters(
        segment=str(payload.get("segment") or payload.get("segmento") or "Geral"),
        uf=payload.get("uf") or payload.get("state"),
        city=payload.get("city") or payload.get("cidade"),
        concessionaria=payload.get("concessionaria"),
        opening_period=payload.get("openingPeriod") or payload.get("opening_period"),
        company_size=tuple_value("companySize", "company_size") or ("ME", "EPP"),
        registration_status=str(payload.get("registrationStatus") or payload.get("registration_status") or "ATIVA"),
        branch_type=str(payload.get("branchType") or payload.get("branch_type") or "QUALQUER"),
        cnaes=tuple_value("cnaes"),
        min_capital_social=payload.get("minCapital") or payload.get("min_capital_social"),
        max_capital_social=payload.get("maxCapital") or payload.get("max_capital_social"),
        quantity=int(payload.get("quantity") or 500),
        fields=tuple_value("fields", "campos") or allowed_export_fields(),
        delivery_format=str(payload.get("deliveryFormat") or payload.get("delivery_format") or "xlsx"),
    )


def _load_filters(path: Path | None) -> CnpjFilters:
    if not path:
        return CnpjFilters(segment="Energia solar", uf="SP", cnaes=("4321500",), delivery_format="both")
    payload = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(payload, dict):
        raise ValueError("Arquivo de filtros deve conter um objeto JSON.")
    return _filters_from_dict(payload)


def _load_records_from_csv(path: Path) -> list[CnpjRecord]:
    with path.open("r", encoding="utf-8-sig", newline="") as handle:
        reader = csv.DictReader(handle)
        return parse_sample_rows([dict(row) for row in reader])


def _load_records_from_data_dir(path: Path) -> list[CnpjRecord]:
    if not path.exists():
        return []
    records: list[CnpjRecord] = []
    for csv_path in sorted(path.glob("*.csv")):
        records.extend(_load_records_from_csv(csv_path))
    for json_path in sorted(path.glob("*.json")):
        payload = json.loads(json_path.read_text(encoding="utf-8"))
        if isinstance(payload, list):
            records.extend(parse_sample_rows(payload))
    return records


def command_status(name: str, sample: bool = False) -> dict[str, object]:
    return {
        "ok": True,
        "command": name,
        "sample": sample,
        "message": "Controle operacional pronto. O processamento nacional deve rodar no worker externo.",
    }


def export_sample(output_dir: Path) -> dict[str, object]:
    result = run_job(
        _sample_records(),
        CnpjFilters(segment="Energia solar", uf="SP", cnaes=("4321500",), delivery_format="both"),
        output_dir,
    )
    preview = [
        {
            "cnpj": "00.000.000/0001-00",
            "nome_fantasia": "Empresa A***",
            "municipio": "Campinas",
            "uf": "SP",
            "requires_privacy_review": classify_privacy_risk({"porte": "MEI", "natureza_juridica": "Empresario individual"}),
        }
    ]
    return {"ok": True, "fields": allowed_export_fields(), "preview": preview, "masked": True, "export": result}


def run_local(filters_path: Path | None, output_path: Path, data_dir: Path | None) -> dict[str, object]:
    filters = _load_filters(filters_path)
    records = _load_records_from_data_dir(data_dir) if data_dir else _sample_records()
    if not records:
        return {"ok": False, "status": "waiting_data", "message": "Nenhum CSV/JSON encontrado no diretorio de dados informado."}
    output_dir = output_path.parent
    result = run_job(records, CnpjFilters(**{**filters.__dict__, "delivery_format": output_path.suffix.lstrip(".") or "xlsx"}), output_dir)
    generated_path = Path(str(result["path"]))
    if generated_path != output_path and generated_path.exists():
        output_path.parent.mkdir(parents=True, exist_ok=True)
        copyfile(generated_path, output_path)
    return {**result, "path": str(output_path)}


def run_job_from_supabase(job_id: str) -> dict[str, object]:
    if not job_id:
        return {"ok": False, "status": "invalid", "message": "Informe --job-id."}
    if not (load_config().storage_bucket):
        return {
            "ok": False,
            "status": "waiting_integration",
            "jobId": job_id,
            "message": "Configure Supabase/R2 e banco do worker antes de processar jobs reais.",
        }
    return {"ok": True, "status": "queued_external_worker", "jobId": job_id}


def main() -> None:
    parser = argparse.ArgumentParser(prog="python -m workers.rfb_cnpj")
    parser.add_argument(
        "command",
        choices=[
            "discover",
            "download",
            "validate",
            "validate-data-dir",
            "transform",
            "load",
            "verify",
            "run",
            "export",
            "run-job",
            "run-local",
        ],
    )
    parser.add_argument("--sample", action="store_true")
    parser.add_argument("--data-dir")
    parser.add_argument("--filters")
    parser.add_argument("--output")
    parser.add_argument("--job-id")
    args = parser.parse_args()
    config = load_config()

    if args.command == "discover":
        result = {"ok": True, "minimum_groups": list(expected_groups())}
    elif args.command == "validate":
        result = validate_data_dir(Path(args.data_dir or config.data_dir))
    elif args.command == "validate-data-dir":
        result = validate_data_dir(Path(args.data_dir or config.data_dir))
    elif args.command == "run" and args.sample:
        result = run_job(
            _sample_records(),
            CnpjFilters(segment="Energia solar", uf="SP", cnaes=("4321500",), delivery_format="both"),
            Path(config.output_dir),
        )
    elif args.command == "export":
        result = export_sample(Path(config.output_dir)) if args.sample else command_status("export")
    elif args.command == "run-local":
        result = run_local(Path(args.filters) if args.filters else None, Path(args.output or "outputs/rfb-cnpj/output.xlsx"), Path(args.data_dir) if args.data_dir else None)
    elif args.command == "run-job":
        result = run_job_from_supabase(args.job_id or "")
    else:
        result = command_status(args.command, sample=args.sample)

    print(json.dumps(result, indent=2, ensure_ascii=False))
