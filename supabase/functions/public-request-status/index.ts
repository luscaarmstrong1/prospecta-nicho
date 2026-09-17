import { handleCors } from "../_shared/cors.ts";
import { serviceClient } from "../_shared/db.ts";
import { json, errorJson } from "../_shared/responses.ts";
import { enforceRateLimit } from "../_shared/request-security.ts";
import { text } from "../_shared/validation.ts";

const statusLabels: Record<string, string> = {
  analysis: "Em análise", validated: "Pedido validado", paid: "Pagamento confirmado",
  queued: "Preparando processamento", running: "Processando sua base", processing: "Processando sua base",
  ready_for_delivery: "Pronto para entrega", completed_partial: "Pronto para entrega", delivered: "Entregue",
};
const productLabels: Record<string, string> = { "amostra-gratuita": "Amostra gratuita", "gerador-planilhas-cnpj": "Base personalizada" };

Deno.serve(async (request) => {
  const cors = handleCors(request);
  if (cors) return cors;
  if (request.method !== "GET") return errorJson(request, "METHOD_NOT_ALLOWED", "Método não permitido.", 405);
  const limited = await enforceRateLimit(request, "public-request-status", 25, 60);
  if (limited) return limited;
  const url = new URL(request.url);
  const code = text(url.searchParams.get("codigo") || url.searchParams.get("code"), 11).toUpperCase();
  if (!/^PN-[A-Z0-9]{8}$/.test(code)) return errorJson(request, "INVALID_CODE", "Informe um protocolo válido no formato PN-XXXXXXXX.", 400);
  const supabase = serviceClient();
  const { data: requestRow, error } = await supabase.from("custom_requests")
    .select("id, public_code, status, product_slug, segment_label, segment_slug, updated_at").eq("public_code", code).maybeSingle();
  if (error) return errorJson(request, "STATUS_LOOKUP_FAILED", "Não foi possível consultar o pedido agora.", 500);
  if (!requestRow) return errorJson(request, "REQUEST_NOT_FOUND", "Pedido não encontrado para este protocolo.", 404);
  const { data: filterRow } = await supabase.from("request_filters").select("city, uf").eq("request_id", requestRow.id).maybeSingle();
  const status = String(requestRow.status || "analysis");
  const label = statusLabels[status] || "Pedido em atualização";
  return json(request, {
    ok: true,
    request: {
      publicCode: requestRow.public_code, status, statusLabel: label,
      product: productLabels[String(requestRow.product_slug)] || "Base comercial",
      segment: requestRow.segment_label || requestRow.segment_slug, city: filterRow?.city || "", uf: filterRow?.uf || "", updatedAt: requestRow.updated_at,
    },
    events: [{ status, message: label, createdAt: requestRow.updated_at }],
  });
});
