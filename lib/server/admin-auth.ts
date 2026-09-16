import { NextResponse } from "next/server";
import { type AdminPermission, normalizeAdminRole, roleHasPermission } from "@/lib/admin-permissions";

const adminCookieName = "prospecta_admin_session";

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

async function validateSupabaseAdminToken(token: string, permission: AdminPermission) {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) return { ok: false, status: 503 as const };

  const baseUrl = supabaseUrl.replace(/\/+$/, "");
  const userPayload = (await readJson(`${baseUrl}/auth/v1/user`, {
    headers: { apikey: serviceKey, authorization: `Bearer ${token}` },
  })) as { id?: string } | null;
  if (!userPayload?.id) return { ok: false, status: 401 as const };

  const headers = { apikey: serviceKey, authorization: `Bearer ${serviceKey}` };
  const adminProfiles = (await readJson(
    `${baseUrl}/rest/v1/admin_profiles?id=eq.${encodeURIComponent(userPayload.id)}&select=role&limit=1`,
    { headers },
  )) as Array<{ role?: string }> | null;
  const profiles = adminProfiles?.[0]
    ? null
    : ((await readJson(`${baseUrl}/rest/v1/profiles?id=eq.${encodeURIComponent(userPayload.id)}&select=role&limit=1`, {
        headers,
      })) as Array<{ role?: string }> | null);

  const role = normalizeAdminRole(adminProfiles?.[0]?.role || profiles?.[0]?.role);
  if (!role) return { ok: false, status: 403 as const };
  if (!roleHasPermission(role, permission)) return { ok: false, status: 403 as const };
  return { ok: true, status: 200 as const, role };
}

export async function requireAdmin(request: Request, permission: AdminPermission = "admin:read") {
  if (process.env.NEXT_PUBLIC_STATIC_EXPORT === "true") return null;

  const expected = process.env.ADMIN_API_TOKEN;
  const header = request.headers.get("authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  const cookieToken = readCookieToken(request);
  const breakGlassEnabled = process.env.ENABLE_BREAK_GLASS_ADMIN === "true";

  if (breakGlassEnabled && expected && (token === expected || cookieToken === expected)) return null;

  const tokenResult = token ? await validateSupabaseAdminToken(token, permission) : null;
  if (tokenResult?.ok) return null;
  const cookieResult = cookieToken ? await validateSupabaseAdminToken(cookieToken, permission) : null;
  if (cookieResult?.ok) return null;

  if (!expected && !(process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL)) {
    return NextResponse.json({ ok: false, message: "Autenticação administrativa não configurada." }, { status: 503 });
  }
  if (tokenResult?.status === 403 || cookieResult?.status === 403) {
    return NextResponse.json({ ok: false, message: "Usuário sem permissão para esta ação." }, { status: 403 });
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
