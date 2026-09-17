import { handleCors } from "../_shared/cors.ts";
import { serviceClient } from "../_shared/db.ts";
import { json, errorJson } from "../_shared/responses.ts";
import { bodyErrorResponse, enforceRateLimit, readJsonBody, verifyTurnstile } from "../_shared/request-security.ts";
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
  if (text(body.companySite)) return json(request, { ok: true, message: "Mensagem recebida." });
  const limited = await enforceRateLimit(request, "public-contact", 5, 60);
  if (limited) return limited;
  const turnstile = await verifyTurnstile(request, body.turnstileToken);
  if (turnstile) return turnstile;
  const name = text(body.name, 120);
  const company = text(body.company, 160);
  const email = text(body.email, 180).toLowerCase();
  const whatsapp = phone(body.whatsapp);
  const subject = text(body.subject, 160);
  const message = text(body.message, 1000);
  if (!name || !company || !email || !whatsapp || !subject || !message || body.consent !== "true") {
    return errorJson(request, "VALIDATION_ERROR", "Preencha todos os campos obrigatórios e aceite os termos.", 422);
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return errorJson(request, "VALIDATION_ERROR", "Informe um e-mail válido.", 422);
  }
  const supabase = serviceClient();
  const { error } = await supabase.from("leads").insert({
    source: "contact",
    name,
    company,
    email,
    whatsapp,
    subject,
    message,
    created_at: new Date().toISOString(),
  });
  if (error) return errorJson(request, "CONTACT_INSERT_FAILED", "Não foi possível registrar a mensagem agora.", 500);
  return json(request, { ok: true, message: "Mensagem recebida." });
});
