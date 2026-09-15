export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/server/admin-auth";
import { listCrmExports } from "@/src/server/services/crm";

export async function GET(request: Request) {
  const denied = await requireAdmin(request);
  if (denied) return denied;
  return NextResponse.json({ ok: true, exports: listCrmExports() });
}



