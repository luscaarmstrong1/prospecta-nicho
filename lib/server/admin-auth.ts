import { NextResponse } from "next/server";

const adminCookieName = "prospecta_admin_session";
const allowedRoles = new Set(["admin", "editor", "operador", "operator", "leitura", "read"]);

function readCookieToken(request: Request) {
  const cookie = request.headers.get("cookie") || "";
  const match = cookie
    .split(";")
    .map((item) => item.trim())
    .find((item) => item.startsWith(`${adminCookieName}=`));
  return match ? decodeURIComponent(match.slice(adminCookieName.length + 1)) : "";
}

async function readJson(url: string, init: RequestInit) {
  const response = await fetch(url, init);
  if (!response.ok) return null;
  return response.json().catch(() => null);
}

async function validateSupabaseAdminToken(token: string) {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) return false;
  const baseUrl = supabaseUrl.replace(/\/+$/, "");
  const userPayload = await readJson(`${baseUrl}/auth/v1/user`, {
    headers: { apikey: serviceKey, authorization: `Bearer ${token}` },
  }) as { id?: string } | null;
  if (!userPayload?.id) return false;

  const headers = { apikey: serviceKey, authorization: `Bearer ${serviceKey}` };
  const adminProfiles = await readJson(`${baseUrl}/rest/v1/admin_profiles?id=eq.${encodeURIComponent(userPayload.id)}&select=role&limit=1`, { headers }) as Array<{ role?: string }> | null;
  const profiles = adminProfiles?.[0]
    ? null
    : await readJson(`${baseUrl}/rest/v1/profiles?id=eq.${encodeURIComponent(userPayload.id)}&select=role&limit=1`, { headers }) as Array<{ role?: string }> | null;
  const role = String(adminProfiles?.[0]?.role || profiles?.[0]?.role || "").toLowerCase();
  return allowedRoles.has(role);
}

export async function requireAdmin(request: Request) {
  if (process.env.NEXT_PUBLIC_STATIC_EXPORT === "true") return null;
  const expected = process.env.ADMIN_API_TOKEN;
  const header = request.headers.get("authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  const cookieToken = readCookieToken(request);
  if (expected && (token === expected || cookieToken === expected)) return null;
  if ((token && await validateSupabaseAdminToken(token)) || (cookieToken && await validateSupabaseAdminToken(cookieToken))) return null;
  if (!expected && !(process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL)) {
    return NextResponse.json({ ok: false, message: "Autenticação administrativa nao configurada." }, { status: 503 });
  }

  return NextResponse.json({ ok: false, message: "Nao autorizado." }, { status: 401 });
}

export function integrationStatus() {
  return {
    clickhouse: Boolean(process.env.CLICKHOUSE_URL && process.env.CLICKHOUSE_USERNAME && process.env.CLICKHOUSE_PASSWORD),
    r2: Boolean((process.env.R2_BUCKET || process.env.R2_BUCKET_NAME) && process.env.R2_ACCESS_KEY_ID && process.env.R2_SECRET_ACCESS_KEY),
    redis: Boolean(process.env.REDIS_URL),
    supabase: Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY),
  };
}
