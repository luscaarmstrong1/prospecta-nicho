import { handleCors } from "../_shared/cors.ts";
import { serviceClient } from "../_shared/db.ts";
import { json, errorJson } from "../_shared/responses.ts";
import { text } from "../_shared/validation.ts";

Deno.serve(async (request) => {
  const cors = handleCors(request);
  if (cors) return cors;
  const url = new URL(request.url);
  const code = text(url.searchParams.get("codigo") || url.searchParams.get("code"), 40).toUpperCase();
  if (!code) return errorJson(request, "MISSING_CODE", "Informe o protocolo do pedido.", 400);

  const supabase = serviceClient();
  const { data: requestRow, error } = await supabase
    .from("custom_requests")
    .select("id, public_code, status, product_slug, segment_label, segment_slug, updated_at")
    .eq("public_code", code)
    .maybeSingle();
  if (error) return errorJson(request, "STATUS_LOOKUP_FAILED", "Nao foi possivel consultar o pedido agora.", 500);
  if (!requestRow) return errorJson(request, "REQUEST_NOT_FOUND", "Pedido nao encontrado para este protocolo.", 404);

  const [{ data: filterRow }, { data: events }] = await Promise.all([
    supabase.from("request_filters").select("city, uf").eq("request_id", requestRow.id).maybeSingle(),
    supabase.from("request_status_events").select("status, message, created_at").eq("request_id", requestRow.id).order("created_at", { ascending: false }).limit(5),
  ]);

  return json(request, {
    ok: true,
    request: {
      publicCode: requestRow.public_code,
      status: requestRow.status,
      product: requestRow.product_slug,
      segment: requestRow.segment_label || requestRow.segment_slug,
      city: filterRow?.city || "",
      uf: filterRow?.uf || "",
      updatedAt: requestRow.updated_at,
    },
    events: (events || []).map((event) => ({ status: event.status, message: event.message, createdAt: event.created_at })),
  });
});
