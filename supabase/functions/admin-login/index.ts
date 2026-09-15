import { handleCors } from "../_shared/cors.ts";
import { env } from "../_shared/env.ts";
import { serviceClient } from "../_shared/db.ts";
import { json, errorJson } from "../_shared/responses.ts";
import { text } from "../_shared/validation.ts";

const allowedRoles = new Set(["admin", "editor", "operador", "operator", "leitura", "read"]);

Deno.serve(async (request) => {
  const cors = handleCors(request);
  if (cors) return cors;
  if (request.method !== "POST") return errorJson(request, "METHOD_NOT_ALLOWED", "Metodo nao permitido.", 405);
  const body = await request.json().catch(() => ({})) as Record<string, unknown>;
  const email = text(body.email, 320);
  const password = typeof body.password === "string" ? body.password : "";
  if (email && password) {
    const url = env("SUPABASE_URL") || env("NEXT_PUBLIC_SUPABASE_URL");
    const anonKey = env("SUPABASE_ANON_KEY") || env("NEXT_PUBLIC_SUPABASE_ANON_KEY");
    if (!url || !anonKey) return errorJson(request, "SUPABASE_AUTH_NOT_CONFIGURED", "Supabase Auth nao configurado.", 503);
    const loginResponse = await fetch(`${url.replace(/\/+$/, "")}/auth/v1/token?grant_type=password`, {
      method: "POST",
      headers: { apikey: anonKey, authorization: `Bearer ${anonKey}`, "content-type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!loginResponse.ok) return errorJson(request, "ADMIN_UNAUTHORIZED", "Email ou senha administrativa invalidos.", 401);
    const session = await loginResponse.json() as { access_token?: string; expires_in?: number; user?: { id?: string } };
    const userId = session.user?.id;
    if (!session.access_token || !userId) return errorJson(request, "ADMIN_UNAUTHORIZED", "Sessao administrativa invalida.", 401);

    const supabase = serviceClient();
    const { data: adminProfile } = await supabase.from("admin_profiles").select("role").eq("id", userId).maybeSingle();
    const { data: profile } = adminProfile
      ? { data: null }
      : await supabase.from("profiles").select("role").eq("id", userId).maybeSingle();
    const role = String(adminProfile?.role || profile?.role || "").toLowerCase();
    if (!allowedRoles.has(role)) return errorJson(request, "ADMIN_FORBIDDEN", "Usuario sem perfil administrativo.", 403);
    return json(request, {
      ok: true,
      session: {
        accessToken: session.access_token,
        expiresAt: new Date(Date.now() + (session.expires_in || 28_800) * 1000).toISOString(),
        role,
      },
    });
  }

  const expected = env("ADMIN_API_TOKEN");
  if (!expected) return errorJson(request, "ADMIN_TOKEN_NOT_CONFIGURED", "ADMIN_API_TOKEN nao configurado no Supabase.", 503);
  if (text(body.token, 200) !== expected) return errorJson(request, "ADMIN_UNAUTHORIZED", "Token administrativo invalido.", 401);
  return json(request, { ok: true, session: { accessToken: expected, expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(), role: "admin-token" } });
});
