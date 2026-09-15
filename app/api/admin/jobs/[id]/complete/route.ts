export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return [{ id: "demo" }];
}

import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/server/admin-auth";
import { completeJobWithExport } from "@/src/server/services/crm";

type Params = { params: Promise<{ id: string }> };

const bodySchema = z.object({
  fileUrl: z.string().url(),
  rowCount: z.coerce.number().int().min(0).default(0),
  format: z.enum(["xlsx", "csv", "both"]).default("xlsx"),
  fields: z.array(z.string().min(1)).optional(),
});

export async function POST(request: Request, { params }: Params) {
  const denied = await requireAdmin(request);
  if (denied) return denied;

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, errors: parsed.error.flatten() }, { status: 400 });
  }

  const crmExport = await completeJobWithExport(id, parsed.data);
  if (!crmExport) {
    return NextResponse.json({ ok: false, message: "Job nao encontrado." }, { status: 404 });
  }

  return NextResponse.json({ ok: true, export: crmExport });
}


