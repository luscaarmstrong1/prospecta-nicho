import { handleCors } from "../_shared/cors.ts";
import { serviceClient } from "../_shared/db.ts";
import { json, errorJson } from "../_shared/responses.ts";
import { phone, publicCode, text } from "../_shared/validation.ts";

Deno.serve(async (request) => {
  const cors = handleCors(request);
  if (cors) return cors;
  if (request.method !== "POST") return errorJson(request, "METHOD_NOT_ALLOWED", "Metodo nao permitido.", 405);
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  if (!body || text(body.companySite)) return json(request, { ok: true, message: "Amostra solicitada." });

  const name = text(body.name, 120);
  const whatsapp = phone(body.whatsapp);
  const segment = text(body.niche || body.segment, 160);
  const city = text(body.city || body.location, 160);
  if (!name || !whatsapp || !segment || !city) {
    return errorJson(request, "INVALID_SAMPLE_REQUEST", "Informe nome, WhatsApp, nicho e regiao.", 400);
  }

  const supabase = serviceClient();
  const id = crypto.randomUUID();
  const code = publicCode();
  const now = new Date().toISOString();
  const { error } = await supabase.from("custom_requests").insert({
    id,
    public_code: code,
    requester_name: name,
    requester_company: text(body.company, 160) || null,
    requester_email: text(body.email, 180) || null,
    requester_whatsapp: whatsapp,
    segment_slug: segment,
    segment_label: segment,
    product_slug: "amostra-gratuita",
    source: text(body.source, 80) || "github-pages-sample",
    status: "analysis",
    commercial_goal: "Solicitacao de amostra gratuita de planilha CNPJ",
    priority: "normal",
    is_paid: false,
    enrichment_requested: false,
    enrichment_paid: false,
    enrichment_enabled: false,
    enrichment_status: "locked",
    created_at: now,
    updated_at: now,
  });
  if (error) return errorJson(request, "SAMPLE_INSERT_FAILED", error.message, 500);

  await supabase.from("request_filters").insert({
    request_id: id,
    city,
    cities: [city],
    desired_quantity: 10,
    delivery_format: "xlsx",
    registration_status: "ATIVA",
    establishment_type: "QUALQUER",
  });
  await supabase.from("request_status_events").insert({
    request_id: id,
    status: "analysis",
    message: "Amostra gratuita recebida pelo site estatico.",
    metadata: { runtime: "github-pages", publicCode: code },
  });

  return json(request, {
    ok: true,
    id,
    publicCode: code,
    crm: { requestId: id, publicCode: code, product: "Amostra gratuita", enrichment: "locked_paid_addon" },
    message: "Amostra solicitada. A equipe valida o recorte antes do envio.",
  });
});
