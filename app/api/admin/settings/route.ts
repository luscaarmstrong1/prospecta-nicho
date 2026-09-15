export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/server/admin-auth";
import { getCrmSettings } from "@/src/server/services/crm";

export async function GET(request: Request) {
  const denied = await requireAdmin(request, request.method === "GET" ? "settings:read" : "settings:write");
  if (denied) return denied;
  return NextResponse.json({ ok: true, settings: getCrmSettings() });
}



