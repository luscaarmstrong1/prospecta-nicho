export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { z } from "zod";
import { builderSchema } from "@/lib/editor-schema";
import { persistLead, sendTransactionalEmail, writeAuditLog } from "@/lib/server/integrations";
import { createCrmRequest, createCrmRequestFromBuilder } from "@/src/features/crm/request-normalizer";
import { registerCrmRequest } from "@/src/server/services/crm";
import {
  hasHoneypot,
  parseJsonBody,
  rateLimit,
  requireTrustedOrigin,
  sanitizePhone,
  sanitizeText,
  verifyTurnstileIfConfigured,
} from "@/lib/server/security";

const legacySchema = z.object({
  name: z.string().min(2),
  company: z.string().min(2),
  email: z.string().email(),
  whatsapp: z.string().min(8),
  niche: z.string().min(2),
  city: z.string().min(2),
  state: z.string().optional(),
  cnae: z.string().optional(),
  quantity: z.string().optional(),
  goal: z.string().min(5),
  notes: z.string().optional(),
  consent: z.literal(true),
  companySite: z.string().max(0).optional(),
  turnstileToken: z.string().optional(),
});

export async function POST(request: Request) {
  const limited = rateLimit(request, "custom-base", 6, 60_000);
  if (limited) return limited;

  const forbiddenOrigin = requireTrustedOrigin(request);
  if (forbiddenOrigin) return forbiddenOrigin;

  const json = await parseJsonBody(request, 24_576);
  if (!json.ok) return json.response;

  const body = json.body;
  if (hasHoneypot(body)) return NextResponse.json({ ok: true, message: "Solicitação recebida." });

  const parsed = builderSchema.safeParse(body);
  const legacy = legacySchema.safeParse(body);

  if (!parsed.success && !legacy.success) {
    return NextResponse.json({ ok: false, message: "Dados inválidos." }, { status: 400 });
  }

  const turnstileToken = (parsed.success ? parsed.data.turnstileToken : legacy.success ? legacy.data.turnstileToken : undefined);
  const turnstileOk = await verifyTurnstileIfConfigured(request, turnstileToken);
  if (!turnstileOk) {
    return NextResponse.json({ ok: false, message: "Falha na verificação de segurança." }, { status: 403 });
  }

  const source = parsed.success ? "base-builder" : "custom-base-form";
  const data = parsed.success ? parsed.data : legacy.data;
  if (!data) {
    return NextResponse.json({ ok: false, message: "Dados inválidos." }, { status: 400 });
  }
  const payload = {
    source,
    name: sanitizeText(data.name, 120),
    email: sanitizeText(data.email, 180),
    whatsapp: sanitizePhone(data.whatsapp),
    company: sanitizeText("company" in data ? data.company : "", 160),
    city: sanitizeText(data.city, 160),
    segment: sanitizeText("segment" in data ? data.segment : data.niche, 160),
    objective: sanitizeText(data.goal, 240),
    filters: parsed.success ? data : undefined,
    status: "analysis",
    createdAt: new Date().toISOString(),
  };

  const persistence = await persistLead("custom_requests", payload);
  const crmRequest = await registerCrmRequest(
    parsed.success
      ? createCrmRequestFromBuilder(parsed.data, persistence.id)
      : createCrmRequest({
          id: persistence.id,
          source,
          customer: {
            name: payload.name,
            company: payload.company || undefined,
            email: payload.email || undefined,
            whatsapp: payload.whatsapp,
          },
          commercialGoal: payload.objective,
          filters: {
            segment: payload.segment,
            uf: sanitizeText("state" in data ? data.state : "", 2).toUpperCase() || undefined,
            city: payload.city,
            cnaes: "cnae" in data && data.cnae ? [sanitizeText(data.cnae, 20).replace(/\D/g, "")].filter(Boolean) : [],
          },
        }),
  );
  const internalEmail = await sendTransactionalEmail("custom_request_internal", payload);
  const confirmationEmail = await sendTransactionalEmail("custom_request_confirmation", payload);
  await writeAuditLog("custom_request_submitted", { id: persistence.id, source, email: payload.email });

  return NextResponse.json({
    ok: true,
    id: persistence.id,
    leadSource: source,
    status: "analysis",
    crm: {
      requestId: crmRequest.id,
      publicCode: crmRequest.publicCode,
      product: "Gerador de planilhas com dados públicos de CNPJ",
      enrichment: "locked_paid_addon",
    },
    message: "Solicitação recebida. A equipe valida filtros, disponibilidade e escopo antes de cobrança.",
    integrations: {
      supabase: persistence.configured,
      resendInternal: internalEmail.configured,
      resendConfirmation: confirmationEmail.configured,
    },
  });
}


