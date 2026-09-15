export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { requireAdmin, integrationStatus } from "@/lib/server/admin-auth";

export async function POST(request: Request) {
  const denied = await requireAdmin(request);
  if (denied) return denied;
  return NextResponse.json({
    ok: true,
    started: false,
    integrations: integrationStatus(),
    message: "Importação nacional deve rodar no worker Python, fora de Vercel/GitHub Pages.",
  });
}



