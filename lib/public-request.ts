// cspell:words brazilian
import type { PublicRequestInput } from "@/lib/public-request-schema";

export const brazilianStates = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG",
  "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO",
] as const;

export const quantityOptions = ["Até 100", "Até 500", "Até 1.000", "Mais de 1.000", "Não sei ainda"] as const;

export function normalizePhone(value: string) {
  return value.replace(/\D/g, "").slice(0, 13);
}

export function createPublicRequestPayload(data: PublicRequestInput, source: string, clientRequestId: string, turnstileToken = "") {
  const segment = data.segment === "outro" ? data.otherSegment?.trim() || "Outro segmento" : data.segment;
  const common = {
    name: data.name.trim(),
    whatsapp: normalizePhone(data.whatsapp),
    city: data.city.trim(),
    state: data.state,
    uf: data.state,
    consent: data.consent,
    source,
    companySite: data.companySite || "",
    clientRequestId,
    idempotencyKey: clientRequestId,
    turnstileToken,
  };

  if (data.requestType === "sample") {
    return { ...common, niche: segment, segment, quantity: 10, deliveryFormat: "xlsx" };
  }

  return { ...common, segment, location: data.city.trim(), quantity: data.quantity, notes: data.notes?.trim() || "" };
}
