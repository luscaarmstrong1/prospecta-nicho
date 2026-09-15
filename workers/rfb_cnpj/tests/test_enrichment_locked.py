import pytest

from workers.rfb_cnpj.enrichment_locked import assert_enrichment_allowed


@pytest.mark.parametrize(
    "is_admin,enrichment_paid,payment_confirmed",
    [
        (False, True, True),
        (True, False, True),
        (True, True, False),
    ],
)
def test_enrichment_fails_closed(is_admin: bool, enrichment_paid: bool, payment_confirmed: bool):
    with pytest.raises(PermissionError):
        assert_enrichment_allowed(
            is_admin=is_admin,
            enrichment_paid=enrichment_paid,
            payment_confirmed=payment_confirmed,
        )
