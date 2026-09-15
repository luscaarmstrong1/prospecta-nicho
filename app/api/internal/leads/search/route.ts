export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { requireAdmin, integrationStatus } from "@/lib/server/admin-auth";

export async function POST(request: Request) {
  const denied = requireAdmin(request);
  if (denied) return denied;
  const body = await request.json();
  return NextResponse.json({
    ok: true,
    records: [],
    maskedPreview: true,
    filters: body,
    integrations: integrationStatus(),
    message: "Consulta interna pronta para plugar ClickHouse. Nenhum dado real e exposto sem integração configurada.",
  });
}


