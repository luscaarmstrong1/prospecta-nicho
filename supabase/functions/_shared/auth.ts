import { env } from "./env.ts";
import { errorJson } from "./responses.ts";
import { serviceClient } from "./db.ts";
import { type AdminPermission, normalizeAdminRole, roleHasPermission } from "./permissions.ts";

export function getBearerToken(request: Request) {
  const authorization = request.headers.get("authorization") || "";
  if (authorization.toLowerCase().startsWith("bearer ")) return authorization.slice(7).trim();
  return request.headers.get("x-admin-session") || "";
}

export async function requireAdmin(request: Request, permission: AdminPermission = "admin:read") {
  const token = getBearerToken(request);
  const expected = env("ADMIN_API_TOKEN");
  if (env("ENABLE_BREAK_GLASS_ADMIN") === "true" && expected && token === expected) return null;
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
    const role = normalizeAdminRole(adminProfile?.role || profile?.role);
    if (!role) return errorJson(request, "ADMIN_FORBIDDEN", "Usuario sem perfil administrativo.", 403);
    if (!roleHasPermission(role, permission)) {
      return errorJson(request, "ADMIN_FORBIDDEN", "Usuario sem permissao para esta acao.", 403);
    }
  } catch (_error) {
    return errorJson(request, "ADMIN_AUTH_UNAVAILABLE", "Nao foi possivel validar a sessao administrativa.", 503);
  }
  return null;
}
