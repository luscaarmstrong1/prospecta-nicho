from __future__ import annotations

from decimal import Decimal, InvalidOperation

from workers.rfb_cnpj.models import CnpjRecord


def _decimal_or_none(value: object) -> Decimal | None:
    if value in {None, ""}:
        return None
    try:
        return Decimal(str(value).replace(".", "").replace(",", "."))
    except (InvalidOperation, TypeError, ValueError):
        return None


def parse_sample_rows(rows: list[dict[str, object]]) -> list[CnpjRecord]:
    return [
        CnpjRecord(
            cnpj=str(row.get("cnpj", "")),
            razao_social=str(row.get("razao_social", "")),
            nome_fantasia=str(row.get("nome_fantasia", "")),
            cnae_principal=str(row.get("cnae_principal", "")),
            municipio=str(row.get("municipio", "")),
            uf=str(row.get("uf", "")),
            porte=str(row.get("porte", "")),
            data_abertura=str(row.get("data_abertura", "")),
            situacao_cadastral=str(row.get("situacao_cadastral") or "DESCONHECIDA"),
            matriz_filial=str(row.get("matriz_filial") or "DESCONHECIDO"),
            capital_social=_decimal_or_none(row.get("capital_social")),
        )
        for row in rows
    ]
