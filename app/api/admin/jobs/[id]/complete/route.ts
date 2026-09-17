export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return [{ id: "demo" }];
}

import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/server/admin-auth";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  const denied = await requireAdmin(request, "job:update");
  if (denied) return denied;

  await params;
  return NextResponse.json(
    {
      ok: false,
      code: "WORKER_FINALIZATION_REQUIRED",
      message: "A conclusão manual foi desativada. O worker local registra o export validado de forma transacional.",
    },
    { status: 409 },
  );
}


