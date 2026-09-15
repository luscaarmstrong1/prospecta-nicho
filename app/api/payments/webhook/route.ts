export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { writeAuditLog } from "@/lib/server/integrations";
import { logger } from "@/src/lib/security/logger";

export async function POST(request: Request) {
  const payload = await request.text();
  const mpSecret = process.env.MERCADO_PAGO_WEBHOOK_SECRET;
  const asaasSecret = process.env.ASAAS_WEBHOOK_TOKEN;

  if (!mpSecret && !asaasSecret) {
    return NextResponse.json({ ok: false, message: "Webhook secret não configurado." }, { status: 501 });
  }

  await writeAuditLog("payment_webhook_received", {
    size: payload.length,
    provider: mpSecret ? "mercado-pago" : "asaas",
  });
  logger.info("payment_webhook_received", { size: payload.length, provider: mpSecret ? "mercado-pago" : "asaas" });

  return NextResponse.json({
    ok: true,
    message: "Webhook recebido. A aprovação de pedido exige validação de assinatura, idempotência e persistência configuradas.",
  });
}


