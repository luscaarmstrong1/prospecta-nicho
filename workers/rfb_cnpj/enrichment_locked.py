from __future__ import annotations


def assert_enrichment_allowed(*, is_admin: bool, enrichment_paid: bool, payment_confirmed: bool) -> None:
    if not is_admin:
        raise PermissionError("Enriquecimento exige operador admin.")
    if not enrichment_paid:
        raise PermissionError("Enriquecimento e add-on pago e permanece bloqueado.")
    if not payment_confirmed:
        raise PermissionError("Confirme o pagamento antes de enriquecer a base.")
