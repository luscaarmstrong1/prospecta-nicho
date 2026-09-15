import { handleCors } from "../_shared/cors.ts";
import { serviceClient } from "../_shared/db.ts";
import { json, errorJson } from "../_shared/responses.ts";
import { phone, text } from "../_shared/validation.ts";

Deno.serve(async (request) => {
  const cors = handleCors(request);
  if (cors) return cors;
  if (request.method !== "POST") return errorJson(request, "METHOD_NOT_ALLOWED", "Metodo nao permitido.", 405);
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  if (!body || text(body.companySite)) return json(request, { ok: true, message: "Mensagem recebida." });
  const supabase = serviceClient();
  const { error } = await supabase.from("leads").insert({
    source: "contact",
    name: text(body.name, 120),
    company: text(body.company, 160),
    email: text(body.email, 180),
    whatsapp: phone(body.whatsapp),
    subject: text(body.subject, 160),
    message: text(body.message, 1000),
    created_at: new Date().toISOString(),
  });
  if (error) return errorJson(request, "CONTACT_INSERT_FAILED", error.message, 500);
  return json(request, { ok: true, message: "Mensagem recebida." });
});
