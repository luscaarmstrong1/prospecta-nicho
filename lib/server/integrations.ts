export type PersistResult = {
  configured: boolean;
  id?: string;
};

export type ReadRowsResult = {
  configured: boolean;
  rows: Record<string, unknown>[];
};

function createLocalId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function toSnakeCase(value: string) {
  return value.replace(/[A-Z]/g, (char) => `_${char.toLowerCase()}`);
}

function normalizePayload(payload: Record<string, unknown>) {
  return Object.fromEntries(Object.entries(payload).map(([key, value]) => [toSnakeCase(key), value]));
}

function firstValue(payload: Record<string, unknown>, ...keys: string[]) {
  for (const key of keys) {
    if (payload[key] !== undefined && payload[key] !== null && payload[key] !== "") return payload[key];
  }
  return undefined;
}

function integerValue(value: unknown) {
  const numeric = Number(String(value || "").replace(/\D/g, ""));
  return Number.isFinite(numeric) && numeric > 0 ? numeric : null;
}

function pickPayload(payload: Record<string, unknown>, columns: string[]) {
  const normalized = normalizePayload(payload);
  return Object.fromEntries(columns.filter((column) => normalized[column] !== undefined).map((column) => [column, normalized[column]]));
}

function normalizeForTable(table: string, payload: Record<string, unknown>) {
  if (table === "leads") {
    return pickPayload(payload, ["id", "created_at", "name", "company", "email", "whatsapp", "source", "status", "consent", "notes"]);
  }

  if (table === "custom_requests") {
    return {
      id: firstValue(payload, "id"),
      public_code: firstValue(payload, "publicCode", "public_code"),
      created_at: firstValue(payload, "createdAt", "created_at"),
      name: firstValue(payload, "name"),
      requester_name: firstValue(payload, "requesterName", "requester_name", "name"),
      company: firstValue(payload, "company"),
      requester_company: firstValue(payload, "requesterCompany", "requester_company", "company"),
      email: firstValue(payload, "email"),
      requester_email: firstValue(payload, "requesterEmail", "requester_email", "email"),
      whatsapp: firstValue(payload, "whatsapp"),
      requester_whatsapp: firstValue(payload, "requesterWhatsapp", "requester_whatsapp", "whatsapp"),
      niche: firstValue(payload, "niche", "segment"),
      segment_slug: firstValue(payload, "segmentSlug", "segment_slug"),
      segment_label: firstValue(payload, "segmentLabel", "segment_label", "segment"),
      product_slug: firstValue(payload, "productSlug", "product_slug"),
      city: firstValue(payload, "city", "location"),
      state: firstValue(payload, "state"),
      cnae: firstValue(payload, "cnae"),
      requested_quantity: integerValue(firstValue(payload, "requestedQuantity", "quantity")),
      commercial_goal: firstValue(payload, "commercialGoal", "objective", "goal"),
      notes: firstValue(payload, "notes"),
      priority: firstValue(payload, "priority") || "normal",
      is_paid: firstValue(payload, "isPaid", "is_paid") || false,
      enrichment_requested: firstValue(payload, "enrichmentRequested", "enrichment_requested") || false,
      enrichment_paid: firstValue(payload, "enrichmentPaid", "enrichment_paid") || false,
      enrichment_enabled: firstValue(payload, "enrichmentEnabled", "enrichment_enabled") || false,
      enrichment_status: firstValue(payload, "enrichmentStatus", "enrichment_status") || "locked",
      status: firstValue(payload, "status") || "analysis",
    };
  }

  if (table === "audit_logs") {
    return pickPayload(payload, ["id", "created_at", "event_type", "entity_type", "entity_id", "payload"]);
  }

  return normalizePayload(payload);
}

function getSupabaseCredentials() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) return null;
  return { url: url.replace(/\/+$/, ""), serviceRoleKey };
}

function assertSafeTableName(table: string) {
  if (!/^[a-z][a-z0-9_]*$/i.test(table)) {
    throw new Error("Tabela Supabase invalida.");
  }
}

async function supabaseFetch(table: string, init: RequestInit, query = "") {
  const credentials = getSupabaseCredentials();
  if (!credentials) return null;
  assertSafeTableName(table);
  const response = await fetch(`${credentials.url}/rest/v1/${table}${query}`, {
    ...init,
    headers: {
      apikey: credentials.serviceRoleKey,
      authorization: `Bearer ${credentials.serviceRoleKey}`,
      "content-type": "application/json",
      ...(init.headers || {}),
    },
  });
  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`Falha ao acessar ${table}: ${response.status} ${detail}`.trim());
  }
  return response;
}

export async function persistLead(table: string, payload: Record<string, unknown>): Promise<PersistResult> {
  const normalized = Object.fromEntries(
    Object.entries(normalizeForTable(table, payload)).filter(([, value]) => value !== undefined && value !== null),
  );
  const response = await supabaseFetch(table, {
    method: "POST",
    headers: { prefer: "return=representation" },
    body: JSON.stringify(normalized),
  });
  if (!response) return { configured: false, id: String(payload.id || createLocalId(table)) };

  const rows = (await response.json().catch(() => [])) as Array<{ id?: string }>;
  return { configured: true, id: rows[0]?.id || String(payload.id || createLocalId(table)) };
}

export async function updateLead(table: string, id: string, patch: Record<string, unknown>) {
  const response = await supabaseFetch(
    table,
    {
      method: "PATCH",
      headers: { prefer: "return=minimal" },
      body: JSON.stringify(normalizePayload(patch)),
    },
    `?id=eq.${encodeURIComponent(id)}`,
  );
  return { configured: Boolean(response) };
}

export async function readRows(table: string, query = ""): Promise<ReadRowsResult> {
  const response = await supabaseFetch(
    table,
    {
      method: "GET",
      headers: { accept: "application/json" },
    },
    query,
  );
  if (!response) return { configured: false, rows: [] };

  const rows = (await response.json().catch(() => [])) as Record<string, unknown>[];
  return { configured: true, rows };
}

export async function sendTransactionalEmail(_kind: string, _payload: Record<string, unknown>) {
  return { configured: Boolean(process.env.RESEND_API_KEY) };
}

export async function writeAuditLog(action: string, payload: Record<string, unknown>) {
  return persistLead("audit_logs", {
    eventType: action,
    entityType: payload.exportId ? "crm_export" : payload.jobId ? "cnpj_job" : payload.requestId ? "crm_request" : "system",
    entityId: payload.exportId || payload.jobId || payload.requestId,
    payload,
    createdAt: new Date().toISOString(),
  });
}
