import { strict as assert } from "node:assert";
import { readFileSync } from "node:fs";
import test from "node:test";

globalThis.Deno = {
  env: {
    get(name) {
      if (name === "PUBLIC_ALLOWED_ORIGINS") return "https://preview.prospectanicho.test";
      return "";
    },
  },
};

const { handleCors } = await import("../supabase/functions/_shared/cors.ts");
const { readJsonBody, RequestBodyError } = await import(
  "../supabase/functions/_shared/request-body.ts"
);

test("CORS permite origens configuradas e rejeita origem desconhecida", () => {
  for (const origin of [
    "https://luscaarmstrong1.github.io",
    "http://localhost:3000",
    "https://prospectanicho.lssgroup.com.br",
    "https://preview.prospectanicho.test",
  ]) {
    const response = handleCors(new Request("https://functions.test", { method: "OPTIONS", headers: { origin } }));
    assert.equal(response?.status, 204);
    assert.equal(response?.headers.get("access-control-allow-origin"), origin);
    assert.equal(response?.headers.get("vary"), "Origin");
  }

  const rejected = handleCors(new Request("https://functions.test", {
    method: "OPTIONS",
    headers: { origin: "https://malicious.example" },
  }));
  assert.equal(rejected?.status, 403);
  assert.equal(rejected?.headers.get("access-control-allow-origin"), null);
});

test("leitura JSON aplica limite real de bytes e exige objeto", async () => {
  const parsed = await readJsonBody(new Request("https://functions.test", {
    method: "POST",
    body: JSON.stringify({ ok: true }),
  }), 64);
  assert.deepEqual(parsed, { ok: true });

  await assert.rejects(
    readJsonBody(new Request("https://functions.test", { method: "POST", body: JSON.stringify({ value: "x".repeat(80) }) }), 32),
    (error) => error instanceof RequestBodyError && error.status === 413,
  );
  await assert.rejects(
    readJsonBody(new Request("https://functions.test", { method: "POST", body: "[]" }), 32),
    (error) => error instanceof RequestBodyError && error.status === 400,
  );
});

test("idempotency key exige UUID v4 no backend", () => {
  const security = readFileSync("supabase/functions/_shared/request-security.ts", "utf8");
  assert.match(security, /\^\[0-9a-f\]\{8\}.*-4\[0-9a-f\]\{3\}-\[89ab\]/);
});

test("migração torna criação pública atômica, idempotente e limitada", () => {
  const migration = readFileSync("supabase/migrations/20260917200543_final_request_hardening.sql", "utf8");
  assert.match(migration, /create unique index[^;]+custom_requests_client_request_id_uidx/is);
  assert.match(migration, /pg_advisory_xact_lock/);
  assert.match(migration, /create or replace function public\.create_public_request/);
  assert.match(migration, /insert into public\.request_filters/);
  assert.match(migration, /insert into public\.request_fields/);
  assert.match(migration, /insert into public\.request_status_events/);
  assert.match(migration, /create or replace function public\.consume_edge_rate_limit/);
  assert.match(migration, /revoke all on function public\.create_public_request[^;]+from public, anon, authenticated/);
  assert.match(migration, /grant execute on function public\.create_public_request[^;]+to service_role/);
});

test("job usa somente colunas reais e respeita pagamento e estado", () => {
  const migration = readFileSync("supabase/migrations/20260917200543_final_request_hardening.sql", "utf8");
  const jobFunction = migration.slice(migration.indexOf("create or replace function public.create_rfb_job_for_request"));
  const insert = jobFunction.match(/insert into public\.rfb_processing_jobs\(([^)]+)\)/i)?.[1] || "";
  assert.match(insert, /request_id/);
  assert.match(insert, /filters_snapshot/);
  assert.doesNotMatch(insert, /\bsource\b/);
  assert.doesNotMatch(insert, /requested_fields/);
  assert.match(jobFunction, /PAYMENT_REQUIRED/);
  assert.match(jobFunction, /REQUEST_NOT_VALIDATED/);
  assert.match(migration, /create unique index[^;]+rfb_processing_jobs_one_active_per_request_uidx/is);
});

test("estado administrativo é centralizado no banco e a UI trata falhas", () => {
  const migration = readFileSync("supabase/migrations/20260917200543_final_request_hardening.sql", "utf8");
  const handlers = readFileSync("supabase/functions/_shared/admin-handlers.ts", "utf8");
  const actions = readFileSync("components/admin/CrmRequestActions.tsx", "utf8");
  assert.match(migration, /create or replace function public\.admin_transition_request/);
  assert.match(migration, /INVALID_STATE_TRANSITION/);
  assert.match(migration, /EXPORT_NOT_READY/);
  assert.match(handlers, /admin_transition_request/);
  assert.match(handlers, /create_rfb_job_for_request/);
  assert.match(actions, /try\s*{/);
  assert.match(actions, /catch\s*\(/);
  assert.match(actions, /finally\s*{/);
  assert.match(actions, /window\.confirm/);
});

test("status público não expõe mensagem interna nem storage privado", () => {
  const statusFunction = readFileSync("supabase/functions/public-request-status/index.ts", "utf8");
  assert.match(statusFunction, /PN-\[A-Z0-9\]/);
  assert.doesNotMatch(statusFunction, /\.select\("\*"\)/);
  assert.doesNotMatch(statusFunction, /request_status_events[\s\S]+message/);
  assert.doesNotMatch(statusFunction, /signed_url|storage_path|internal_notes/);
});

test("service role não aparece no bundle nem no workflow público", () => {
  const publicSources = [
    "app/pedido/RequestStatusClient.tsx",
    "components/ContactForm.tsx",
    "components/requests/UnifiedRequestForm.tsx",
    "lib/public-request.ts",
    "src/lib/api/client.ts",
    "src/lib/api/runtime.ts",
    ".github/workflows/deploy-github-pages.yml",
  ].map((file) => readFileSync(file, "utf8")).join("\n");
  assert.doesNotMatch(publicSources, /SUPABASE_SERVICE_ROLE_KEY/);
  assert.doesNotMatch(publicSources, /service_role/);
});
