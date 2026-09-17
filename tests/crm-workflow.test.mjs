import { strict as assert } from "node:assert";
import { readFileSync } from "node:fs";
import test from "node:test";

test("formularios publicos registram pedido no CRM", () => {
  const quickService = readFileSync("src/server/services/custom-requests.ts", "utf8");
  const builderRoute = readFileSync("app/api/custom-base-request/route.ts", "utf8");

  assert.match(quickService, /registerCrmRequest/);
  assert.match(quickService, /createCrmRequestFromQuickRequest/);
  assert.match(builderRoute, /createCrmRequestFromBuilder/);
  assert.match(builderRoute, /locked_paid_addon/);
});

test("CRM nao processa Receita dentro de API route", () => {
  const crmService = readFileSync("src/server/services/crm.ts", "utf8");
  const createJobRoute = readFileSync("app/api/admin/requests/[id]/create-job/route.ts", "utf8");
  const completeJobRoute = readFileSync("app/api/admin/jobs/[id]/complete/route.ts", "utf8");

  assert.match(crmService, /worker: "rfb_cnpj"/);
  assert.match(crmService, /Job CNPJ criado/);
  assert.doesNotMatch(createJobRoute, /spawn|exec|python|duckdb|polars/i);
  assert.match(completeJobRoute, /WORKER_FINALIZATION_REQUIRED/);
  assert.doesNotMatch(completeJobRoute, /fileUrl|completeJobWithExport/);
  assert.doesNotMatch(completeJobRoute, /spawn|exec|python|duckdb|polars/i);
});

test("persistencia Supabase usa REST server-side e fallback apenas sem credenciais", () => {
  const integrations = readFileSync("lib/server/integrations.ts", "utf8");
  const crmService = readFileSync("src/server/services/crm.ts", "utf8");

  assert.match(integrations, /SUPABASE_SERVICE_ROLE_KEY/);
  assert.match(integrations, /\/rest\/v1\//);
  assert.match(integrations, /return \{ configured: false/);
  assert.match(integrations, /export async function readRows/);
  assert.match(crmService, /listCrmRequestsForAdmin/);
  assert.match(crmService, /listCrmExportsForAdmin/);
  assert.doesNotMatch(integrations, /NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY/);
});

test("admin pages e APIs ficam protegidas por sessao ou bearer token", () => {
  const middleware = readFileSync("middleware.ts", "utf8");
  const adminAuth = readFileSync("lib/server/admin-auth.ts", "utf8");
  const sessionRoute = readFileSync("app/api/admin/session/route.ts", "utf8");

  assert.match(middleware, /matcher: \["\/admin\/:path\*"\]/);
  assert.match(middleware, /prospecta_admin_session/);
  assert.match(adminAuth, /authorization/);
  assert.match(adminAuth, /readCookieToken/);
  assert.match(sessionRoute, /httpOnly: true/);
});

test("links assinados opcionais sao protegidos e a rota publica nao libera arquivo", () => {
  const crmService = readFileSync("src/server/services/crm.ts", "utf8");
  const exportRoute = readFileSync("app/api/internal/exports/[id]/route.ts", "utf8");
  const exportsPage = readFileSync("app/admin/exportacoes/page.tsx", "utf8");
  const pedidoPage = readFileSync("app/pedido/[id]/page.tsx", "utf8");

  assert.match(crmService, /createSignedExportUrl/);
  assert.match(crmService, /verifySignedExportToken/);
  assert.match(crmService, /exportRecord\.status !== "ready" \|\| !exportRecord\.fileUrl/);
  assert.match(exportRoute, /Link expirado ou inv/);
  assert.match(exportsPage, /CrmExportLinkActions/);
  assert.match(pedidoPage, /getPublicRequestStatusForProtocol/);
  assert.doesNotMatch(pedidoPage, /customer|fileUrl|filters\.fields/);
});

test("admin expoe fluxo operacional real do pedido ate entrega", () => {
  const detailPage = readFileSync("app/admin/requests/[id]/page.tsx", "utf8");
  const jobsPage = readFileSync("app/admin/jobs/page.tsx", "utf8");
  const requestActions = readFileSync("components/admin/CrmRequestActions.tsx", "utf8");

  for (const endpoint of ["validate", "mark-paid", "create-job", "mark-delivered", "mark-enrichment-paid", "run-enrichment"]) {
    assert.match(requestActions, new RegExp(endpoint));
  }
  assert.match(detailPage, /CrmRequestActions/);
  assert.match(jobsPage, /Aguardando worker local/);
  assert.doesNotMatch(jobsPage, /CnpjJobCompleteForm/);
});

test("enriquecimento permanece bloqueado e exige pagamento manual", () => {
  const tsGuard = readFileSync("src/features/enrichment/guards.ts", "utf8");
  const pyGuard = readFileSync("workers/rfb_cnpj/enrichment_locked.py", "utf8");

  assert.match(tsGuard, /enrichmentPaid/);
  assert.match(tsGuard, /paymentConfirmedByAdmin/);
  assert.match(pyGuard, /enrichment_paid/);
  assert.match(pyGuard, /payment_confirmed/);
});

test("supabase inclui tabelas operacionais do CRM CNPJ", () => {
  const schema = readFileSync("supabase/schema.sql", "utf8");

  for (const table of [
    "custom_requests",
    "request_filters",
    "request_fields",
    "request_status_events",
    "rfb_processing_jobs",
    "rfb_job_logs",
    "exports",
    "export_files",
    "export_downloads",
    "segment_mappings",
    "concessionarias",
    "enrichment_runs",
  ]) {
    assert.match(schema, new RegExp(`create table if not exists public\\.${table}`));
    assert.match(schema, new RegExp(`alter table public\\.${table} enable row level security`));
  }
});

test("worker possui filtros, scoring, export e testes Python", () => {
  for (const file of ["filters.py", "scoring.py", "exporter.py", "job_runner.py"]) {
    const source = readFileSync(`workers/rfb_cnpj/${file}`, "utf8");
    assert.ok(source.length > 200);
  }
  const exporter = readFileSync("workers/rfb_cnpj/exporter.py", "utf8");
  assert.match(exporter, /utf-8-sig/);
  assert.match(exporter, /assert_no_prohibited_fields/);
  assert.match(exporter, /Leads/);
  assert.match(exporter, /Resumo/);
  assert.match(exporter, /Filtros aplicados/);
  assert.match(exporter, /Leia-me/);
});
