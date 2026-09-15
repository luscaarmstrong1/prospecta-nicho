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
  assert.match(workflow, /peaceiris\/actions-gh-pages@v3/);
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
    "admin-create-job",
    "admin-sign-export",
    "health",
  ]) {
    assert.match(runtime, new RegExp(functionName));
  }
  assert.match(`${runtime}\n${client}`, /NEXT_PUBLIC_SUPABASE_FUNCTIONS_URL/);
  assert.match(client, /x-resource-id/);
  assert.match(client, /authorization/);
});

test("formularios publicos nao simulam sucesso em export estatico", () => {
  for (const file of [
    "components/Forms.tsx",
    "components/HomeSampleForm.tsx",
    "components/ContactForm.tsx",
    "components/editor/BaseBuilder.tsx",
    "app/solicitar-planilha/QuickPlanilhaRequestForm.tsx",
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
