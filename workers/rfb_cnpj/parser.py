from __future__ import annotations

from workers.rfb_cnpj.models import CnpjRecord


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
            situacao_cadastral=str(row.get("situacao_cadastral", "ATIVA")),
            matriz_filial=str(row.get("matriz_filial", "MATRIZ")),
            capital_social=float(row["capital_social"]) if row.get("capital_social") is not None else None,
        )
        for row in rows
    ]
