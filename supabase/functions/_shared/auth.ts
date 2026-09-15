import { env } from "./env.ts";
import { errorJson } from "./responses.ts";

export function getBearerToken(request: Request) {
  const authorization = request.headers.get("authorization") || "";
  if (authorization.toLowerCase().startsWith("bearer ")) return authorization.slice(7).trim();
  return request.headers.get("x-admin-session") || "";
}

export function requireAdmin(request: Request) {
  const expected = env("ADMIN_API_TOKEN");
  if (!expected) return errorJson(request, "ADMIN_TOKEN_NOT_CONFIGURED", "ADMIN_API_TOKEN nao configurado no Supabase.", 503);
  if (getBearerToken(request) !== expected) return errorJson(request, "ADMIN_UNAUTHORIZED", "Sessao administrativa invalida.", 401);
  return null;
}
