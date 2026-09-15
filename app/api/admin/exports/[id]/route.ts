export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return [{ id: "demo" }];
}

import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/server/admin-auth";
import { getCrmExportForAdmin } from "@/src/server/services/crm";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: Params) {
  const denied = requireAdmin(request);
  if (denied) return denied;

  const { id } = await params;
  const crmExport = await getCrmExportForAdmin(id);
  if (!crmExport) {
    return NextResponse.json({ ok: false, message: "Export não encontrado." }, { status: 404 });
  }

  return NextResponse.json({ ok: true, export: crmExport });
}


