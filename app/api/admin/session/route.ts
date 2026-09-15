export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { z } from "zod";

const bodySchema = z.object({
  token: z.string().optional(),
  email: z.string().email().optional(),
  password: z.string().optional(),
});

const adminCookieName = "prospecta_admin_session";
const allowedRoles = new Set(["admin", "editor", "operador", "operator", "leitura", "read"]);

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
  const adminProfiles = await readJson(`${baseUrl}/rest/v1/admin_profiles?id=eq.${encodeURIComponent(userId)}&select=role&limit=1`, { headers }) as Array<{ role?: string }> | null;
  const profiles = adminProfiles?.[0]
    ? null
    : await readJson(`${baseUrl}/rest/v1/profiles?id=eq.${encodeURIComponent(userId)}&select=role&limit=1`, { headers }) as Array<{ role?: string }> | null;
  const role = String(adminProfiles?.[0]?.role || profiles?.[0]?.role || "").toLowerCase();
  return allowedRoles.has(role) ? role : "";
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, message: "Token administrativo invalido." }, { status: 401 });
  }

  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const { email, password, token } = parsed.data;
  if (email && password) {
    if (!supabaseUrl || !anonKey) return NextResponse.json({ ok: false, message: "Supabase Auth nao configurado." }, { status: 503 });
    const baseUrl = supabaseUrl.replace(/\/+$/, "");
    const session = await readJson(`${baseUrl}/auth/v1/token?grant_type=password`, {
      method: "POST",
      headers: { apikey: anonKey, authorization: `Bearer ${anonKey}`, "content-type": "application/json" },
      body: JSON.stringify({ email, password }),
    }) as { access_token?: string; expires_in?: number; user?: { id?: string } } | null;
    const role = session?.user?.id ? await verifyAdminRole(session.user.id) : "";
    if (!session?.access_token || !role) return NextResponse.json({ ok: false, message: "Email ou senha administrativa inválidos." }, { status: 401 });
    const response = NextResponse.json({ ok: true, session: { accessToken: session.access_token, expiresAt: new Date(Date.now() + (session.expires_in || 28_800) * 1000).toISOString(), role } });
    response.cookies.set(adminCookieName, session.access_token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: session.expires_in || 60 * 60 * 8,
    });
    return response;
  }

  const expected = process.env.ADMIN_API_TOKEN;
  if (!expected) return NextResponse.json({ ok: false, message: "ADMIN_API_TOKEN nao configurado." }, { status: 503 });
  if (!token || token !== expected) return NextResponse.json({ ok: false, message: "Token administrativo invalido." }, { status: 401 });

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


