export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return [{ id: "demo" }];
}

import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/server/admin-auth";
import { getCnpjJob } from "@/src/server/services/crm";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: Params) {
  const denied = await requireAdmin(request);
  if (denied) return denied;
  const { id } = await params;
  const job = getCnpjJob(id);
  if (!job) return NextResponse.json({ ok: false, message: "Job nao encontrado." }, { status: 404 });
  return NextResponse.json({ ok: true, jobId: job.id, status: job.status, logs: job.logs });
}


