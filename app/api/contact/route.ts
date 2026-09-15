export const dynamic = "force-static";

import { NextResponse } from "next/server";
import { z } from "zod";
import { persistLead, sendTransactionalEmail, writeAuditLog } from "@/lib/server/integrations";
import {
  hasHoneypot,
  parseJsonBody,
  rateLimit,
  requireTrustedOrigin,
  sanitizePhone,
  sanitizeText,
  verifyTurnstileIfConfigured,
} from "@/lib/server/security";

const schema = z.object({
  name: z.string().min(2).max(120),
  company: z.string().min(2).max(160),
  email: z.string().email().max(180),
  whatsapp: z.string().min(8).max(32),
  subject: z.enum([
    "Duvida sobre uma base",
    "Solicitar base personalizada",
    "Suporte sobre pedido",
    "Pagamento",
    "Parceria",
    "Privacidade",
    "Outro",
  ]),
  message: z.string().min(10).max(3000),
  consent: z.union([z.literal(true), z.literal("true")]),
  companySite: z.string().optional(),
  turnstileToken: z.string().optional(),
});

export async function POST(request: Request) {
  const limited = rateLimit(request, "contact", 6, 60_000);
  if (limited) return limited;

  const forbiddenOrigin = requireTrustedOrigin(request);
  if (forbiddenOrigin) return forbiddenOrigin;

  const json = await parseJsonBody(request, 16_384);
  if (!json.ok) return json.response;

  const raw = json.body;
  if (hasHoneypot(raw)) {
    return NextResponse.json({ ok: true, message: "Contato recebido." });
  }

  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, message: "Dados inválidos." }, { status: 400 });
  }

  const turnstileOk = await verifyTurnstileIfConfigured(request, parsed.data.turnstileToken);
  if (!turnstileOk) {
    return NextResponse.json({ ok: false, message: "Falha na verificação de segurança." }, { status: 403 });
  }

  const payload = {
    source: "contact",
    name: sanitizeText(parsed.data.name, 120),
    company: sanitizeText(parsed.data.company, 160),
    email: sanitizeText(parsed.data.email, 180),
    whatsapp: sanitizePhone(parsed.data.whatsapp),
    subject: parsed.data.subject,
    message: sanitizeText(parsed.data.message, 3000),
    consent: true,
    createdAt: new Date().toISOString(),
  };

  const persistence = await persistLead("contact_requests", payload);
  const internalEmail = await sendTransactionalEmail("contact_internal", payload);
  const confirmationEmail = await sendTransactionalEmail("contact_confirmation", payload);
  await writeAuditLog("contact_submitted", { email: payload.email, subject: payload.subject });

  return NextResponse.json({
    ok: true,
    id: persistence.id,
    integrations: {
      supabase: persistence.configured,
      resendInternal: internalEmail.configured,
      resendConfirmation: confirmationEmail.configured,
    },
  });
}


