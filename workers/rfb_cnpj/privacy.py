from __future__ import annotations

PROHIBITED_EXPORT_FIELDS = {
    "cpf",
    "cnpf",
    "qsa",
    "socios",
    "socio",
    "nome_socio",
    "representante_legal",
    "faixa_etaria",
    "telefone_particular",
    "email_pessoal",
}

BASE_EXPORT_FIELDS = [
    "cnpj",
    "razao_social",
    "nome_fantasia",
    "cnae_principal",
    "municipio",
    "uf",
    "endereco_comercial",
    "porte",
    "data_abertura",
    "situacao_cadastral",
]


def allowed_export_fields() -> list[str]:
    return [field for field in BASE_EXPORT_FIELDS if field not in PROHIBITED_EXPORT_FIELDS]


def classify_privacy_risk(record: dict[str, object]) -> bool:
    text = " ".join(str(value).lower() for value in record.values())
    return "mei" in text or "empresário individual" in text or "empresario individual" in text


def assert_no_prohibited_fields(fields: list[str]) -> None:
    normalized = {str(field).strip().lower() for field in fields}
    blocked = {
        field
        for field in normalized
        if field in PROHIBITED_EXPORT_FIELDS
        or any(fragment in field for fragment in ("cpf", "qsa", "socio", "representante_legal"))
    }
    if blocked:
        raise ValueError(f"Campos proibidos para exportação padrão: {', '.join(sorted(blocked))}")
