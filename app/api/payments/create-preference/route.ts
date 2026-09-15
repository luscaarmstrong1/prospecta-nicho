export const dynamic = "force-static";

import { NextResponse } from "next/server";
import { getConfiguredPaymentProvider } from "@/lib/payments/provider";
import { parseJsonBody, rateLimit, requireTrustedOrigin } from "@/lib/server/security";
import { getProduct } from "@/lib/site";
import { createPreferenceSchema } from "@/src/schemas/payment";

export async function POST(request: Request) {
  const limited = rateLimit(request, "payment-preference", 4, 60_000);
  if (limited) return limited;

  const forbiddenOrigin = requireTrustedOrigin(request);
  if (forbiddenOrigin) return forbiddenOrigin;

  const body = await parseJsonBody(request, 8_192);
  if (!body.ok) return body.response;

  const parsed = createPreferenceSchema.safeParse(body.body);

  if (!parsed.success) {
    return NextResponse.json({ ok: false, message: "Dados inválidos." }, { status: 400 });
  }

  const product = getProduct(parsed.data.productSlug);
  if (!product) {
    return NextResponse.json({ ok: false, message: "Produto não encontrado." }, { status: 404 });
  }

  if (product.slug === "base-personalizada") {
    return NextResponse.json(
      { ok: false, message: "Base personalizada exige validação de recorte antes da cobrança." },
      { status: 409 },
    );
  }

  const provider = getConfiguredPaymentProvider();
  if (!provider) {
    return NextResponse.json(
      { ok: false, message: "Nenhum provider de pagamento configurado. Use link público do produto ou WhatsApp." },
      { status: 501 },
    );
  }

  return NextResponse.json(
    {
      ok: false,
      provider,
      idempotencyKey: parsed.data.idempotencyKey || parsed.data.orderId || null,
      message: "Provider preparado. Ative a chamada real do checkout no backend com validação e idempotência.",
    },
    { status: 501 },
  );
}


