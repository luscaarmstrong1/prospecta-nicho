export const dynamic = "force-static";

export function generateStaticParams() {
  return [{ id: "demo" }];
}

import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/server/admin-auth";
import { runPaidEnrichment } from "@/src/server/services/crm";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  const denied = requireAdmin(request);
  if (denied) return denied;
  const { id } = await params;

  try {
    const crmRequest = await runPaidEnrichment(id);
    if (!crmRequest) return NextResponse.json({ ok: false, message: "Pedido nao encontrado." }, { status: 404 });
    return NextResponse.json({ ok: true, request: crmRequest });
  } catch (error) {
    return NextResponse.json(
      { ok: false, message: error instanceof Error ? error.message : "Enriquecimento bloqueado." },
      { status: 402 },
    );
  }
}


