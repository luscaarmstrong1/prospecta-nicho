export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { customRequestSchema } from "@/src/schemas/custom-request";
import { submitCustomRequest } from "@/src/server/services/custom-requests";
import { logger } from "@/src/lib/security/logger";
import {
  hasHoneypot,
  parseJsonBody,
  rateLimit,
  requireTrustedOrigin,
  verifyTurnstileIfConfigured,
} from "@/lib/server/security";

export async function POST(request: Request) {
  const limited = rateLimit(request, "custom-requests", 5, 60_000);
  if (limited) return limited;

  const forbiddenOrigin = requireTrustedOrigin(request);
  if (forbiddenOrigin) return forbiddenOrigin;

  const json = await parseJsonBody(request, 16_384);
  if (!json.ok) return json.response;

  const body = json.body;
  if (hasHoneypot(body)) {
    logger.warn("custom_request_honeypot", { source: body.source });
    return NextResponse.json({ ok: true, message: "Solicitação recebida." });
  }

  const parsed = customRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, message: "Confira os campos obrigatórios." }, { status: 400 });
  }

  const turnstileOk = await verifyTurnstileIfConfigured(request, parsed.data.turnstileToken);
  if (!turnstileOk) {
    return NextResponse.json({ ok: false, message: "Falha na verificação de segurança." }, { status: 403 });
  }

  try {
    const responseBody = await submitCustomRequest(parsed.data);
    logger.info("custom_request_submitted", { source: parsed.data.source, segment: parsed.data.segment });
    return NextResponse.json(responseBody);
  } catch (error) {
    logger.error("custom_request_failed", { error: error instanceof Error ? error.message : "unknown" });
    return NextResponse.json({ ok: false, message: "Nao foi possível salvar a solicitação agora." }, { status: 500 });
  }
}


