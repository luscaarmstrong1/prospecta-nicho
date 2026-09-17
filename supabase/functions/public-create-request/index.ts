import { handleCors } from "../_shared/cors.ts";
import { serviceClient } from "../_shared/db.ts";
import { json, errorJson } from "../_shared/responses.ts";
import { numberValue, phone, publicCode, text } from "../_shared/validation.ts";

const defaultFields = ["cnpj", "razao_social", "nome_fantasia", "cnae_principal", "cidade", "uf", "situacao_cadastral"];

function requestedQuantity(value: unknown) {
  const label = text(value, 80);
  if (/mais/i.test(label)) return 2000;
  const digits = label.replace(/\D/g, "");
  if (digits) return Number(digits);
  return numberValue(value, 500);
}

Deno.serve(async (request) => {
  const cors = handleCors(request);
  if (cors) return cors;
  if (request.method !== "POST") return errorJson(request, "METHOD_NOT_ALLOWED", "Metodo nao permitido.", 405);

  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  if (!body || text(body.companySite)) return json(request, { ok: true, message: "Solicitacao recebida." });

  const name = text(body.name, 120);
  const whatsapp = phone(body.whatsapp);
  const segment = text(body.segment || body.niche || body.audience, 160);
  const city = text(body.location || body.city || body.region, 160);
  const uf = text(body.state || body.uf, 2).toUpperCase();
  if (!name || !whatsapp || !segment || !city || uf.length !== 2 || body.consent !== true) {
    return errorJson(request, "INVALID_REQUEST", "Informe nome, WhatsApp, segmento, cidade, UF e consentimento.", 400);
  }

  const supabase = serviceClient();
  const id = crypto.randomUUID();
  const code = publicCode();
  const quantity = requestedQuantity(body.quantity || body.desiredQuantity || body.quantityRange);
  const now = new Date().toISOString();

  const { error: requestError } = await supabase.from("custom_requests").insert({
    id,
    public_code: code,
    requester_name: name,
    requester_company: text(body.company, 160) || null,
    requester_email: text(body.email, 180) || null,
    requester_whatsapp: whatsapp,
    segment_slug: segment,
    segment_label: segment,
    product_slug: "gerador-planilhas-cnpj",
    source: text(body.source, 80) || "github-pages",
    status: "analysis",
    commercial_goal: text(body.goal || body.objective || body.notes, 500) || null,
    priority: "normal",
    is_paid: false,
    enrichment_requested: false,
    enrichment_paid: false,
    enrichment_enabled: false,
    enrichment_status: "locked",
    created_at: now,
    updated_at: now,
  });
  if (requestError) return errorJson(request, "REQUEST_INSERT_FAILED", "Nao foi possivel registrar a solicitacao agora.", 500);

  await supabase.from("request_filters").insert({
    request_id: id,
    uf,
    city,
    cities: city ? [city] : [],
    opening_period: text(body.period || body.openedPeriod, 80) || null,
    company_sizes: Array.isArray(body.companySize) ? body.companySize : [],
    registration_status: "ATIVA",
    establishment_type: "QUALQUER",
    cnae_principal: text(body.primaryCnae || body.cnae, 20) ? [text(body.primaryCnae || body.cnae, 20).replace(/\D/g, "")].filter(Boolean) : [],
    cnae_secondary: [],
    include_secondary_cnaes: true,
    exclude_mei: false,
    only_headquarters: false,
    desired_quantity: quantity,
    delivery_format: "xlsx",
  });

  await supabase.from("request_fields").insert(defaultFields.map((field) => ({
    request_id: id,
    field_key: field,
    field_label: field,
    is_default: true,
    is_available: true,
    requires_validation: false,
  })));

  await supabase.from("request_status_events").insert({
    request_id: id,
    status: "analysis",
    message: "Pedido recebido pelo site estatico e salvo no CRM.",
    metadata: { runtime: "github-pages", publicCode: code },
  });

  return json(request, {
    ok: true,
    id,
    publicCode: code,
    status: "analysis",
    crm: { requestId: id, publicCode: code, product: "Gerador de planilhas com dados publicos de CNPJ", enrichment: "locked_paid_addon" },
    summary: { segment, location: city, state: uf, period: text(body.period || body.openedPeriod, 80), quantity: String(quantity) },
    message: "Solicitacao salva no CRM. A equipe valida filtros, disponibilidade e escopo antes de cobranca.",
  });
});
