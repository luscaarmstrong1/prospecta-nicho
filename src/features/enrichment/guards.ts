export function assertEnrichmentCanRun(input: {
  isAdmin: boolean;
  enrichmentPaid: boolean;
  paymentConfirmedByAdmin: boolean;
}) {
  if (!input.isAdmin) throw new Error("Enriquecimento disponível apenas para admin.");
  if (!input.enrichmentPaid) throw new Error("Enriquecimento bloqueado até pagamento do add-on.");
  if (!input.paymentConfirmedByAdmin) throw new Error("Confirmação de pagamento obrigatória antes do enriquecimento.");
}
