import { handleCors } from "../_shared/cors.ts";
import { requireAdmin } from "../_shared/auth.ts";
import { serviceClient } from "../_shared/db.ts";
import { json, errorJson } from "../_shared/responses.ts";

Deno.serve(async (request) => {
  const cors = handleCors(request);
  if (cors) return cors;
  const denied = await requireAdmin(request);
  if (denied) return denied;
  const requestId = request.headers.get("x-resource-id") || new URL(request.url).searchParams.get("id") || "";
  if (!requestId) return errorJson(request, "MISSING_REQUEST_ID", "Pedido nao informado.", 400);
  const supabase = serviceClient();
  const { data, error } = await supabase.from("custom_requests").update({
    enrichment_paid: true,
    enrichment_enabled: true,
    enrichment_status: "paid",
    updated_at: new Date().toISOString(),
  }).eq("id", requestId).select("*").maybeSingle();
  if (error) return errorJson(request, "ENRICHMENT_UPDATE_FAILED", error.message, 500);
  if (!data) return errorJson(request, "REQUEST_NOT_FOUND", "Pedido nao encontrado.", 404);
  await supabase.from("request_status_events").insert({ request_id: requestId, status: "enrichment_paid", message: "Enriquecimento pago liberado.", metadata: {} });
  return json(request, { ok: true, request: data });
});
