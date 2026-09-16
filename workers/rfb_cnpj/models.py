from __future__ import annotations

from dataclasses import dataclass, field
from pathlib import Path
from typing import Any


@dataclass(frozen=True)
class CnpjFilters:
    segment: str
    uf: str | None = None
    city: str | None = None
    cities: tuple[str, ...] = ()
    city_ibge_code: str | None = None
    city_ibge_codes: tuple[str, ...] = ()
    concessionaria: str | None = None
    opening_period: str | None = None
    opening_date_start: str | None = None
    opening_date_end: str | None = None
    company_size: tuple[str, ...] = ("ME", "EPP")
    registration_status: str = "ATIVA"
    branch_type: str = "QUALQUER"
    cnaes: tuple[str, ...] = ()
    include_secondary_cnaes: bool = True
    exclude_mei: bool = True
    only_headquarters: bool = False
    min_capital_social: float | None = None
    max_capital_social: float | None = None
    quantity: int = 500
    public_code: str | None = None
    fields: tuple[str, ...] = (
        "cnpj",
        "razao_social",
        "nome_fantasia",
        "cnae_principal",
        "municipio",
        "uf",
        "porte",
        "data_abertura",
        "situacao_cadastral",
    )
    delivery_format: str = "xlsx"


@dataclass(frozen=True)
class CnpjRecord:
    cnpj: str
    razao_social: str
    nome_fantasia: str = ""
    cnae_principal: str = ""
    municipio: str = ""
    uf: str = ""
    porte: str = ""
    data_abertura: str = ""
    situacao_cadastral: str = "ATIVA"
    matriz_filial: str = "MATRIZ"
    capital_social: float | None = None
    extra: dict[str, Any] = field(default_factory=dict)

    def as_dict(self) -> dict[str, Any]:
        payload = {
            "cnpj": self.cnpj,
            "razao_social": self.razao_social,
            "nome_fantasia": self.nome_fantasia,
            "cnae_principal": self.cnae_principal,
            "municipio": self.municipio,
            "uf": self.uf,
            "porte": self.porte,
            "data_abertura": self.data_abertura,
            "situacao_cadastral": self.situacao_cadastral,
            "matriz_filial": self.matriz_filial,
            "capital_social": self.capital_social,
        }
        payload.update(self.extra)
        return payload


@dataclass(frozen=True)
class ExportResult:
    path: Path
    row_count: int
    fields: tuple[str, ...]
    format: str
    files: tuple[Path, ...] = ()
