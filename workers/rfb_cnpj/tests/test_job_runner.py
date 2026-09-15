from pathlib import Path

from workers.rfb_cnpj.enrichment_locked import assert_enrichment_allowed
from workers.rfb_cnpj.job_runner import run_job
from workers.rfb_cnpj.models import CnpjFilters, CnpjRecord


def test_run_job_generates_export_without_enrichment(tmp_path: Path):
    result = run_job(
        [CnpjRecord(cnpj="1", razao_social="Empresa Teste", cnae_principal="4321500", municipio="Campinas", uf="SP", porte="ME")],
        CnpjFilters(segment="Energia solar", uf="SP", delivery_format="csv"),
        tmp_path,
    )

    assert result["ok"] is True
    assert result["row_count"] == 1


def test_enrichment_requires_admin_paid_and_payment_confirmation():
    try:
        assert_enrichment_allowed(is_admin=True, enrichment_paid=False, payment_confirmed=True)
    except PermissionError as error:
        assert "add-on pago" in str(error)
    else:
        raise AssertionError("enrichment should stay locked without payment")
