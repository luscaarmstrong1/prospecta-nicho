import { NextResponse } from "next/server";
import { requireAdmin, integrationStatus } from "@/lib/server/admin-auth";

export const dynamic = "force-static";

export async function GET(request: Request) {
  const denied = requireAdmin(request);
  if (denied) return denied;
  return NextResponse.json({
    ok: true,
    status: "not_configured",
    integrations: integrationStatus(),
  });
}

