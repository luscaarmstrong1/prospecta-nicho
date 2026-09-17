from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Iterable
from urllib.parse import urlsplit

from workers.rfb_cnpj.models import CnpjRecord
from workers.rfb_cnpj.normalization import normalize_cnpj, normalize_email, normalize_key, normalize_phone


@dataclass(frozen=True)
class SuppressionRule:
    kind: str
    value: str


def normalize_domain(value: Any) -> str:
    raw = str(value or "").strip().lower().removeprefix("@")
    if not raw:
        return ""
    parsed = urlsplit(raw if "://" in raw else f"//{raw}")
    domain = (parsed.hostname or "").removeprefix("www.").rstrip(".")
    return domain if "." in domain and " " not in domain else ""


def normalize_rule(kind: Any, value: Any) -> SuppressionRule | None:
    normalized_kind = normalize_key(kind).lower().replace(" ", "_")
    raw_value = str(value or "").strip()
    if normalized_kind == "cnpj":
        normalized_value = normalize_cnpj(raw_value)
    elif normalized_kind in {"email", "domain", "dominio"}:
        email = normalize_email(raw_value)
        normalized_value = email if normalized_kind == "email" else normalize_domain(raw_value)
        normalized_kind = "domain" if normalized_kind in {"domain", "dominio"} else "email"
    elif normalized_kind in {"phone", "telefone"}:
        normalized_kind = "phone"
        normalized_value = normalize_phone(raw_value)
    elif normalized_kind in {"company", "empresa", "razao_social"}:
        normalized_kind = "company"
        normalized_value = normalize_key(raw_value)
    else:
        return None
    if not normalized_value:
        return None
    return SuppressionRule(normalized_kind, normalized_value)


def _record_values(record: CnpjRecord) -> dict[str, set[str]]:
    extra = record.extra
    emails = {
        email
        for email in (
            normalize_email(extra.get("email_comercial")),
            normalize_email(extra.get("correio_eletronico")),
        )
        if email
    }
    phones = {
        phone
        for phone in (
            normalize_phone(extra.get("telefone_comercial")),
            normalize_phone(extra.get("phone_1")),
            normalize_phone(extra.get("phone_2")),
        )
        if phone
    }
    return {
        "cnpj": {record.cnpj},
        "email": emails,
        "domain": {email.rsplit("@", 1)[1] for email in emails if "@" in email},
        "phone": phones,
        "company": {normalize_key(record.razao_social), normalize_key(record.nome_fantasia)} - {""},
    }


def apply_suppression(
    records: Iterable[CnpjRecord],
    rules: Iterable[SuppressionRule],
) -> tuple[list[CnpjRecord], int]:
    indexed: dict[str, set[str]] = {}
    for rule in rules:
        indexed.setdefault(rule.kind, set()).add(rule.value)
    kept: list[CnpjRecord] = []
    suppressed = 0
    for record in records:
        values = _record_values(record)
        if any(values.get(kind, set()).intersection(blocked) for kind, blocked in indexed.items()):
            suppressed += 1
        else:
            kept.append(record)
    return kept, suppressed
