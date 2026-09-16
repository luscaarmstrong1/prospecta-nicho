from workers.rfb_cnpj.models import CnpjRecord
from workers.rfb_cnpj.scoring import score_record


def test_score_record_prioritizes_active_complete_businesses():
    record = CnpjRecord(
        cnpj="1",
        razao_social="Empresa Teste",
        nome_fantasia="Teste",
        porte="ME",
        data_abertura="2026-01-01",
        situacao_cadastral="ATIVA",
        capital_social=20000,
    )

    assert score_record(record) > 80
