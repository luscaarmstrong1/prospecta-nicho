import { handleCors } from "../_shared/cors.ts";
import { env } from "../_shared/env.ts";
import { json, errorJson } from "../_shared/responses.ts";
import { text } from "../_shared/validation.ts";

Deno.serve(async (request) => {
  const cors = handleCors(request);
  if (cors) return cors;
  if (request.method !== "POST") return errorJson(request, "METHOD_NOT_ALLOWED", "Metodo nao permitido.", 405);
  const expected = env("ADMIN_API_TOKEN");
  if (!expected) return errorJson(request, "ADMIN_TOKEN_NOT_CONFIGURED", "ADMIN_API_TOKEN nao configurado no Supabase.", 503);
  const body = await request.json().catch(() => ({})) as Record<string, unknown>;
  if (text(body.token, 200) !== expected) return errorJson(request, "ADMIN_UNAUTHORIZED", "Token administrativo invalido.", 401);
  return json(request, { ok: true, session: { expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString() } });
});
