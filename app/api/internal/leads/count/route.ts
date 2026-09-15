export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { requireAdmin, integrationStatus } from "@/lib/server/admin-auth";

export async function POST(request: Request) {
  const denied = await requireAdmin(request);
  if (denied) return denied;
  return NextResponse.json({
    ok: true,
    countRange: null,
    integrations: integrationStatus(),
    message: "Contagem depende do ClickHouse configurado e nao e simulada publicamente.",
  });
}



