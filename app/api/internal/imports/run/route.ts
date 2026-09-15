export const dynamic = "force-static";

import { NextResponse } from "next/server";
import { requireAdmin, integrationStatus } from "@/lib/server/admin-auth";

export async function POST(request: Request) {
  const denied = requireAdmin(request);
  if (denied) return denied;
  return NextResponse.json({
    ok: true,
    started: false,
    integrations: integrationStatus(),
    message: "Importação nacional deve rodar no worker Python, fora de Vercel/GitHub Pages.",
  });
}


