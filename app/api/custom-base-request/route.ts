export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { z } from "zod";
import { sendTransactionalEmail, writeAuditLog } from "@/lib/server/integrations";
import {
  hasHoneypot,
  parseJsonBody,
  rateLimit,
  requireTrustedOrigin,
  sanitizePhone,
  sanitizeText,
  verifyTurnstileIfConfigured,
} from "@/lib/server/security";
import { createCrmRequest } from "@/src/features/crm/request-normalizer";
import { registerCrmRequest } from "@/src/server/services/crm";

const requestSchema = z.object({
  name: z.string().min(2).max(120),
  whatsapp: z.string().min(8).max(32),
  segment: z.string().min(2).max(160),
  city: z.string().min(2).max(160),
  state: z.string().length(2),
  quantity: z.string().min(1).max(80),
  notes: z.string().max(500).optional(),
  consent: z.literal(true),
  source: z.string().max(80).optional(),
  companySite: z.string().max(0).optional(),
  turnstileToken: z.string().optional(),
});

function quantityValue(value: string) {
  if (value.includes("Mais")) return 2000;
  const numeric = Number(value.replace(/\D/g, ""));
  return numeric > 0 ? numeric : 500;
}

export async function POST(request: Request) {
  const limited = rateLimit(request, "custom-base", 6, 60_000);
  if (limited) return limited;

  const forbiddenOrigin = requireTrustedOrigin(request);
  if (forbiddenOrigin) return forbiddenOrigin;

  const json = await parseJsonBody(request, 16_384);
  if (!json.ok) return json.response;
  if (hasHoneypot(json.body)) return NextResponse.json({ ok: true, message: "Solicitação recebida." });

  const parsed = requestSchema.safeParse(json.body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, message: "Confira os campos obrigatórios." }, { status: 400 });
  }
  if (!(await verifyTurnstileIfConfigured(request, parsed.data.turnstileToken))) {
    return NextResponse.json({ ok: false, message: "Falha na verificação de segurança." }, { status: 403 });
  }

  const data = parsed.data;
  const source = sanitizeText(data.source, 80) || "unified-request";
  const crmRequest = createCrmRequest({
    source,
    productSlug: "gerador-planilhas-cnpj",
    customer: { name: sanitizeText(data.name, 120), whatsapp: sanitizePhone(data.whatsapp) },
    commercialGoal: "Solicitação de base personalizada",
    filters: {
      segment: sanitizeText(data.segment, 160),
      city: sanitizeText(data.city, 160),
      uf: sanitizeText(data.state, 2).toUpperCase(),
      quantity: quantityValue(data.quantity),
      companySize: ["QUALQUER"],
      registrationStatus: "ATIVA",
      branchType: "QUALQUER",
      cnaes: [],
      deliveryFormat: "xlsx",
    },
    notes: sanitizeText(data.notes, 500) || undefined,
  });

  try {
    await registerCrmRequest(crmRequest);
    const mailPayload = { requestId: crmRequest.id, publicCode: crmRequest.publicCode, source, segment: crmRequest.filters.segment };
    await Promise.all([
      sendTransactionalEmail("custom_request_internal", mailPayload),
      writeAuditLog("custom_request_submitted", { id: crmRequest.id, source }),
    ]);
    return NextResponse.json({
      ok: true,
      id: crmRequest.id,
      publicCode: crmRequest.publicCode,
      status: "analysis",
      crm: { requestId: crmRequest.id, publicCode: crmRequest.publicCode, product: "Gerador de planilhas CNPJ", enrichment: "locked_paid_addon" },
      message: "Solicitação recebida. A equipe valida o recorte antes da cobrança.",
    });
  } catch {
    return NextResponse.json({ ok: false, message: "Não foi possível enviar sua solicitação agora. Tente novamente." }, { status: 500 });
  }
}
