import { handleCors } from "../_shared/cors.ts";
import { serviceClient } from "../_shared/db.ts";
import { env } from "../_shared/env.ts";
import { json } from "../_shared/responses.ts";

Deno.serve(async (request) => {
  const cors = handleCors(request);
  if (cors) return cors;
  const breakGlassAdmin = env("ENABLE_BREAK_GLASS_ADMIN") === "true";
  const deliveryMode = env("EXPORT_DELIVERY_MODE") || "local";
  const storageConfigured = Boolean(env("EXPORTS_BUCKET") || env("SUPABASE_EXPORTS_BUCKET"));
  const supabaseUrlConfigured = Boolean(env("SUPABASE_URL") || env("NEXT_PUBLIC_SUPABASE_URL"));
  const serviceRoleConfigured = Boolean(env("SUPABASE_SERVICE_ROLE_KEY"));
  const provider = env("RFB_SEARCH_PROVIDER") || "minha_receita";
  const turnstileSiteConfigured = Boolean(env("TURNSTILE_SITE_KEY") || env("NEXT_PUBLIC_TURNSTILE_SITE_KEY"));
  const turnstileSecretConfigured = Boolean(env("TURNSTILE_SECRET_KEY"));
  const turnstilePartial = turnstileSiteConfigured !== turnstileSecretConfigured;
  const checks = {
    supabaseUrl: { ok: supabaseUrlConfigured, message: supabaseUrlConfigured ? "SUPABASE_URL configurado." : "SUPABASE_URL ausente." },
    serviceRole: {
      ok: serviceRoleConfigured,
      message: serviceRoleConfigured ? "SUPABASE_SERVICE_ROLE_KEY configurado." : "SUPABASE_SERVICE_ROLE_KEY ausente.",
    },
    adminToken: {
      ok: !breakGlassAdmin || Boolean(env("ADMIN_API_TOKEN")),
      message: !breakGlassAdmin ? "Login por token administrativo desativado." : env("ADMIN_API_TOKEN") ? "ADMIN_API_TOKEN configurado." : "ADMIN_API_TOKEN ausente.",
    },
    storage: {
      ok: deliveryMode === "local" || storageConfigured,
      message: deliveryMode === "local" ? "Entrega local ativa; bucket opcional." : storageConfigured ? "Bucket configurado." : "Bucket de exports nao configurado.",
    },
    provider: { ok: provider === "minha_receita", message: provider === "minha_receita" ? "Provider Minha Receita configurado." : "Provider de busca não reconhecido." },
    turnstile: {
      ok: !turnstilePartial,
      message: turnstilePartial
        ? "Turnstile parcialmente configurado. Configure site key e secret key em conjunto."
        : turnstileSecretConfigured ? "Turnstile configurado." : "Turnstile desativado explicitamente.",
    },
  };
  let database = { ok: false, message: "Banco nao consultado." };
  let rateLimit = { ok: false, message: "RPC de rate limit não consultada." };
  try {
    const supabase = serviceClient();
    const { error } = await supabase.from("custom_requests").select("id", { count: "exact", head: true });
    database = { ok: !error, message: error?.message || "Banco acessivel." };
    const fingerprint = Array.from(crypto.getRandomValues(new Uint8Array(32)), (byte) => byte.toString(16).padStart(2, "0")).join("");
    const { error: rateError } = await supabase.rpc("consume_edge_rate_limit", {
      p_scope: "health-check", p_fingerprint_hash: fingerprint, p_limit: 1, p_window_seconds: 60,
    });
    rateLimit = { ok: !rateError, message: rateError ? "RPC de rate limit indisponível." : "RPC de rate limit acessível." };
  } catch (error) {
    database = { ok: false, message: error instanceof Error ? error.message : "Falha desconhecida." };
  }
  const allChecks = { ...checks, database, rateLimit };
  const criticalOk = checks.supabaseUrl.ok && checks.serviceRole.ok && checks.adminToken.ok && checks.storage.ok && checks.provider.ok && database.ok && rateLimit.ok;
  const degraded = criticalOk && !checks.turnstile.ok;
  return json(request, {
    ok: criticalOk,
    degraded,
    status: criticalOk ? degraded ? "degraded" : "operational" : "unavailable",
    runtime: "supabase-edge-functions",
    deliveryMode,
    checks: allChecks,
  }, criticalOk ? 200 : 503);
});
