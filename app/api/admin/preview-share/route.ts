export const dynamic = "force-dynamic";

import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/server/admin-auth";

const schema = z.object({
  page: z.string().min(1),
  revision: z.string().min(1),
  expiresInHours: z.number().min(1).max(168).default(24),
});

export async function POST(request: Request) {
  const adminError = await requireAdmin(request);
  if (adminError) return adminError;

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, message: "Payload invalido.", issues: parsed.error.issues }, { status: 400 });
  }

  const expiresAt = Date.now() + parsed.data.expiresInHours * 60 * 60 * 1000;
  const token = crypto
    .createHmac("sha256", process.env.ADMIN_API_TOKEN || "preview")
    .update(`${parsed.data.page}:${parsed.data.revision}:${expiresAt}`)
    .digest("hex");

  return NextResponse.json({
    ok: true,
    token,
    expiresAt,
    href: `/admin/preview/share/${token}`,
    revocable: true,
  });
}



