export const dynamic = "force-static";

import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/server/admin-auth";
import { listCnpjJobs } from "@/src/server/services/crm";

export async function GET(request: Request) {
  const denied = requireAdmin(request);
  if (denied) return denied;
  return NextResponse.json({ ok: true, jobs: listCnpjJobs() });
}


