export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { z } from "zod";
import { normalizeAdminRole } from "@/lib/admin-permissions";
import { createAdminSession, ADMIN_COOKIE_NAME } from "@/lib/server/admin-session";

const bodySchema = z.object({
  token: z.string().optional(),
  email: z.string().email().optional(),
  password: z.string().optional(),
});

async function readJson(url: string, init: RequestInit) {
  const response = await fetch(url, init);
  if (!response.ok) return null;
  return response.json().catch(() => null);
}

async function verifyAdminRole(userId: string) {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) return "";
  const baseUrl = supabaseUrl.replace(/\/+$/, "");
  const headers = { apikey: serviceKey, authorization: `Bearer ${serviceKey}` };
  const adminProfiles = (await readJson(
    `${baseUrl}/rest/v1/admin_profiles?id=eq.${encodeURIComponent(userId)}&select=role&limit=1`,
    { headers }
  )) as Array<{ role?: string }> | null;
  const profiles = adminProfiles?.[0]
    ? null
    : ((await readJson(
        `${baseUrl}/rest/v1/profiles?id=eq.${encodeURIComponent(userId)}&select=role&limit=1`,
        { headers }
      )) as Array<{ role?: string }> | null);
  return normalizeAdminRole(adminProfiles?.[0]?.role || profiles?.[0]?.role);
}

export async function POST(request: Request) {
  // CSRF / Origin verification
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  if (origin && host) {
    try {
      const originHost = new URL(origin).host;
      if (originHost !== host) {
        return NextResponse.json({ ok: false, message: "Origem não permitida." }, { status: 403 });
      }
    } catch {
      return NextResponse.json({ ok: false, message: "Origem inválida." }, { status: 403 });
    }
  }

  const body = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, message: "Token administrativo invalido." }, { status: 401 });
  }

  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const { email, password, token } = parsed.data;

  // 1. Supabase Email/Password authentication
  if (email && password) {
    if (!supabaseUrl || !anonKey) {
      return NextResponse.json({ ok: false, message: "Supabase Auth nao configurado." }, { status: 503 });
    }
    const baseUrl = supabaseUrl.replace(/\/+$/, "");
    const session = (await readJson(`${baseUrl}/auth/v1/token?grant_type=password`, {
      method: "POST",
      headers: { apikey: anonKey, authorization: `Bearer ${anonKey}`, "content-type": "application/json" },
      body: JSON.stringify({ email, password }),
    })) as { access_token?: string; expires_in?: number; user?: { id?: string } } | null;

    const role = session?.user?.id ? await verifyAdminRole(session.user.id) : "";
    if (!session?.access_token || !role || !session.user?.id) {
      return NextResponse.json({ ok: false, message: "Email ou senha administrativa inválidos." }, { status: 401 });
    }

    const ttl = session.expires_in || 8 * 60 * 60;
    const signedSessionToken = await createAdminSession(
      { userId: session.user.id, role },
      ttl
    );

    const response = NextResponse.json({
      ok: true,
      session: {
        accessToken: session.access_token,
        expiresAt: new Date(Date.now() + ttl * 1000).toISOString(),
        role,
      },
    });

    response.cookies.set(ADMIN_COOKIE_NAME, signedSessionToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: ttl,
    });
    return response;
  }

  // 2. Break-glass admin token
  const allowTokenLogin =
    process.env.ENABLE_BREAK_GLASS_ADMIN === "true" &&
    (process.env.NODE_ENV !== "production" || process.env.ENABLE_ADMIN_TOKEN_LOGIN === "true");
  const expected = allowTokenLogin ? process.env.ADMIN_API_TOKEN : "";
  if (!expected) {
    return NextResponse.json({ ok: false, message: "ADMIN_API_TOKEN nao configurado." }, { status: 503 });
  }
  if (!token || token !== expected) {
    return NextResponse.json({ ok: false, message: "Token administrativo invalido." }, { status: 401 });
  }

  // Issue signed session even for break-glass token!
  const signedSessionToken = await createAdminSession(
    { userId: "break-glass-admin", role: "admin" },
    8 * 60 * 60
  );

  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_COOKIE_NAME, signedSessionToken, {
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
  response.cookies.set(ADMIN_COOKIE_NAME, "", { path: "/", maxAge: 0 });
  return response;
}
