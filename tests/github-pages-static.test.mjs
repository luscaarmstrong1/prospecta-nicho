import { strict as assert } from "node:assert";
import { readFileSync } from "node:fs";
import test from "node:test";

test("GitHub Pages build usa runtime estatico e basePath esperado", () => {
  const packageJson = JSON.parse(readFileSync("package.json", "utf8"));
  const buildScript = readFileSync("scripts/build-github-pages.mjs", "utf8");
  const workflow = readFileSync(".github/workflows/deploy-github-pages.yml", "utf8");
  assert.equal(packageJson.scripts["export:github"], "npm run build:github");
  assert.match(buildScript, /DEPLOY_TARGET:\s*"github-pages"/);
  assert.match(buildScript, /NEXT_PUBLIC_RUNTIME_TARGET:\s*"github-pages"/);
  assert.match(buildScript, /NEXT_PUBLIC_BASE_PATH.*\/prospecta-nicho/);
  assert.match(workflow, /contents:\s*write/);
  assert.match(workflow, /peaceiris\/actions-gh-pages@[0-9a-f]{40} # v4/);
  assert.match(workflow, /publish_dir:\s*\.\/out/);
  assert.match(workflow, /publish_branch:\s*gh-pages/);
  assert.doesNotMatch(workflow, /environment:\s*github-pages/);
  assert.match(workflow, /NEXT_PUBLIC_SUPABASE_URL/);
  assert.doesNotMatch(workflow, /SUPABASE_SERVICE_ROLE_KEY/);
});

test("cliente estatico roteia chamadas publicas e admin para Supabase Functions", () => {
  const runtime = readFileSync("src/lib/api/runtime.ts", "utf8");
  const client = readFileSync("src/lib/api/client.ts", "utf8");
  for (const functionName of [
    "public-create-request",
    "public-sample-request",
    "public-request-status",
    "admin-login",
    "admin-requests",
    "admin-request-detail",
    "admin-create-job",
    "admin-sign-export",
    "health",
  ]) {
    assert.match(runtime, new RegExp(functionName));
  }
  assert.match(`${runtime}\n${client}`, /NEXT_PUBLIC_SUPABASE_FUNCTIONS_URL/);
  assert.match(client, /x-resource-id/);
  assert.match(client, /authorization/);
  assert.match(runtime, /pathname === "\/api\/admin\/requests"/);
  assert.match(runtime, /admin-request-detail/);
  assert.match(runtime, /create-job/);
});

test("formularios publicos nao simulam sucesso em export estatico", () => {
  for (const file of [
    "components/ContactForm.tsx",
    "components/requests/UnifiedRequestForm.tsx",
  ]) {
    const source = readFileSync(file, "utf8");
    assert.match(source, /apiFetch/);
    assert.doesNotMatch(source, /if \(isStaticExport\)/);
  }
});

test("rota estatica de pedido por protocolo existe para GitHub Pages", () => {
  const page = readFileSync("app/pedido/page.tsx", "utf8");
  const client = readFileSync("app/pedido/RequestStatusClient.tsx", "utf8");
  assert.match(page, /force-static/);
  assert.match(client, /codigo/);
  assert.match(client, /public-request-status|\/api\/public\/request-status/);
  assert.match(client, /AbortController/);
  assert.match(client, /finally/);
  assert.match(client, /Tente novamente/);
});

test("fluxo publico unificado nao preseleciona produto por query string", () => {
  const form = readFileSync("components/requests/UnifiedRequestForm.tsx", "utf8");
  const selector = readFileSync("components/requests/RequestTypeSelector.tsx", "utf8");
  const createFunction = readFileSync("supabase/functions/public-create-request/index.ts", "utf8");

  assert.match(form, /RequestTypeSelector/);
  assert.match(selector, /Amostra grátis/);
  assert.match(selector, /Base personalizada/);
  assert.doesNotMatch(form, /searchParams\.get\("segment"\)/);
  assert.doesNotMatch(createFunction, /rfb_processing_jobs/);
});

test("service role e token privado ficam fora do frontend", () => {
  const client = [
    readFileSync("src/lib/api/client.ts", "utf8"),
    readFileSync("src/lib/api/runtime.ts", "utf8"),
    readFileSync(".github/workflows/deploy-github-pages.yml", "utf8"),
  ].join("\n");
  assert.doesNotMatch(client, /SUPABASE_SERVICE_ROLE_KEY/);
  assert.doesNotMatch(client, /EXPORT_SIGNING_SECRET/);
  assert.doesNotMatch(client, /RFB_DATA_DIR/);
});

test("health informa configurado somente quando checks estao ok", () => {
  const health = readFileSync("supabase/functions/health/index.ts", "utf8");

  assert.match(health, /supabaseUrlConfigured \? "SUPABASE_URL configurado\." : "SUPABASE_URL ausente\."/);
  assert.match(health, /serviceRoleConfigured \? "SUPABASE_SERVICE_ROLE_KEY configurado\." : "SUPABASE_SERVICE_ROLE_KEY ausente\."/);
});

test("CRM admin estatico lista e abre pedidos em runtime via Edge Functions", () => {
  const requestsPage = readFileSync("app/admin/requests/page.tsx", "utf8");
  const listClient = readFileSync("components/admin/CrmRequestsRealtimeList.tsx", "utf8");
  const detailPage = readFileSync("app/admin/requests/detalhe/page.tsx", "utf8");
  const detailClient = readFileSync("components/admin/CrmRequestRealtimeDetail.tsx", "utf8");
  const compatPage = readFileSync("app/admin/requests/[id]/page.tsx", "utf8");

  assert.match(requestsPage, /CrmRequestsRealtimeList/);
  assert.doesNotMatch(requestsPage, /listCrmRequestsForAdmin/);
  assert.match(listClient, /apiFetch\("\/api\/admin\/requests"\)/);
  assert.match(listClient, /sessionStorage|apiFetch/);
  assert.match(listClient, /admin\/requests\/detalhe\/\?id=/);
  assert.match(detailPage, /CrmRequestRealtimeDetail/);
  assert.match(detailClient, /useSearchParams/);
  assert.match(detailClient, /apiFetch\(`\/api\/admin\/requests\/\$\{encodeURIComponent\(requestId\)\}`\)/);
  assert.match(detailClient, /CrmRequestActions/);
  assert.match(detailClient, /onActionComplete=\{loadRequest\}/);
  assert.doesNotMatch(compatPage, /getCrmRequestForAdmin|listCrmTimelineForAdmin/);
});
