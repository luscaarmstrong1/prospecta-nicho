import { NextResponse } from "next/server";

const adminCookieName = "prospecta_admin_session";

function readCookieToken(request: Request) {
  const cookie = request.headers.get("cookie") || "";
  const match = cookie
    .split(";")
    .map((item) => item.trim())
    .find((item) => item.startsWith(`${adminCookieName}=`));
  return match ? decodeURIComponent(match.slice(adminCookieName.length + 1)) : "";
}

export function requireAdmin(request: Request) {
  const expected = process.env.ADMIN_API_TOKEN;
  if (!expected) {
    return NextResponse.json({ ok: false, message: "ADMIN_API_TOKEN não configurado." }, { status: 503 });
  }

  const header = request.headers.get("authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (token !== expected && readCookieToken(request) !== expected) {
    return NextResponse.json({ ok: false, message: "Nao autorizado." }, { status: 401 });
  }

  return null;
}

export function integrationStatus() {
  return {
    clickhouse: Boolean(process.env.CLICKHOUSE_URL && process.env.CLICKHOUSE_USERNAME && process.env.CLICKHOUSE_PASSWORD),
    r2: Boolean((process.env.R2_BUCKET || process.env.R2_BUCKET_NAME) && process.env.R2_ACCESS_KEY_ID && process.env.R2_SECRET_ACCESS_KEY),
    redis: Boolean(process.env.REDIS_URL),
    supabase: Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY),
  };
}
