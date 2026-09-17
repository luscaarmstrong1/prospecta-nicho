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

function rpcError(request: Request, error: { message?: string } | null, fallbackCode: string) {
  const message = error?.message || fallbackCode;
  const known = ["INVALID_STATE_TRANSITION", "PAYMENT_REQUIRED", "REQUEST_NOT_VALIDATED", "EXPORT_NOT_READY", "REQUEST_NOT_FOUND"]
    .find((code) => message.includes(code));
  if (!known) return errorJson(request, fallbackCode, "Não foi possível concluir a operação.", 500);
  const status = known === "REQUEST_NOT_FOUND" ? 404 : known === "PAYMENT_REQUIRED" || known === "REQUEST_NOT_VALIDATED" ? 422 : 409;
  const messages: Record<string, string> = {
    INVALID_STATE_TRANSITION: "Esta ação não é permitida no estado atual do pedido.",
    PAYMENT_REQUIRED: "Confirme o pagamento antes de criar o job.",
    REQUEST_NOT_VALIDATED: "Valide o pedido antes de continuar.",
    EXPORT_NOT_READY: "O pedido ainda não possui um export pronto para entrega.",
    REQUEST_NOT_FOUND: "Pedido não encontrado.",
  };
  return errorJson(request, known, messages[known], status);
}

export async function adminListRequests(request: Request) {
  const denied = await requireAdmin(request, "request:read");
  if (denied) return denied;
  const supabase = serviceClient();
  const { data, error } = await supabase.from("custom_requests").select("*").order("created_at", { ascending: false }).limit(100);
  if (error) return errorJson(request, "ADMIN_REQUESTS_FAILED", error.message, 500);
  return json(request, { ok: true, requests: data || [] });
}

export async function adminRequestDetail(request: Request) {
  const denied = await requireAdmin(request, "request:read");
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
  const denied = await requireAdmin(request, "request:update");
  if (denied) return denied;
  const requestId = idFrom(request);
  const body = await request.json().catch(() => ({})) as Record<string, unknown>;
  const action = request.headers.get("x-admin-action") || "";
  const status = forcedStatus || text(body.status || (action === "validate" ? "validated" : ""), 60);
  if (!requestId && action !== "publish-content") return errorJson(request, "MISSING_REQUEST_ID", "Pedido nao informado.", 400);
  if (action === "publish-content") return json(request, { ok: true, message: "Publicacao registrada no backend estatico." });
  const transitionAction = action === "validate" || status === "validated"
    ? "validate"
    : status === "paid" ? "mark-paid"
    : status === "delivered" ? "mark-delivered"
    : status === "enrichment_offered" ? "offer-enrichment"
    : action;
  const supabase = serviceClient();
  const { data, error } = await supabase.rpc("admin_transition_request", {
    p_request_id: requestId,
    p_action: transitionAction,
    p_internal_notes: text(body.internalNotes, 1000) || null,
  });
  if (error || !data) return rpcError(request, error, "REQUEST_UPDATE_FAILED");
  const result = data as { request?: Record<string, unknown>; idempotent?: boolean };
  return json(request, { ok: true, request: result.request || {}, idempotent: Boolean(result.idempotent) });
}

export async function adminCreateJob(request: Request) {
  const denied = await requireAdmin(request, "job:create");
  if (denied) return denied;
  const requestId = idFrom(request);
  if (!requestId) return errorJson(request, "MISSING_REQUEST_ID", "Pedido nao informado.", 400);
  const supabase = serviceClient();
  const { data, error } = await supabase.rpc("create_rfb_job_for_request", { p_request_id: requestId });
  if (error || !data) return rpcError(request, error, "JOB_CREATE_FAILED");
  const result = data as { job?: Record<string, unknown>; idempotent?: boolean };
  return json(request, { ok: true, job: result.job || {}, idempotent: Boolean(result.idempotent) }, result.idempotent ? 200 : 201);
}

export async function adminCompleteJob(request: Request) {
  const denied = await requireAdmin(request, "job:update");
  if (denied) return denied;
  return errorJson(
    request,
    "WORKER_FINALIZATION_REQUIRED",
    "A conclusao manual foi desativada. O worker local registra o export validado de forma transacional.",
    409,
  );
}

export async function adminSignExport(request: Request) {
  const denied = await requireAdmin(request, "export:sign");
  if (denied) return denied;
  const exportId = idFrom(request);
  const body = await request.json().catch(() => ({})) as Record<string, unknown>;
  const expiresIn = Math.min(Math.max(numberValue(body.expiresInSeconds, 86_400), 60), 604_800);
  const supabase = serviceClient();
  const { data: item } = await supabase.from("exports").select("*").eq("id", exportId).maybeSingle();
  if (!item) return errorJson(request, "EXPORT_NOT_FOUND", "Export nao encontrado.", 404);
  let signedUrl = text(item.signed_url, 2000);
  const storagePath = text(item.storage_path, 2000);
  if (storagePath) {
    const bucket = Deno.env.get("EXPORTS_BUCKET") || Deno.env.get("SUPABASE_EXPORTS_BUCKET") || "prospectanicho-exports";
    const { data, error } = await supabase.storage.from(bucket).createSignedUrl(storagePath, expiresIn);
    if (error) return errorJson(request, "EXPORT_SIGN_FAILED", error.message, 500);
    signedUrl = data.signedUrl;
  }
  if (!signedUrl) return errorJson(request, "EXPORT_NOT_READY", "Export sem arquivo privado configurado.", 404);
  await supabase.from("export_downloads").insert({ export_id: exportId, expires_at: new Date(Date.now() + expiresIn * 1000).toISOString() });
  return json(request, { ok: true, signed: { url: signedUrl, expiresAt: new Date(Date.now() + expiresIn * 1000).toISOString() } });
}

export async function adminRunEnrichment(request: Request) {
  const denied = await requireAdmin(request, "enrichment:run");
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
