import { requireAdmin } from "./auth.ts";
import { serviceClient } from "./db.ts";
import { json, errorJson } from "./responses.ts";
import { numberValue, text } from "./validation.ts";

function idFrom(request: Request) {
  const url = new URL(request.url);
  return request.headers.get("x-resource-id") || url.searchParams.get("id") || "";
}

async function event(supabase: ReturnType<typeof serviceClient>, requestId: string, status: string, message: string, metadata = {}) {
  await supabase.from("request_status_events").insert({ request_id: requestId, status, message, metadata });
}

export async function adminListRequests(request: Request) {
  const denied = await requireAdmin(request);
  if (denied) return denied;
  const supabase = serviceClient();
  const { data, error } = await supabase.from("custom_requests").select("*").order("created_at", { ascending: false }).limit(100);
  if (error) return errorJson(request, "ADMIN_REQUESTS_FAILED", error.message, 500);
  return json(request, { ok: true, requests: data || [] });
}

export async function adminRequestDetail(request: Request) {
  const denied = await requireAdmin(request);
  if (denied) return denied;
  const requestId = idFrom(request);
  const supabase = serviceClient();
  const [{ data: item, error }, { data: filters }, { data: fields }, { data: events }, { data: jobs }, { data: exports }] = await Promise.all([
    supabase.from("custom_requests").select("*").eq("id", requestId).maybeSingle(),
    supabase.from("request_filters").select("*").eq("request_id", requestId).maybeSingle(),
    supabase.from("request_fields").select("*").eq("request_id", requestId),
    supabase.from("request_status_events").select("*").eq("request_id", requestId).order("created_at", { ascending: false }),
    supabase.from("rfb_processing_jobs").select("*").eq("request_id", requestId).order("created_at", { ascending: false }),
    supabase.from("exports").select("*").eq("request_id", requestId).order("created_at", { ascending: false }),
  ]);
  if (error) return errorJson(request, "ADMIN_DETAIL_FAILED", error.message, 500);
  if (!item) return errorJson(request, "REQUEST_NOT_FOUND", "Pedido nao encontrado.", 404);
  return json(request, { ok: true, request: item, filters, fields: fields || [], events: events || [], jobs: jobs || [], exports: exports || [] });
}

export async function adminUpdateRequest(request: Request, forcedStatus?: string) {
  const denied = await requireAdmin(request);
  if (denied) return denied;
  const requestId = idFrom(request);
  const body = await request.json().catch(() => ({})) as Record<string, unknown>;
  const action = request.headers.get("x-admin-action") || "";
  const status = forcedStatus || text(body.status || (action === "validate" ? "validated" : ""), 60);
  if (!requestId && action !== "publish-content") return errorJson(request, "MISSING_REQUEST_ID", "Pedido nao informado.", 400);
  if (action === "publish-content") return json(request, { ok: true, message: "Publicacao registrada no backend estatico." });
  const supabase = serviceClient();
  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (status) patch.status = status;
  if (body.internalNotes) patch.internal_notes = text(body.internalNotes, 1000);
  const { data, error } = await supabase.from("custom_requests").update(patch).eq("id", requestId).select("*").maybeSingle();
  if (error) return errorJson(request, "REQUEST_UPDATE_FAILED", error.message, 500);
  if (!data) return errorJson(request, "REQUEST_NOT_FOUND", "Pedido nao encontrado.", 404);
  await event(supabase, requestId, status || "updated", `Acao administrativa executada: ${action || status || "update"}.`, { action });
  return json(request, { ok: true, request: data });
}

export async function adminCreateJob(request: Request) {
  const denied = await requireAdmin(request);
  if (denied) return denied;
  const requestId = idFrom(request);
  if (!requestId) return errorJson(request, "MISSING_REQUEST_ID", "Pedido nao informado.", 400);
  const supabase = serviceClient();
  const { data: filters } = await supabase.from("request_filters").select("*").eq("request_id", requestId).maybeSingle();
  const { data, error } = await supabase.from("rfb_processing_jobs").insert({
    request_id: requestId,
    status: "queued",
    source: "admin-edge",
    filters_snapshot: filters || {},
    requested_fields: ["cnpj", "razao_social", "nome_fantasia", "cnae_principal", "cidade", "uf"],
    progress: 0,
  }).select("*").single();
  if (error) return errorJson(request, "JOB_CREATE_FAILED", error.message, 500);
  await supabase.from("custom_requests").update({ status: "queued", job_id: data.id, updated_at: new Date().toISOString() }).eq("id", requestId);
  await event(supabase, requestId, "queued", "Job CNPJ criado para processamento externo.", { jobId: data.id });
  return json(request, { ok: true, job: data }, 201);
}

export async function adminCompleteJob(request: Request) {
  const denied = await requireAdmin(request);
  if (denied) return denied;
  const jobId = idFrom(request);
  const body = await request.json().catch(() => ({})) as Record<string, unknown>;
  const fileUrl = text(body.fileUrl || body.storagePath || body.storage_path, 1000);
  if (!jobId || !fileUrl) return errorJson(request, "INVALID_EXPORT", "Informe job e arquivo privado.", 400);
  const supabase = serviceClient();
  const { data: job } = await supabase.from("rfb_processing_jobs").select("*").eq("id", jobId).maybeSingle();
  if (!job) return errorJson(request, "JOB_NOT_FOUND", "Job nao encontrado.", 404);
  const { data, error } = await supabase.from("exports").insert({
    request_id: job.request_id,
    job_id: jobId,
    status: "ready",
    file_url: fileUrl.startsWith("http") ? fileUrl : null,
    storage_path: fileUrl.startsWith("http") ? null : fileUrl,
    row_count: numberValue(body.rowCount, 0),
    format: text(body.format, 20) || "xlsx",
  }).select("*").single();
  if (error) return errorJson(request, "EXPORT_CREATE_FAILED", error.message, 500);
  await supabase.from("rfb_processing_jobs").update({ status: "completed", progress: 100, completed_at: new Date().toISOString() }).eq("id", jobId);
  await supabase.from("custom_requests").update({ status: "export_ready", export_id: data.id, updated_at: new Date().toISOString() }).eq("id", job.request_id);
  await event(supabase, job.request_id, "export_ready", "Export XLSX registrado e pronto para link temporario.", { exportId: data.id });
  return json(request, { ok: true, export: data });
}

export async function adminSignExport(request: Request) {
  const denied = await requireAdmin(request);
  if (denied) return denied;
  const exportId = idFrom(request);
  const body = await request.json().catch(() => ({})) as Record<string, unknown>;
  const expiresIn = Math.min(Math.max(numberValue(body.expiresInSeconds, 86_400), 60), 604_800);
  const supabase = serviceClient();
  const { data: item } = await supabase.from("exports").select("*").eq("id", exportId).maybeSingle();
  if (!item) return errorJson(request, "EXPORT_NOT_FOUND", "Export nao encontrado.", 404);
  let signedUrl = text(item.file_url, 2000);
  const storagePath = text(item.storage_path, 2000);
  if (storagePath) {
    const bucket = Deno.env.get("EXPORTS_BUCKET") || Deno.env.get("SUPABASE_EXPORTS_BUCKET") || "exports";
    const { data, error } = await supabase.storage.from(bucket).createSignedUrl(storagePath, expiresIn);
    if (error) return errorJson(request, "EXPORT_SIGN_FAILED", error.message, 500);
    signedUrl = data.signedUrl;
  }
  if (!signedUrl) return errorJson(request, "EXPORT_NOT_READY", "Export sem arquivo privado configurado.", 404);
  await supabase.from("export_downloads").insert({ export_id: exportId, expires_at: new Date(Date.now() + expiresIn * 1000).toISOString() });
  return json(request, { ok: true, signed: { url: signedUrl, expiresAt: new Date(Date.now() + expiresIn * 1000).toISOString() } });
}

export async function adminRunEnrichment(request: Request) {
  const denied = await requireAdmin(request);
  if (denied) return denied;
  const requestId = idFrom(request);
  const supabase = serviceClient();
  const { data } = await supabase.from("custom_requests").select("enrichment_paid, enrichment_enabled").eq("id", requestId).maybeSingle();
  if (!data?.enrichment_paid || !data?.enrichment_enabled) {
    return errorJson(request, "ENRICHMENT_LOCKED", "Enriquecimento bloqueado ate pagamento e liberacao administrativa.", 402);
  }
  await event(supabase, requestId, "enrichment_queued", "Enriquecimento pago liberado para processamento.", {});
  return json(request, { ok: true, status: "enrichment_queued" });
}
