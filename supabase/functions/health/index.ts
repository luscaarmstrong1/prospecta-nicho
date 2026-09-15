import { handleCors } from "../_shared/cors.ts";
import { serviceClient } from "../_shared/db.ts";
import { env } from "../_shared/env.ts";
import { json } from "../_shared/responses.ts";

Deno.serve(async (request) => {
  const cors = handleCors(request);
  if (cors) return cors;
  const checks = {
    supabaseUrl: { ok: Boolean(env("SUPABASE_URL") || env("NEXT_PUBLIC_SUPABASE_URL")), message: "SUPABASE_URL ausente." },
    serviceRole: { ok: Boolean(env("SUPABASE_SERVICE_ROLE_KEY")), message: "SUPABASE_SERVICE_ROLE_KEY ausente." },
    adminToken: { ok: Boolean(env("ADMIN_API_TOKEN")), message: "ADMIN_API_TOKEN ausente." },
    storage: { ok: Boolean(env("EXPORTS_BUCKET") || env("SUPABASE_EXPORTS_BUCKET")), message: "Bucket de exports nao configurado." },
  };
  let database = { ok: false, message: "Banco nao consultado." };
  try {
    const supabase = serviceClient();
    const { error } = await supabase.from("custom_requests").select("id", { count: "exact", head: true });
    database = { ok: !error, message: error?.message || "Banco acessivel." };
  } catch (error) {
    database = { ok: false, message: error instanceof Error ? error.message : "Falha desconhecida." };
  }
  const allChecks = { ...checks, database };
  return json(request, {
    ok: Object.values(allChecks).every((item) => item.ok),
    runtime: "supabase-edge-functions",
    checks: allChecks,
  }, Object.values(allChecks).every((item) => item.ok) ? 200 : 503);
});
