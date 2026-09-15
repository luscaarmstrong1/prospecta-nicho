export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return [{ id: "demo" }];
}

import { NextResponse } from "next/server";
import { getCrmExportForAdmin, recordExportDownload, verifySignedExportToken } from "@/src/server/services/crm";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: Params) {
  if (process.env.NEXT_PUBLIC_STATIC_EXPORT === "true") {
    return NextResponse.json(
      { ok: false, message: "Exports privados usam Supabase Functions fora do GitHub Pages." },
      { status: 410 },
    );
  }

  const { id } = await params;
  const token = new URL(request.url).searchParams.get("token");
  if (!verifySignedExportToken(id, token)) {
    return NextResponse.json({ ok: false, message: "Link expirado ou inválido." }, { status: 403 });
  }

  const crmExport = await getCrmExportForAdmin(id);
  if (!crmExport || crmExport.status !== "ready") {
    return NextResponse.json({ ok: false, message: "Export não disponível." }, { status: 404 });
  }

  if (!crmExport.fileUrl) {
    return NextResponse.json(
      {
        ok: false,
        message: "Arquivo registrado sem URL de storage. Gere o export no worker e salve em storage privado.",
        exportId: crmExport.id,
      },
      { status: 409 },
    );
  }

  await recordExportDownload(crmExport.id, request);
  return NextResponse.redirect(crmExport.fileUrl);
}


