export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { requireAdmin, integrationStatus } from "@/lib/server/admin-auth";

export async function POST(request: Request) {
  const denied = await requireAdmin(request, "internal:write");
  if (denied) return denied;
  const body = await request.json();
  return NextResponse.json({
    ok: true,
    exportQueued: false,
    filtersFrozen: body,
    integrations: integrationStatus(),
    message: "Exportação so sera enfileirada apos pagamento aprovado ou aprovação interna e infraestrutura configurada.",
  });
}



