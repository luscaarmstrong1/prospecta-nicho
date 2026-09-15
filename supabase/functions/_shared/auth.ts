import { env } from "./env.ts";
import { errorJson } from "./responses.ts";
import { serviceClient } from "./db.ts";

export function getBearerToken(request: Request) {
  const authorization = request.headers.get("authorization") || "";
  if (authorization.toLowerCase().startsWith("bearer ")) return authorization.slice(7).trim();
  return request.headers.get("x-admin-session") || "";
}

const allowedRoles = new Set(["admin", "editor", "operador", "operator", "leitura", "read"]);

export async function requireAdmin(request: Request) {
  const token = getBearerToken(request);
  const expected = env("ADMIN_API_TOKEN");
  if (expected && token === expected) return null;
  if (!token) return errorJson(request, "ADMIN_UNAUTHORIZED", "Sessao administrativa invalida.", 401);

  try {
    const supabase = serviceClient();
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    const userId = userData.user?.id;
    if (userError || !userId) return errorJson(request, "ADMIN_UNAUTHORIZED", "Sessao administrativa invalida.", 401);

    const { data: adminProfile } = await supabase.from("admin_profiles").select("role").eq("id", userId).maybeSingle();
    const { data: profile } = adminProfile
      ? { data: null }
      : await supabase.from("profiles").select("role").eq("id", userId).maybeSingle();
    const role = String(adminProfile?.role || profile?.role || "").toLowerCase();
    if (!allowedRoles.has(role)) return errorJson(request, "ADMIN_FORBIDDEN", "Usuario sem perfil administrativo.", 403);
  } catch (_error) {
    return errorJson(request, "ADMIN_AUTH_UNAVAILABLE", "Nao foi possivel validar a sessao administrativa.", 503);
  }
  return null;
}
