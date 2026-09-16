import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { assertNoDefaultEnrichment } from "@/src/schemas/cnpj.schema";
import type { CrmRequestInput } from "@/src/schemas/request.schema";
import type { CnpjJob, CrmExport, CrmRequest, CrmRequestStatus } from "@/src/types/crm";
import { persistLead, readRows, updateLead, writeAuditLog } from "@/lib/server/integrations";
import { createCrmRequest } from "@/src/features/crm/request-normalizer";
import { assertEnrichmentCanRun } from "@/src/features/enrichment/guards";

type Store = {
  requests: Map<string, CrmRequest>;
  jobs: Map<string, CnpjJob>;
  exports: Map<string, CrmExport>;
  events: Map<string, string[]>;
};

const globalStore = globalThis as typeof globalThis & { __prospectaCrmStore?: Store };
const store =
  globalStore.__prospectaCrmStore ??
  ({
    requests: new Map<string, CrmRequest>(),
    jobs: new Map<string, CnpjJob>(),
    exports: new Map<string, CrmExport>(),
    events: new Map<string, string[]>(),
  } satisfies Store);
globalStore.__prospectaCrmStore = store;
if (!store.events) store.events = new Map<string, string[]>();

function nowIso() {
  return new Date().toISOString();
}

function appendRequestEvent(requestId: string, message: string) {
  const events = store.events.get(requestId) || [];
  events.push(`${nowIso()} ${message}`);
  store.events.set(requestId, events);
}

async function recordRequestEvent(requestId: string, status: string, message: string, metadata: Record<string, unknown> = {}) {
  appendRequestEvent(requestId, message);
  await persistLead("request_status_events", {
    requestId,
    status,
    message,
    metadata,
  });
}

function appendLog(job: CnpjJob, message: string) {
  job.logs.push(`${nowIso()} ${message}`);
  job.updatedAt = nowIso();
}

function signingSecret() {
  return process.env.EXPORT_SIGNING_SECRET || process.env.ADMIN_API_TOKEN || "local-dev-export-signing-secret";
}

function signExportPayload(payload: string) {
  return createHmac("sha256", signingSecret()).update(payload).digest("base64url");
}

function encodeExportToken(payload: { exportId: string; expiresAt: string }) {
  const body = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  return `${body}.${signExportPayload(body)}`;
}

function safeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

export async function registerCrmRequest(request: CrmRequest) {
  assertNoDefaultEnrichment(request.filters.fields);
  store.requests.set(request.id, request);
  await persistLead("custom_requests", {
    id: request.id,
    public_code: request.publicCode,
    requester_name: request.customer.name,
    requester_company: request.customer.company,
    requester_email: request.customer.email,
    requester_whatsapp: request.customer.whatsapp,
    segment_slug: request.filters.segment,
    segment_label: request.filters.segment,
    product_slug: "gerador-planilhas-cnpj",
    source: request.source,
    status: request.status,
    commercial_goal: request.commercialGoal,
    priority: "normal",
    is_paid: request.paymentStatus === "paid",
    paid_at: request.paymentStatus === "paid" ? nowIso() : undefined,
    enrichment_requested: false,
    enrichment_paid: request.enrichmentPaid,
    enrichment_enabled: request.enrichmentEnabled,
    enrichment_status: request.enrichmentStatus,
    notes: request.notes,
    created_at: request.createdAt,
    updated_at: request.updatedAt,
  });
  await persistLead("request_filters", {
    requestId: request.id,
    uf: request.filters.uf,
    city: request.filters.city,
    cities: request.filters.city ? [request.filters.city] : [],
    openingPeriod: request.filters.openingPeriod,
    openingDateStart: request.filters.openingDateStart,
    openingDateEnd: request.filters.openingDateEnd,
    companySizes: request.filters.companySize,
    registrationStatus: request.filters.registrationStatus,
    establishmentType: request.filters.branchType,
    minCapital: request.filters.minCapital,
    maxCapital: request.filters.maxCapital,
    cnaePrincipal: request.filters.cnaes,
    cnaeSecondary: [],
    includeSecondaryCnaes: true,
    excludeMei: !request.filters.companySize.includes("MEI"),
    onlyHeadquarters: request.filters.branchType === "MATRIZ",
    desiredQuantity: request.filters.quantity,
    deliveryFormat: request.filters.deliveryFormat,
  });
  await Promise.all(
    request.filters.fields.map((field) =>
      persistLead("request_fields", {
        requestId: request.id,
        fieldKey: field,
        fieldLabel: field,
        isDefault: true,
        isAvailable: true,
        requiresValidation: false,
      }),
    ),
  );
  await recordRequestEvent(request.id, request.status, `Pedido recebido pela origem ${request.source}.`, {
    publicCode: request.publicCode,
  });
  await writeAuditLog("crm_request_registered", { requestId: request.id, source: request.source });
  return request;
}

export async function createManualCrmRequest(input: CrmRequestInput) {
  return registerCrmRequest(
    createCrmRequest({
      source: input.source,
      customer: {
        name: input.customer.name,
        company: input.customer.company || undefined,
        email: input.customer.email || undefined,
        whatsapp: input.customer.whatsapp,
      },
      commercialGoal: input.commercialGoal,
      filters: input.filters,
      notes: input.notes,
    }),
  );
}

export function listCrmRequests() {
  return [...store.requests.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getCrmRequest(id: string) {
  return store.requests.get(id) || [...store.requests.values()].find((request) => request.publicCode === id);
}

function stringValue(value: unknown, fallback = "") {
  return typeof value === "string" && value.trim() ? value : fallback;
}

function numberValue(value: unknown, fallback = 0) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
}

function booleanValue(value: unknown, fallback = false) {
  return typeof value === "boolean" ? value : fallback;
}

function objectValue<T extends Record<string, unknown>>(value: unknown, fallback: T): T {
  if (value && typeof value === "object" && !Array.isArray(value)) return value as T;
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value) as unknown;
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) return parsed as T;
    } catch {
      return fallback;
    }
  }
  return fallback;
}

function stringArrayValue(value: unknown) {
  if (Array.isArray(value)) return value.filter((item): item is string => typeof item === "string");
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value) as unknown;
      if (Array.isArray(parsed)) return parsed.filter((item): item is string => typeof item === "string");
    } catch {
      return [];
    }
  }
  return [];
}

function rowToCrmRequest(
  row: Record<string, unknown>,
  filtersRow?: Record<string, unknown>,
  fieldRows: Record<string, unknown>[] = [],
): CrmRequest {
  const legacyCustomer = objectValue<Record<string, unknown>>(row.customer_json, {});
  const legacyFilters = objectValue<Record<string, unknown>>(row.filters_json, {});
  const fields = fieldRows.length
    ? fieldRows.map((field) => stringValue(field.field_key)).filter(Boolean)
    : stringArrayValue(legacyFilters.fields);
  const cnaePrincipal = stringArrayValue(filtersRow?.cnae_principal);
  const cnaeSecondary = stringArrayValue(filtersRow?.cnae_secondary);
  const companySizes = stringArrayValue(filtersRow?.company_sizes);
  const status = stringValue(row.status, "analysis");
  return {
    id: stringValue(row.id),
    publicCode: stringValue(row.public_code),
    createdAt: stringValue(row.created_at, nowIso()),
    updatedAt: stringValue(row.updated_at, stringValue(row.created_at, nowIso())),
    source: stringValue(row.source, "supabase"),
    status: (status === "em_validacao" ? "analysis" : status) as CrmRequestStatus,
    customer: {
      name: stringValue(row.requester_name, stringValue(legacyCustomer.name, "Cliente sem nome")),
      company: stringValue(row.requester_company, stringValue(legacyCustomer.company)) || undefined,
      email: stringValue(row.requester_email, stringValue(legacyCustomer.email)) || undefined,
      whatsapp: stringValue(row.requester_whatsapp, stringValue(legacyCustomer.whatsapp)) || undefined,
    },
    commercialGoal: stringValue(row.commercial_goal) || undefined,
    filters: {
      segment: stringValue(row.segment_slug, stringValue(row.segment_label, stringValue(legacyFilters.segment, "base-cnpj"))),
      uf: stringValue(filtersRow?.uf, stringValue(legacyFilters.uf)) || undefined,
      city: stringValue(filtersRow?.city, stringValue(legacyFilters.city)) || undefined,
      concessionaria: stringValue(filtersRow?.concessionaria, stringValue(legacyFilters.concessionaria)) || undefined,
      openingPeriod: stringValue(filtersRow?.opening_period, stringValue(legacyFilters.openingPeriod)) || undefined,
      openingDateStart: stringValue(filtersRow?.opening_date_start, stringValue(legacyFilters.openingDateStart)) || undefined,
      openingDateEnd: stringValue(filtersRow?.opening_date_end, stringValue(legacyFilters.openingDateEnd)) || undefined,
      companySize: (companySizes.length ? companySizes : stringArrayValue(legacyFilters.companySize)) as CrmRequest["filters"]["companySize"],
      registrationStatus: stringValue(
        filtersRow?.registration_status,
        stringValue(legacyFilters.registrationStatus, "ATIVA"),
      ) as CrmRequest["filters"]["registrationStatus"],
      branchType: stringValue(filtersRow?.establishment_type, stringValue(legacyFilters.branchType, "QUALQUER")) as CrmRequest["filters"]["branchType"],
      cnaes: [...cnaePrincipal, ...cnaeSecondary].length ? [...cnaePrincipal, ...cnaeSecondary] : stringArrayValue(legacyFilters.cnaes),
      minCapital: filtersRow?.min_capital === undefined ? undefined : numberValue(filtersRow.min_capital),
      maxCapital: filtersRow?.max_capital === undefined ? undefined : numberValue(filtersRow.max_capital),
      quantity: numberValue(filtersRow?.desired_quantity, numberValue(legacyFilters.quantity, 100)),
      fields,
      deliveryFormat: stringValue(filtersRow?.delivery_format, stringValue(legacyFilters.deliveryFormat, "xlsx")) as CrmRequest["filters"]["deliveryFormat"],
    },
    enrichmentPaid: booleanValue(row.enrichment_paid),
    enrichmentEnabled: booleanValue(row.enrichment_enabled),
    enrichmentStatus: stringValue(row.enrichment_status, "locked") as CrmRequest["enrichmentStatus"],
    paymentStatus: booleanValue(row.is_paid) ? "paid" : stringValue(row.payment_status, "pending") as CrmRequest["paymentStatus"],
    jobId: stringValue(row.job_id) || undefined,
    exportId: stringValue(row.export_id) || undefined,
    notes: stringValue(row.notes) || undefined,
  };
}

function rowToCnpjJob(row: Record<string, unknown>): CnpjJob {
  const logs = stringArrayValue(row.logs);
  const searchStats = objectValue<Record<string, unknown>>(row.search_stats, {});
  return {
    id: stringValue(row.id),
    requestId: stringValue(row.request_id),
    createdAt: stringValue(row.created_at, nowIso()),
    updatedAt: stringValue(row.updated_at, stringValue(row.created_at, nowIso())),
    status: stringValue(row.status, "queued") as CnpjJob["status"],
    worker: "rfb_cnpj",
    filtersSnapshot: objectValue(row.filters_snapshot, {}),
    rowsMatched: numberValue(row.rows_matched, numberValue(searchStats.records_kept)),
    rowsExported: numberValue(row.rows_exported, numberValue(row.row_count)),
    progress: numberValue(row.progress),
    currentStep: stringValue(row.current_step) || undefined,
    searchProvider: stringValue(row.search_provider, "minha_receita"),
    searchStats,
    warningMessage: stringValue(row.warning_message) || undefined,
    logs,
    error: stringValue(row.error_message, stringValue(row.error)) || undefined,
  };
}

function rowToCrmExport(row: Record<string, unknown>): CrmExport {
  const fileUrl = stringValue(row.file_url, stringValue(row.storage_path, stringValue(row.signed_url)));
  return {
    id: stringValue(row.id),
    requestId: stringValue(row.request_id),
    jobId: stringValue(row.job_id) || undefined,
    createdAt: stringValue(row.created_at, nowIso()),
    status: stringValue(row.status, "pending") as CrmExport["status"],
    format: stringValue(row.file_format, stringValue(row.format, "xlsx")) as CrmExport["format"],
    fields: stringArrayValue(row.fields_snapshot).length ? stringArrayValue(row.fields_snapshot) : stringArrayValue(row.fields),
    rowCount: numberValue(row.row_count),
    fileUrl: fileUrl || undefined,
    storageProvider: stringValue(row.storage_provider, "supabase") as CrmExport["storageProvider"],
    expiresAt: stringValue(row.signed_url_expires_at, stringValue(row.expires_at)) || undefined,
  };
}

function mergeById<T extends { id: string; createdAt: string }>(remote: T[], local: T[]) {
  const merged = new Map<string, T>();
  for (const item of remote) {
    if (item.id) merged.set(item.id, item);
  }
  for (const item of local) {
    if (item.id) merged.set(item.id, item);
  }
  return [...merged.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function listCrmRequestsForAdmin() {
  const result = await readRows("custom_requests", "?select=*&order=created_at.desc&limit=100");
  if (!result.configured) return listCrmRequests();
  const remote = result.rows.map((row) => rowToCrmRequest(row));
  for (const request of remote) store.requests.set(request.id, request);
  return mergeById(remote, listCrmRequests());
}

export async function getCrmRequestForAdmin(id: string) {
  const current = getCrmRequest(id);
  if (current) return current;
  const encoded = encodeURIComponent(id);
  const result = await readRows("custom_requests", `?select=*&or=(id.eq.${encoded},public_code.eq.${encoded})&limit=1`);
  if (!result.configured || !result.rows.length) return null;
  const requestId = stringValue(result.rows[0].id);
  const [filters, fields] = await Promise.all([
    readRows("request_filters", `?select=*&request_id=eq.${encodeURIComponent(requestId)}&limit=1`),
    readRows("request_fields", `?select=*&request_id=eq.${encodeURIComponent(requestId)}&order=created_at.asc`),
  ]);
  const request = rowToCrmRequest(result.rows[0], filters.rows[0], fields.rows);
  store.requests.set(request.id, request);
  return request;
}

export async function updateCrmRequest(id: string, patch: { status?: CrmRequestStatus; notes?: string }) {
  const current = await getCrmRequestForAdmin(id);
  if (!current) return null;
  const next: CrmRequest = {
    ...current,
    ...patch,
    updatedAt: nowIso(),
  };
  store.requests.set(next.id, next);
  appendRequestEvent(next.id, patch.status ? `Status alterado para ${patch.status}.` : "Pedido atualizado.");
  await updateLead("custom_requests", next.id, {
    status: next.status,
    notes: next.notes,
    updated_at: next.updatedAt,
  });
  await recordRequestEvent(next.id, next.status, patch.status ? `Status alterado para ${patch.status}.` : "Pedido atualizado.");
  await writeAuditLog("crm_request_updated", { requestId: next.id, patch });
  return next;
}

export async function validateCrmRequest(id: string) {
  const request = await getCrmRequestForAdmin(id);
  if (!request) return null;
  assertNoDefaultEnrichment(request.filters.fields);
  return updateCrmRequest(request.id, { status: "validated" });
}

export async function markRequestPaid(id: string) {
  const request = await getCrmRequestForAdmin(id);
  if (!request) return null;
  const next: CrmRequest = {
    ...request,
    status: "paid",
    paymentStatus: "paid",
    updatedAt: nowIso(),
  };
  store.requests.set(next.id, next);
  appendRequestEvent(next.id, "Pagamento confirmado manualmente pelo admin.");
  await updateLead("custom_requests", next.id, {
    status: next.status,
    is_paid: true,
    paid_at: nowIso(),
    updated_at: next.updatedAt,
  });
  await recordRequestEvent(next.id, next.status, "Pagamento confirmado manualmente pelo admin.");
  await writeAuditLog("crm_request_paid", { requestId: next.id });
  return next;
}

export async function createCnpjJob(id: string) {
  const request = await getCrmRequestForAdmin(id);
  if (!request) return null;
  if (!["validated", "paid"].includes(request.status)) {
    throw new Error("Valide o pedido e confirme a regra de pagamento antes de criar o job.");
  }

  const job: CnpjJob = {
    id: crypto.randomUUID(),
    requestId: request.id,
    createdAt: nowIso(),
    updatedAt: nowIso(),
    status: "queued",
    worker: "rfb_cnpj",
    filtersSnapshot: request.filters,
    rowsMatched: 0,
    rowsExported: 0,
    logs: [],
  };
  appendLog(job, "Job CNPJ criado; processamento será executado pelo worker Python externo.");
  store.jobs.set(job.id, job);

  const next: CrmRequest = { ...request, status: "queued", jobId: job.id, updatedAt: nowIso() };
  store.requests.set(next.id, next);
  appendRequestEvent(next.id, `Job ${job.id} criado e colocado na fila do worker.`);

  await persistLead("rfb_processing_jobs", {
    id: job.id,
    request_id: request.id,
    job_type: "rfb_export",
    status: job.status,
    current_step: "queued",
    progress: 0,
    search_provider: "minha_receita",
    filters_snapshot: job.filtersSnapshot,
    search_stats: {
      provider: "minha_receita",
      created_from: "admin_crm",
    },
  });
  await persistLead("rfb_job_logs", {
    jobId: job.id,
    requestId: request.id,
    level: "info",
    step: "queued",
    message: "Job CNPJ criado; processamento será executado pelo worker Python externo.",
    metadata: { filtersSnapshot: job.filtersSnapshot },
  });
  await updateLead("custom_requests", next.id, {
    status: next.status,
    job_id: job.id,
    updated_at: next.updatedAt,
  });
  await recordRequestEvent(next.id, next.status, `Job ${job.id} criado e colocado na fila do worker.`, { jobId: job.id });
  await writeAuditLog("cnpj_job_created", { requestId: request.id, jobId: job.id });
  return { request: next, job };
}

export function listCnpjJobs() {
  return [...store.jobs.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getCnpjJob(id: string) {
  return store.jobs.get(id);
}

export async function listCnpjJobsForAdmin() {
  const result = await readRows("rfb_processing_jobs", "?select=*&order=created_at.desc&limit=100");
  if (!result.configured) return listCnpjJobs();
  const remote = result.rows.map(rowToCnpjJob);
  for (const job of remote) store.jobs.set(job.id, job);
  return mergeById(remote, listCnpjJobs());
}

export async function getCnpjJobForAdmin(id: string) {
  const current = getCnpjJob(id);
  if (current) return current;
  const result = await readRows("rfb_processing_jobs", `?select=*&id=eq.${encodeURIComponent(id)}&limit=1`);
  if (!result.configured || !result.rows.length) return null;
  const job = rowToCnpjJob(result.rows[0]);
  const logs = await readRows("rfb_job_logs", `?select=message&job_id=eq.${encodeURIComponent(job.id)}&order=created_at.asc`);
  if (logs.configured && logs.rows.length) job.logs = logs.rows.map((row) => stringValue(row.message)).filter(Boolean);
  store.jobs.set(job.id, job);
  return job;
}

export async function completeJobWithExport(
  jobId: string,
  options: { rowCount?: number; fileUrl?: string; format?: CrmExport["format"]; fields?: string[] } = {},
) {
  const job = await getCnpjJobForAdmin(jobId);
  if (!job) return null;
  const fields = options.fields?.length
    ? options.fields
    : Array.isArray(job.filtersSnapshot.fields)
      ? (job.filtersSnapshot.fields as string[])
      : [];
  const rowCount = Number.isFinite(options.rowCount) ? Number(options.rowCount) : 0;
  const exportRecord: CrmExport = {
    id: crypto.randomUUID(),
    requestId: job.requestId,
    jobId: job.id,
    createdAt: nowIso(),
    status: "ready",
    format: options.format || "xlsx",
    fields,
    rowCount,
    fileUrl: options.fileUrl,
    storageProvider: process.env.R2_BUCKET ? "r2" : process.env.SUPABASE_URL ? "supabase" : "local",
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  };
  const completed: CnpjJob = { ...job, status: "completed", rowsExported: rowCount, updatedAt: nowIso() };
  appendLog(completed, `Export pronto para entrega controlada: ${rowCount} linhas.`);
  store.jobs.set(completed.id, completed);
  store.exports.set(exportRecord.id, exportRecord);

  const request = await getCrmRequestForAdmin(job.requestId);
  if (request) {
    const next = { ...request, status: "ready" as const, exportId: exportRecord.id, updatedAt: nowIso() };
    store.requests.set(request.id, next);
    appendRequestEvent(request.id, `Export ${exportRecord.id} pronto para link assinado.`);
    await updateLead("custom_requests", request.id, {
      status: next.status,
      updated_at: next.updatedAt,
    });
    await recordRequestEvent(request.id, next.status, `Export ${exportRecord.id} pronto para link assinado.`, {
      exportId: exportRecord.id,
      rowCount,
    });
  }

  await updateLead("rfb_processing_jobs", completed.id, {
    status: completed.status,
    progress: 100,
    current_step: "completed",
    finished_at: nowIso(),
    updated_at: completed.updatedAt,
  });
  await persistLead("rfb_job_logs", {
    jobId: completed.id,
    requestId: completed.requestId,
    level: "info",
    step: "completed",
    message: `Export pronto para entrega controlada: ${rowCount} linhas.`,
    metadata: { exportId: exportRecord.id, rowCount },
  });
  await persistLead("exports", {
    id: exportRecord.id,
    request_id: exportRecord.requestId,
    job_id: exportRecord.jobId,
    status: exportRecord.status,
    file_format: exportRecord.format,
    fields_snapshot: exportRecord.fields,
    row_count: exportRecord.rowCount,
    file_name: exportRecord.fileUrl?.split(/[\\/]/).pop(),
    storage_path: exportRecord.fileUrl,
    storage_provider: exportRecord.storageProvider,
    signed_url_expires_at: exportRecord.expiresAt,
    filters_snapshot: completed.filtersSnapshot,
  });
  await persistLead("export_files", {
    exportId: exportRecord.id,
    requestId: exportRecord.requestId,
    fileName: exportRecord.fileUrl?.split(/[\\/]/).pop() || `${exportRecord.id}.${exportRecord.format}`,
    fileFormat: exportRecord.format,
    storageProvider: exportRecord.storageProvider,
    storagePath: exportRecord.fileUrl,
  });
  await writeAuditLog("cnpj_export_ready", { jobId, exportId: exportRecord.id, rowCount });
  return exportRecord;
}

export function listCrmExports() {
  return [...store.exports.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getCrmExport(id: string) {
  return store.exports.get(id);
}

export async function listCrmExportsForAdmin() {
  const result = await readRows("exports", "?select=*&order=created_at.desc&limit=100");
  if (!result.configured) return listCrmExports();
  const remote = result.rows.map(rowToCrmExport);
  for (const exportRecord of remote) store.exports.set(exportRecord.id, exportRecord);
  return mergeById(remote, listCrmExports());
}

export async function getCrmExportForAdmin(id: string) {
  const current = getCrmExport(id);
  if (current) return current;
  const result = await readRows("exports", `?select=*&id=eq.${encodeURIComponent(id)}&limit=1`);
  if (!result.configured || !result.rows.length) return null;
  const exportRecord = rowToCrmExport(result.rows[0]);
  store.exports.set(exportRecord.id, exportRecord);
  return exportRecord;
}

export async function createSignedExportUrl(id: string, expiresInSeconds: number) {
  const exportRecord = await getCrmExportForAdmin(id);
  if (!exportRecord || exportRecord.status !== "ready" || !exportRecord.fileUrl) return null;
  const expiresAt = new Date(Date.now() + expiresInSeconds * 1000).toISOString();
  const token = encodeExportToken({ exportId: exportRecord.id, expiresAt });
  return {
    exportId: exportRecord.id,
    expiresAt,
    url: `/api/internal/exports/${exportRecord.id}?token=${encodeURIComponent(token)}`,
  };
}

export function verifySignedExportToken(id: string, token: string | null) {
  try {
    if (!token) return false;
    const [body, signature] = token.split(".");
    if (!body || !signature || !safeEqual(signature, signExportPayload(body))) return false;
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as { exportId: string; expiresAt: string };
    if (payload.exportId !== id) return false;
    return Date.parse(payload.expiresAt) > Date.now();
  } catch {
    return false;
  }
}

export async function recordExportDownload(exportId: string, request: Request) {
  const exportRecord = await getCrmExportForAdmin(exportId);
  if (!exportRecord) return null;
  const forwardedFor = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "";
  const ipHash = forwardedFor
    ? createHash("sha256").update(`${forwardedFor}:${signingSecret()}`).digest("hex")
    : undefined;
  const userAgent = request.headers.get("user-agent") || undefined;
  await persistLead("export_downloads", {
    export_id: exportRecord.id,
    request_id: exportRecord.requestId,
    ip_hash: ipHash,
    user_agent: userAgent,
  });
  appendRequestEvent(exportRecord.requestId, `Download autorizado do export ${exportRecord.id}.`);
  await recordRequestEvent(exportRecord.requestId, "download_authorized", `Download autorizado do export ${exportRecord.id}.`, {
    exportId: exportRecord.id,
  });
  await writeAuditLog("export_download_authorized", { requestId: exportRecord.requestId, exportId: exportRecord.id });
  return { exportId: exportRecord.id };
}

export function listCrmTimeline(requestId: string) {
  const request = getCrmRequest(requestId);
  if (!request) return [];
  const requestEvents = store.events.get(request.id) || [];
  const jobEvents = request.jobId ? getCnpjJob(request.jobId)?.logs || [] : [];
  return [...requestEvents, ...jobEvents].sort();
}

export async function listCrmTimelineForAdmin(requestId: string) {
  const local = listCrmTimeline(requestId);
  const [events, logs] = await Promise.all([
    readRows("request_status_events", `?select=created_at,message&request_id=eq.${encodeURIComponent(requestId)}&order=created_at.asc`),
    readRows("rfb_job_logs", `?select=created_at,message&request_id=eq.${encodeURIComponent(requestId)}&order=created_at.asc`),
  ]);
  if (!events.configured && !logs.configured) return local;
  const remote = [...events.rows, ...logs.rows]
    .map((row) => `${stringValue(row.created_at, nowIso())} ${stringValue(row.message)}`)
    .filter((item) => item.trim())
    .sort();
  return [...new Set([...remote, ...local])];
}

export function getPublicRequestStatus(publicCode: string) {
  const request = getCrmRequest(publicCode);
  if (!request) return null;
  return {
    publicCode: request.publicCode,
    status: request.status,
    createdAt: request.createdAt,
    updatedAt: request.updatedAt,
    product: "Gerador de planilhas com dados publicos de CNPJ",
    segment: request.filters.segment,
    uf: request.filters.uf,
    city: request.filters.city,
    concessionaria: request.filters.concessionaria,
    quantity: request.filters.quantity,
    exportReady: request.status === "ready" || request.status === "delivered",
    enrichmentStatus: request.enrichmentStatus,
    timeline: listCrmTimeline(request.id),
  };
}

export async function getPublicRequestStatusForProtocol(publicCode: string) {
  const request = await getCrmRequestForAdmin(publicCode);
  if (!request) return null;
  return {
    publicCode: request.publicCode,
    status: request.status,
    createdAt: request.createdAt,
    updatedAt: request.updatedAt,
    product: "Gerador de planilhas com dados publicos de CNPJ",
    segment: request.filters.segment,
    uf: request.filters.uf,
    city: request.filters.city,
    concessionaria: request.filters.concessionaria,
    quantity: request.filters.quantity,
    exportReady: request.status === "ready" || request.status === "delivered",
    enrichmentStatus: request.enrichmentStatus,
    timeline: await listCrmTimelineForAdmin(request.id),
  };
}

export async function markRequestDelivered(id: string) {
  return updateCrmRequest(id, { status: "delivered" });
}

export async function markEnrichmentPaid(id: string) {
  const request = await getCrmRequestForAdmin(id);
  if (!request) return null;
  const next: CrmRequest = { ...request, enrichmentPaid: true, enrichmentStatus: "available", updatedAt: nowIso() };
  store.requests.set(next.id, next);
  appendRequestEvent(next.id, "Add-on de enriquecimento confirmado como pago.");
  await updateLead("custom_requests", next.id, {
    enrichment_paid: next.enrichmentPaid,
    enrichment_status: next.enrichmentStatus,
    updated_at: next.updatedAt,
  });
  await recordRequestEvent(next.id, next.status, "Add-on de enriquecimento confirmado como pago.");
  await writeAuditLog("paid_enrichment_marked", { requestId: next.id });
  return next;
}

export async function runPaidEnrichment(id: string) {
  const request = await getCrmRequestForAdmin(id);
  if (!request) return null;
  assertEnrichmentCanRun({ isAdmin: true, enrichmentPaid: request.enrichmentPaid, paymentConfirmedByAdmin: request.enrichmentPaid });
  const next: CrmRequest = { ...request, enrichmentEnabled: true, enrichmentStatus: "running", updatedAt: nowIso() };
  store.requests.set(next.id, next);
  appendRequestEvent(next.id, "Enriquecimento pago liberado para processamento externo.");
  await persistLead("enrichment_runs", {
    request_id: next.id,
    status: "running",
    paid_confirmed: true,
    input_export_id: next.exportId,
    logs: ["Enriquecimento pago iniciado pelo admin."],
  });
  await updateLead("custom_requests", next.id, {
    enrichment_enabled: next.enrichmentEnabled,
    enrichment_status: next.enrichmentStatus,
    updated_at: next.updatedAt,
  });
  await recordRequestEvent(next.id, next.status, "Enriquecimento pago liberado para processamento externo.");
  return next;
}

export async function enablePaidEnrichment(id: string) {
  const request = await getCrmRequestForAdmin(id);
  if (!request) return null;
  assertEnrichmentCanRun({ isAdmin: true, enrichmentPaid: true, paymentConfirmedByAdmin: true });
  const next: CrmRequest = {
    ...request,
    enrichmentPaid: true,
    enrichmentEnabled: true,
    enrichmentStatus: "available",
    updatedAt: nowIso(),
  };
  store.requests.set(next.id, next);
  appendRequestEvent(next.id, "Enriquecimento pago habilitado pelo admin.");
  await updateLead("custom_requests", next.id, {
    enrichment_paid: next.enrichmentPaid,
    enrichment_enabled: next.enrichmentEnabled,
    enrichment_status: next.enrichmentStatus,
    updated_at: next.updatedAt,
  });
  await recordRequestEvent(next.id, next.status, "Enriquecimento pago habilitado pelo admin.");
  await writeAuditLog("paid_enrichment_enabled", { requestId: next.id });
  return next;
}

export function getCrmSettings() {
  return {
    supabase: Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY),
    storage: process.env.R2_BUCKET ? "Cloudflare R2/S3" : process.env.SUPABASE_URL ? "Supabase Storage" : "local controlado",
    worker: "workers/rfb_cnpj",
    provider: "Minha Receita como provider padrao para dados publicos de CNPJ",
    enrichment: "bloqueado por padrao; liberacao manual apos pagamento do add-on",
  };
}
