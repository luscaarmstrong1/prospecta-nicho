import { NextResponse } from "next/server";
import { requireAdmin, integrationStatus } from "@/lib/server/admin-auth";

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return [{ id: "demo" }];
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = requireAdmin(request);
  if (denied) return denied;
  const { id } = await params;
  return NextResponse.json({
    ok: true,
    id,
    status: "pending_infrastructure",
    integrations: integrationStatus(),
  });
}
