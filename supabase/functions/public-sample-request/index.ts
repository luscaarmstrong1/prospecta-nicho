import { handleCors } from "../_shared/cors.ts";
import { serviceClient } from "../_shared/db.ts";
import { json, errorJson } from "../_shared/responses.ts";
import { bodyErrorResponse, enforceRateLimit, readJsonBody, uuidValue, verifyTurnstile } from "../_shared/request-security.ts";
import { phone, text } from "../_shared/validation.ts";

Deno.serve(async (request) => {
  const cors = handleCors(request);
  if (cors) return cors;
  if (request.method !== "POST") return errorJson(request, "METHOD_NOT_ALLOWED", "Método não permitido.", 405);
  let body: Record<string, unknown>;
  try {
    body = await readJsonBody(request, 12 * 1024);
  } catch (error) {
    return bodyErrorResponse(request, error) || errorJson(request, "INVALID_REQUEST", "Solicitação inválida.", 400);
  }
  if (text(body.companySite)) return json(request, { ok: true, message: "Amostra solicitada." });
  const limited = await enforceRateLimit(request, "public-sample-request", 5, 60);
  if (limited) return limited;
  const turnstile = await verifyTurnstile(request, body.turnstileToken);
  if (turnstile) return turnstile;

  const clientRequestId = uuidValue(body.clientRequestId || body.idempotencyKey);
  const name = text(body.name, 120);
  const whatsapp = phone(body.whatsapp);
  const segment = text(body.niche || body.segment, 160);
  const city = text(body.city || body.location, 160);
  const uf = text(body.state || body.uf, 2).toUpperCase();
  if (!clientRequestId || !name || !whatsapp || !segment || !city || uf.length !== 2 || body.consent !== true) {
    return errorJson(request, "INVALID_SAMPLE_REQUEST", "Informe nome, WhatsApp, nicho, cidade, UF, consentimento e uma chave de envio válida.", 400);
  }
  const supabase = serviceClient();
  const { data, error } = await supabase.rpc("create_public_request", {
    p_client_request_id: clientRequestId,
    p_request: {
      requester_name: name, requester_company: text(body.company, 160), requester_email: text(body.email, 180),
      requester_whatsapp: whatsapp, segment_slug: segment, segment_label: segment, product_slug: "amostra-gratuita",
      source: text(body.source, 80) || "github-pages-sample", commercial_goal: "Solicitação de amostra gratuita de planilha CNPJ", priority: "normal",
    },
    p_filters: { uf, city, cities: [city], desired_quantity: 10, delivery_format: "xlsx", registration_status: "ATIVA", establishment_type: "QUALQUER" },
    p_fields: [],
    p_event: { message: "Amostra gratuita recebida pelo site.", metadata: { runtime: "github-pages" } },
  });
  if (error || !data) return errorJson(request, "SAMPLE_INSERT_FAILED", "Não foi possível registrar a amostra agora.", 500);
  const result = data as { id: string; public_code: string; status: string; idempotent: boolean };
  return json(request, {
    ok: true, id: result.id, publicCode: result.public_code, status: result.status, idempotent: result.idempotent,
    crm: { requestId: result.id, publicCode: result.public_code, product: "Amostra gratuita", enrichment: "locked_paid_addon" },
    message: "Amostra solicitada. A equipe valida o recorte antes do envio.",
  }, result.idempotent ? 200 : 201);
});
