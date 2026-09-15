export const dynamic = "force-static";

import { NextResponse } from "next/server";
import { z } from "zod";

const bodySchema = z.object({
  token: z.string().min(1),
});

const adminCookieName = "prospecta_admin_session";

export async function POST(request: Request) {
  const expected = process.env.ADMIN_API_TOKEN;
  if (!expected) {
    return NextResponse.json({ ok: false, message: "ADMIN_API_TOKEN nao configurado." }, { status: 503 });
  }

  const body = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success || parsed.data.token !== expected) {
    return NextResponse.json({ ok: false, message: "Token administrativo invalido." }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(adminCookieName, expected, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(adminCookieName, "", { path: "/", maxAge: 0 });
  return response;
}


