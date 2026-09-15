import { handleCors } from "../_shared/cors.ts";
import { requireAdmin } from "../_shared/auth.ts";
import { serviceClient } from "../_shared/db.ts";
import { json, errorJson } from "../_shared/responses.ts";

Deno.serve(async (request) => {
  const cors = handleCors(request);
  if (cors) return cors;
  const denied = await requireAdmin(request);
  if (denied) return denied;
  const supabase = serviceClient();
  const [{ data: jobs, error }, { data: logs }] = await Promise.all([
    supabase.from("rfb_processing_jobs").select("*").order("created_at", { ascending: false }).limit(100),
    supabase.from("rfb_job_logs").select("*").order("created_at", { ascending: false }).limit(200),
  ]);
  if (error) return errorJson(request, "JOBS_LIST_FAILED", error.message, 500);
  return json(request, { ok: true, jobs: jobs || [], logs: logs || [] });
});
