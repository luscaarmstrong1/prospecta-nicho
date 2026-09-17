from __future__ import annotations

import re
import unicodedata
from datetime import datetime
from decimal import Decimal, InvalidOperation
from typing import Any


def only_digits(value: Any) -> str:
    return re.sub(r"\D+", "", str(value or ""))


def normalize_text(value: Any) -> str:
    return str(value or "").strip()


def normalize_key(value: Any) -> str:
    text = unicodedata.normalize("NFKD", normalize_text(value))
    return " ".join("".join(char for char in text if not unicodedata.combining(char)).upper().split())


def parse_decimal(value: Any) -> Decimal | None:
    if value is None or value == "":
        return None
    if isinstance(value, Decimal):
        return value
    if isinstance(value, (int, float)) and not isinstance(value, bool):
        return Decimal(str(value))
    text = normalize_text(value).replace(" ", "")
    if not text:
        return None
    if "," in text and "." in text:
        normalized = text.replace(".", "").replace(",", ".") if text.rfind(",") > text.rfind(".") else text.replace(",", "")
    elif "," in text:
        normalized = text.replace(".", "").replace(",", ".")
    else:
        normalized = text
    try:
        return Decimal(normalized)
    except (InvalidOperation, TypeError, ValueError):
        return None


def parse_date_iso(value: Any) -> str:
    text = normalize_text(value)
    if not text:
        return ""
    for pattern in ("%Y-%m-%d", "%d/%m/%Y", "%Y%m%d"):
        try:
            return datetime.strptime(text, pattern).date().isoformat()
        except ValueError:
            continue
    return ""


def tri_state_bool(value: Any) -> bool | None:
    if isinstance(value, bool):
        return value
    key = normalize_key(value)
    if key in {"S", "SIM", "TRUE", "1"}:
        return True
    if key in {"N", "NAO", "FALSE", "0"}:
        return False
    return None


def normalize_registration_status(value: Any) -> str:
    key = normalize_key(value)
    mapping = {
        "01": "NULA",
        "1": "NULA",
        "02": "ATIVA",
        "2": "ATIVA",
        "03": "SUSPENSA",
        "3": "SUSPENSA",
        "04": "INAPTA",
        "4": "INAPTA",
        "08": "BAIXADA",
        "8": "BAIXADA",
    }
    if key in mapping:
        return mapping[key]
    for status in ("ATIVA", "BAIXADA", "INAPTA", "SUSPENSA", "NULA"):
        if status in key.split() or key.endswith(f"- {status}"):
            return status
    return key or "DESCONHECIDA"


def normalize_branch(value: Any) -> str:
    key = normalize_key(value)
    mapping = {"1": "MATRIZ", "01": "MATRIZ", "2": "FILIAL", "02": "FILIAL"}
    if key in mapping:
        return mapping[key]
    if "MATRIZ" in key:
        return "MATRIZ"
    if "FILIAL" in key:
        return "FILIAL"
    return key or "DESCONHECIDO"


def normalize_company_size(value: Any) -> str:
    key = normalize_key(value).replace("-", " ")
    if key in {"01", "1", "NAO INFORMADO", "SEM INFORMACAO"}:
        return "NAO_INFORMADO"
    if key in {"03", "3", "ME", "MICROEMPRESA", "MICRO EMPRESA"}:
        return "ME"
    if key in {"05", "5", "EPP", "EMPRESA DE PEQUENO PORTE"}:
        return "EPP"
    if key in {"DEMAIS", "OUTROS", "02", "2"}:
        return "DEMAIS"
    return key.replace(" ", "_") if key else "NAO_INFORMADO"


def normalize_email(value: Any) -> str:
    email = normalize_text(value).lower()
    if not email or len(email) > 254 or not re.fullmatch(r"[^\s@]+@[^\s@]+\.[^\s@]+", email):
        return ""
    return email


def normalize_phone(value: Any) -> str:
    phone = only_digits(value)
    if len(phone) not in {10, 11} or len(set(phone)) == 1:
        return ""
    return phone


def normalize_cnpj(value: Any) -> str:
    cnpj = only_digits(value)
    return cnpj if len(cnpj) == 14 else ""


def normalize_cnae(value: Any) -> str:
    cnae = only_digits(value)
    return cnae if len(cnae) == 7 else ""
