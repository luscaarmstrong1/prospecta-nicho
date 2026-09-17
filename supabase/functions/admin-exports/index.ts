import { handleCors } from "../_shared/cors.ts";
import { requireAdmin } from "../_shared/auth.ts";
import { serviceClient } from "../_shared/db.ts";
import { json, errorJson } from "../_shared/responses.ts";
import { adminCompleteJob } from "../_shared/admin-handlers.ts";

Deno.serve(async (request) => {
  const cors = handleCors(request);
  if (cors) return cors;
  if (request.headers.get("x-admin-action") === "complete-job") return adminCompleteJob(request);
  const denied = await requireAdmin(request, "export:read");
  if (denied) return denied;
  const { data, error } = await serviceClient().from("exports").select("*").order("created_at", { ascending: false }).limit(100);
  if (error) return errorJson(request, "EXPORTS_LIST_FAILED", error.message, 500);
  return json(request, { ok: true, exports: data || [] });
});
