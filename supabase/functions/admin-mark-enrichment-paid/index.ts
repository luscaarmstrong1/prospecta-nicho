import { handleCors } from "../_shared/cors.ts";
import { requireAdmin } from "../_shared/auth.ts";
import { serviceClient } from "../_shared/db.ts";
import { json, errorJson } from "../_shared/responses.ts";

Deno.serve(async (request) => {
  const cors = handleCors(request);
  if (cors) return cors;
  const denied = await requireAdmin(request, "enrichment:offer");
  if (denied) return denied;
  const requestId = request.headers.get("x-resource-id") || new URL(request.url).searchParams.get("id") || "";
  if (!requestId) return errorJson(request, "MISSING_REQUEST_ID", "Pedido nao informado.", 400);
  const supabase = serviceClient();
  const { data, error } = await supabase.rpc("admin_transition_request", {
    p_request_id: requestId,
    p_action: "mark-enrichment-paid",
    p_internal_notes: null,
  });
  if (error || !data) {
    const invalid = error?.message?.includes("INVALID_STATE_TRANSITION");
    return errorJson(request, invalid ? "INVALID_STATE_TRANSITION" : "ENRICHMENT_UPDATE_FAILED", invalid ? "Ofereça o enriquecimento antes de confirmar o pagamento." : "Não foi possível atualizar o enriquecimento.", invalid ? 409 : 500);
  }
  const result = data as { request?: Record<string, unknown>; idempotent?: boolean };
  return json(request, { ok: true, request: result.request || {}, idempotent: Boolean(result.idempotent) });
});
