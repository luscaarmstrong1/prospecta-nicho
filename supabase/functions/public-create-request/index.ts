import { handleCors } from "../_shared/cors.ts";
import { serviceClient } from "../_shared/db.ts";
import { json, errorJson } from "../_shared/responses.ts";
import { bodyErrorResponse, enforceRateLimit, readJsonBody, uuidValue, verifyTurnstile } from "../_shared/request-security.ts";
import { numberValue, phone, text } from "../_shared/validation.ts";

const defaultFields = ["cnpj", "razao_social", "nome_fantasia", "cnae_principal", "cidade", "uf", "situacao_cadastral"];

function requestedQuantity(value: unknown) {
  const label = text(value, 80);
  if (/mais/i.test(label)) return 2000;
  const digits = label.replace(/\D/g, "");
  return digits ? Number(digits) : numberValue(value, 500);
}

Deno.serve(async (request) => {
  const cors = handleCors(request);
  if (cors) return cors;
  if (request.method !== "POST") return errorJson(request, "METHOD_NOT_ALLOWED", "Método não permitido.", 405);
  let body: Record<string, unknown>;
  try {
    body = await readJsonBody(request, 16 * 1024);
  } catch (error) {
    return bodyErrorResponse(request, error) || errorJson(request, "INVALID_REQUEST", "Solicitação inválida.", 400);
  }
  if (text(body.companySite)) return json(request, { ok: true, message: "Solicitação recebida." });
  const limited = await enforceRateLimit(request, "public-create-request", 6, 60);
  if (limited) return limited;
  const turnstile = await verifyTurnstile(request, body.turnstileToken);
  if (turnstile) return turnstile;

  const clientRequestId = uuidValue(body.clientRequestId || body.idempotencyKey);
  const name = text(body.name, 120);
  const whatsapp = phone(body.whatsapp);
  const segment = text(body.segment || body.niche || body.audience, 160);
  const city = text(body.location || body.city || body.region, 160);
  const uf = text(body.state || body.uf, 2).toUpperCase();
  if (!clientRequestId || !name || !whatsapp || !segment || !city || uf.length !== 2 || body.consent !== true) {
    return errorJson(request, "INVALID_REQUEST", "Informe nome, WhatsApp, segmento, cidade, UF, consentimento e uma chave de envio válida.", 400);
  }

  const quantity = requestedQuantity(body.quantity || body.desiredQuantity || body.quantityRange);
  const primaryCnae = text(body.primaryCnae || body.cnae, 20).replace(/\D/g, "");
  const supabase = serviceClient();
  const { data, error } = await supabase.rpc("create_public_request", {
    p_client_request_id: clientRequestId,
    p_request: {
      requester_name: name,
      requester_company: text(body.company, 160),
      requester_email: text(body.email, 180),
      requester_whatsapp: whatsapp,
      segment_slug: segment,
      segment_label: segment,
      product_slug: "gerador-planilhas-cnpj",
      source: text(body.source, 80) || "github-pages",
      commercial_goal: text(body.goal || body.objective || body.notes, 500),
      priority: "normal",
    },
    p_filters: {
      uf, city, cities: [city], opening_period: text(body.period || body.openedPeriod, 80),
      company_sizes: Array.isArray(body.companySize) ? body.companySize : [], registration_status: "ATIVA",
      establishment_type: "QUALQUER", cnae_principal: primaryCnae ? [primaryCnae] : [], cnae_secondary: [],
      include_secondary_cnaes: true, exclude_mei: false, only_headquarters: false,
      desired_quantity: quantity, delivery_format: "xlsx",
    },
    p_fields: defaultFields.map((field) => ({ field_key: field, field_label: field, is_default: true, is_available: true, requires_validation: false })),
    p_event: { message: "Pedido recebido pelo site e salvo no CRM.", metadata: { runtime: "github-pages" } },
  });
  if (error || !data) return errorJson(request, "REQUEST_INSERT_FAILED", "Não foi possível registrar a solicitação agora.", 500);
  const result = data as { id: string; public_code: string; status: string; idempotent: boolean };
  return json(request, {
    ok: true, id: result.id, publicCode: result.public_code, status: result.status, idempotent: result.idempotent,
    crm: { requestId: result.id, publicCode: result.public_code, product: "Gerador de planilhas com dados públicos de CNPJ", enrichment: "locked_paid_addon" },
    summary: { segment, location: city, state: uf, quantity: String(quantity) },
    message: "Solicitação salva no CRM. A equipe valida filtros, disponibilidade e escopo antes da cobrança.",
  }, result.idempotent ? 200 : 201);
});
