export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/server/admin-auth";
import { crmRequestSchema } from "@/src/schemas/request.schema";
import { createManualCrmRequest, listCrmRequests } from "@/src/server/services/crm";

export async function GET(request: Request) {
  const denied = requireAdmin(request);
  if (denied) return denied;
  return NextResponse.json({ ok: true, requests: listCrmRequests() });
}

export async function POST(request: Request) {
  const denied = requireAdmin(request);
  if (denied) return denied;

  const body = await request.json().catch(() => null);
  const parsed = crmRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, message: "Dados inválidos.", issues: parsed.error.issues }, { status: 400 });
  }

  const crmRequest = await createManualCrmRequest(parsed.data);
  return NextResponse.json({ ok: true, request: crmRequest }, { status: 201 });
}


