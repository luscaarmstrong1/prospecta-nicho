from __future__ import annotations

from workers.rfb_cnpj.models import CnpjRecord


def score_record(record: CnpjRecord) -> int:
    score = 50
    if record.situacao_cadastral == "ATIVA":
        score += 20
    if record.nome_fantasia:
        score += 8
    if record.capital_social and record.capital_social >= 10000:
        score += 8
    if record.porte in {"ME", "EPP"}:
        score += 6
    if record.data_abertura:
        score += 4
    return min(score, 100)
