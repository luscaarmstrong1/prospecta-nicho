from workers.rfb_cnpj.models import CnpjRecord
from workers.rfb_cnpj.suppression import apply_suppression, normalize_rule


def _record(cnpj: str, company: str, email: str, phone: str) -> CnpjRecord:
    return CnpjRecord(
        cnpj=cnpj,
        razao_social=company,
        extra={"email_comercial": email, "telefone_comercial": phone},
    )


def test_suppression_removes_only_matching_records():
    records = [
        _record("00000000000191", "Empresa A", "contato@empresa-a.com.br", "11999990000"),
        _record("00000000000272", "Empresa B", "vendas@empresa-b.com.br", "11988880000"),
    ]
    rule = normalize_rule("cnpj", "00.000.000/0001-91")

    kept, suppressed = apply_suppression(records, [rule])

    assert rule is not None
    assert suppressed == 1
    assert [record.cnpj for record in kept] == ["00000000000272"]


def test_suppression_normalizes_email_domain_phone_and_company():
    record = _record("00000000000191", "Árvore Energia Ltda", "OptOut@Example.com", "(11) 99999-0000")
    candidates = [
        normalize_rule("email", "optout@example.com"),
        normalize_rule("dominio", "https://www.example.com/contato"),
        normalize_rule("telefone", "11 99999-0000"),
        normalize_rule("empresa", "Arvore Energia Ltda"),
    ]

    for rule in candidates:
        assert rule is not None
        kept, suppressed = apply_suppression([record], [rule])
        assert kept == []
        assert suppressed == 1


def test_invalid_suppression_rule_is_rejected():
    assert normalize_rule("cpf", "123") is None
    assert normalize_rule("cnpj", "123") is None
