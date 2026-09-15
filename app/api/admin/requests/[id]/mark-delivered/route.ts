export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return [{ id: "demo" }];
}

import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/server/admin-auth";
import { markRequestDelivered } from "@/src/server/services/crm";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  const denied = await requireAdmin(request, "request:update");
  if (denied) return denied;
  const { id } = await params;
  const crmRequest = await markRequestDelivered(id);
  if (!crmRequest) return NextResponse.json({ ok: false, message: "Pedido nao encontrado." }, { status: 404 });
  return NextResponse.json({ ok: true, request: crmRequest });
}


