export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return [{ id: "demo" }];
}

import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/server/admin-auth";
import { createSignedExportUrl } from "@/src/server/services/crm";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  const denied = await requireAdmin(request);
  if (denied) return denied;

  const { id } = await params;
  const body = (await request.json().catch(() => ({}))) as { expiresInSeconds?: number };
  const expiresInSeconds = Math.min(Math.max(Number(body.expiresInSeconds || 24 * 60 * 60), 60), 7 * 24 * 60 * 60);
  const signed = await createSignedExportUrl(id, expiresInSeconds);

  if (!signed) {
    return NextResponse.json({ ok: false, message: "Export não disponível para link assinado." }, { status: 404 });
  }

  return NextResponse.json({ ok: true, signed });
}


