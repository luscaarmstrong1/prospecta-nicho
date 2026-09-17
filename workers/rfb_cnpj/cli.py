from __future__ import annotations

import argparse
import asyncio
import csv
import json
import os
import sys
from decimal import Decimal
from shutil import copyfile
from pathlib import Path
from typing import Any

from workers.rfb_cnpj.config import load_config
from workers.rfb_cnpj.data_cli import handle_data_command
from workers.rfb_cnpj.discover import expected_groups
from workers.rfb_cnpj.job_runner import run_job
from workers.rfb_cnpj.models import CnpjFilters, CnpjRecord
from workers.rfb_cnpj.normalization import parse_decimal, tri_state_bool
from workers.rfb_cnpj.parser import parse_sample_rows
from workers.rfb_cnpj.privacy import allowed_export_fields, classify_privacy_risk
from workers.rfb_cnpj.providers import get_company_search_provider
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
            situacao_cadastral="ATIVA",
            matriz_filial="MATRIZ",
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
            situacao_cadastral="ATIVA",
            matriz_filial="MATRIZ",
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

    def numeric_value(*keys: str) -> Decimal | None:
        for key in keys:
            value = payload.get(key)
            if value in {None, ""}:
                continue
            parsed = parse_decimal(value)
            if parsed is not None:
                return parsed
        return None

    def boolean_value(default: bool, *keys: str) -> bool:
        for key in keys:
            if key not in payload:
                continue
            parsed = tri_state_bool(payload.get(key))
            if parsed is not None:
                return parsed
        return default

    def quantity_value() -> int:
        raw_quantity = payload.get("quantity")
        if raw_quantity in (None, ""):
            return 500
        try:
            return min(max(int(raw_quantity), 1), 100_000)
        except (TypeError, ValueError):
            return 500

    return CnpjFilters(
        segment=str(payload.get("segment") or payload.get("segmento") or "Geral"),
        uf=payload.get("uf") or payload.get("state"),
        city=payload.get("city") or payload.get("cidade"),
        cities=tuple_value("cities", "cidades"),
        city_ibge_code=payload.get("cityIbgeCode") or payload.get("city_ibge_code") or payload.get("codigo_municipio_ibge"),
        city_ibge_codes=tuple_value("cityIbgeCodes", "city_ibge_codes", "municipioIbgeCodes"),
        concessionaria=payload.get("concessionaria"),
        opening_period=payload.get("openingPeriod") or payload.get("opening_period"),
        opening_date_start=payload.get("openingDateStart") or payload.get("opening_date_start"),
        opening_date_end=payload.get("openingDateEnd") or payload.get("opening_date_end"),
        company_size=tuple_value("companySize", "company_size") or ("ME", "EPP"),
        registration_status=str(payload.get("registrationStatus") or payload.get("registration_status") or "ATIVA"),
        branch_type=str(payload.get("branchType") or payload.get("branch_type") or "QUALQUER"),
        cnaes=tuple_value("cnaes"),
        include_secondary_cnaes=boolean_value(True, "includeSecondaryCnaes", "include_secondary_cnaes"),
        exclude_mei=boolean_value(True, "excludeMei", "exclude_mei"),
        only_headquarters=boolean_value(False, "onlyHeadquarters", "only_headquarters"),
        min_capital_social=numeric_value("minCapital", "min_capital_social", "min_capital"),
        max_capital_social=numeric_value("maxCapital", "max_capital_social", "max_capital"),
        quantity=quantity_value(),
        public_code=payload.get("publicCode") or payload.get("public_code"),
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
    config = load_config()
    if not (config.supabase_url and config.supabase_service_role_key):
        return {
            "ok": False,
            "status": "waiting_integration",
            "jobId": job_id,
            "message": "Configure SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY antes de processar jobs reais.",
        }
    return {"ok": True, "status": "queued_external_worker", "jobId": job_id}


def open_export_folder(request_code: str) -> dict[str, object]:
    code = "".join(char for char in request_code.strip().upper() if char.isalnum() or char in {"-", "_"})
    if not code:
        return {"ok": False, "status": "invalid", "message": "Informe --request-code PN-ABC123."}
    folder = Path(load_config().output_dir) / code
    if not folder.exists():
        return {"ok": False, "status": "not_found", "path": str(folder), "message": "Pasta de export nao encontrada."}
    if os.name == "nt":
        os.startfile(str(folder))  # type: ignore[attr-defined]
    else:
        print(str(folder))
    return {"ok": True, "status": "opened", "path": str(folder)}


async def provider_health() -> dict[str, object]:
    provider = get_company_search_provider(load_config())
    health = await provider.health()
    return {
        "ok": health.status == "ONLINE",
        "provider": health.provider,
        "status": health.status,
        "latency_ms": health.latency_ms,
        "message": health.message,
    }


async def search_provider(args: argparse.Namespace) -> dict[str, object]:
    output = Path(args.output or "outputs/rfb-cnpj/resultado.xlsx")
    suffix_format = output.suffix.lstrip(".").lower()
    delivery_format = args.delivery_format or (suffix_format if suffix_format in {"csv", "xlsx"} else "xlsx")
    cnaes = tuple(str(item).replace(".", "").replace("-", "") for item in (args.cnae or []) if str(item).strip())
    filters = CnpjFilters(
        segment=args.segment or "base-cnpj",
        uf=args.uf,
        city=args.city,
        cnaes=cnaes,
        company_size=("QUALQUER",),
        quantity=args.quantity,
        delivery_format=delivery_format,
        include_secondary_cnaes=not args.primary_cnae_only,
        exclude_mei=False,
        fields=tuple(args.field or allowed_export_fields()),
    )
    provider = get_company_search_provider(load_config())
    search_result = await provider.search(filters)
    export_result = run_job(list(search_result.records), filters, output.parent)
    generated_path = Path(str(export_result.get("path") or output))
    if generated_path != output and generated_path.exists():
        output.parent.mkdir(parents=True, exist_ok=True)
        copyfile(generated_path, output)
        generated_path = output
    return {
        "ok": True,
        "provider": search_result.provider,
        "stats": search_result.stats(),
        "export": {
            "path": str(generated_path),
            "row_count": export_result.get("row_count", 0),
            "format": export_result.get("format", delivery_format),
            "files": [str(path) for path in export_result.get("files", [])],
        },
    }


def main() -> None:
    config = load_config()
    if len(sys.argv) > 1 and sys.argv[1] == "data":
        result = handle_data_command(sys.argv[2:], Path(config.data_dir))
        print(json.dumps(result, indent=2, ensure_ascii=False))
        return

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
            "search",
            "provider",
            "watch",
            "open-export",
        ],
    )
    parser.add_argument("--sample", action="store_true")
    parser.add_argument("--data-dir")
    parser.add_argument("--filters")
    parser.add_argument("--output")
    parser.add_argument("--job-id")
    parser.add_argument("--request-code")
    parser.add_argument("--once", action="store_true")
    parser.add_argument("--interval-seconds", type=int, default=15)
    parser.add_argument("provider_command", nargs="?", default="health")
    parser.add_argument("--uf")
    parser.add_argument("--city")
    parser.add_argument("--segment")
    parser.add_argument("--cnae", action="append")
    parser.add_argument("--quantity", type=int, default=100)
    parser.add_argument("--format", dest="delivery_format", choices=["csv", "xlsx", "both"])
    parser.add_argument("--field", action="append")
    parser.add_argument("--primary-cnae-only", action="store_true")
    args = parser.parse_args()

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
    elif args.command == "provider":
        if args.provider_command != "health":
            result = {"ok": False, "status": "invalid", "message": "Comando provider suportado: health."}
        else:
            result = asyncio.run(provider_health())
    elif args.command == "search":
        result = asyncio.run(search_provider(args))
    elif args.command == "watch":
        from workers.rfb_cnpj.queue import watch_queue

        result = watch_queue(config, once=args.once, interval_seconds=args.interval_seconds)
    elif args.command == "open-export":
        result = open_export_folder(args.request_code or "")
    else:
        result = command_status(args.command, sample=args.sample)

    print(json.dumps(result, indent=2, ensure_ascii=False))
