export const dynamic = "force-static";

export function generateStaticParams() {
  return [{ id: "demo" }];
}

import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/server/admin-auth";
import { adminEnableEnrichmentSchema } from "@/src/schemas/admin.schema";
import { enablePaidEnrichment } from "@/src/server/services/crm";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  const denied = requireAdmin(request);
  if (denied) return denied;
  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const parsed = adminEnableEnrichmentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, message: "Add-on pago nao confirmado.", issues: parsed.error.issues }, { status: 400 });
  }
  const crmRequest = await enablePaidEnrichment(id);
  if (!crmRequest) return NextResponse.json({ ok: false, message: "Pedido nao encontrado." }, { status: 404 });
  return NextResponse.json({ ok: true, request: crmRequest });
}


