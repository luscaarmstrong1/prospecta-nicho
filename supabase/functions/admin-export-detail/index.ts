import { handleCors } from "../_shared/cors.ts";
import { requireAdmin } from "../_shared/auth.ts";
import { serviceClient } from "../_shared/db.ts";
import { json, errorJson } from "../_shared/responses.ts";

Deno.serve(async (request) => {
  const cors = handleCors(request);
  if (cors) return cors;
  const denied = requireAdmin(request);
  if (denied) return denied;
  const exportId = request.headers.get("x-resource-id") || new URL(request.url).searchParams.get("id") || "";
  const { data, error } = await serviceClient().from("exports").select("*").eq("id", exportId).maybeSingle();
  if (error) return errorJson(request, "EXPORT_DETAIL_FAILED", error.message, 500);
  if (!data) return errorJson(request, "EXPORT_NOT_FOUND", "Export nao encontrado.", 404);
  return json(request, { ok: true, export: data });
});
