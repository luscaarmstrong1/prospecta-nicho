import { strict as assert } from "node:assert";
import { readFileSync } from "node:fs";
import test from "node:test";
import { buildWhatsAppUrl } from "../lib/whatsapp.ts";
import { productCatalog } from "../lib/products.ts";

test("metadata default não usa localhost", () => {
  const source = readFileSync("lib/site-url.ts", "utf8");
  const fallbackLine = source.split("\n").find((line) => line.includes("productionUrl"));
  assert.ok(fallbackLine);
  assert.equal(fallbackLine.includes("localhost"), false);
  assert.equal(fallbackLine.includes("127.0.0.1"), false);
  assert.equal(fallbackLine.includes(":3000"), false);
  assert.equal(fallbackLine.includes(":3001"), false);
});

test("whatsapp usa wa.me quando número está configurado", () => {
  const previous = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER = "5519999999999";
  const url = buildWhatsAppUrl("Olá");
  assert.match(url, /^https:\/\/wa\.me\/5519999999999\?text=/);
  if (previous === undefined) delete process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
  else process.env.NEXT_PUBLIC_WHATSAPP_NUMBER = previous;
});

test("catálogo não promete campos pessoais proibidos", () => {
  const fields = productCatalog.flatMap((product) => product.defaultFields).join(" ").toLowerCase();
  assert.equal(fields.includes("cpf"), false);
  assert.equal(fields.includes("sócio"), false);
  assert.equal(fields.includes("telefone particular"), false);
});

test("blog público redireciona para home", () => {
  const source = readFileSync("app/blog/page.tsx", "utf8");
  assert.match(source, /permanentRedirect\("\/"\)/);
});

test("formulários comerciais têm honeypot, rate limit e Turnstile preparado", () => {
  for (const route of [
    "app/api/contact/route.ts",
    "app/api/free-sample-request/route.ts",
    "app/api/custom-base-request/route.ts",
    "app/api/custom-requests/route.ts",
  ]) {
    const source = readFileSync(route, "utf8");
    assert.match(source, /rateLimit/);
    assert.match(source, /hasHoneypot/);
    assert.match(source, /verifyTurnstileIfConfigured/);
  }
});

test("configuração Next mantém GitHub Pages apenas de forma condicional", () => {
  const source = readFileSync("next.config.ts", "utf8");
  assert.match(source, /GITHUB_PAGES/);
  assert.match(source, /NEXT_PUBLIC_STATIC_EXPORT/);
  assert.match(source, /isStaticPreviewExport/);
  assert.match(source, /output: "export"/);
  assert.match(source, /assetPrefix/);
  assert.match(source, /basePath/);
  assert.match(source, /\?\s*{/);
});

test("basePath de assets só vale para preview ou export estático", () => {
  const source = readFileSync("lib/asset-path.ts", "utf8");
  assert.match(source, /allowStaticBasePath/);
  assert.match(source, /NEXT_PUBLIC_STATIC_EXPORT/);
  assert.match(source, /NEXT_PUBLIC_ALLOW_GITHUB_PAGES/);
  assert.match(source, /GITHUB_PAGES/);
});

test("URL canônica bloqueia GitHub Pages fora de preview estático", () => {
  const source = readFileSync("lib/site-url.ts", "utf8");
  assert.match(source, /productionUrl = "https:\/\/prospectanicho\.com\.br"/);
  assert.match(source, /github\\.io/);
  assert.match(source, /allowStaticPreviewUrl/);
  assert.match(source, /NEXT_PUBLIC_STATIC_EXPORT/);
});

test("segmentos públicos levam para solicitação rápida", () => {
  const source = readFileSync("app/page.tsx", "utf8");
  const segments = readFileSync("lib/segments.ts", "utf8");
  assert.match(source, /buildQuickRequestHref/);
  assert.match(segments, /agencias/);
  assert.match(segments, /seguranca-do-trabalho/);
});

test("admin normaliza mídia com assetPath e mantém Símbolo íntegro", () => {
  const source = readFileSync("lib/content-studio.ts", "utf8");
  assert.match(source, /rawMediaAssets/);
  assert.match(source, /Símbolo/);
  assert.match(source, /assetPath\(asset\.path\)/);
});

test("next config define headers de segurança no runtime server", () => {
  const source = readFileSync("next.config.ts", "utf8");
  assert.match(source, /Content-Security-Policy/);
  assert.match(source, /X-Content-Type-Options/);
  assert.match(source, /Referrer-Policy/);
  assert.match(source, /Permissions-Policy/);
  assert.match(source, /poweredByHeader:\s*false/);
});

test("solicitação rápida usa schema centralizado, service e logger redigido", () => {
  const route = readFileSync("app/api/custom-requests/route.ts", "utf8");
  assert.match(route, /customRequestSchema/);
  assert.match(route, /submitCustomRequest/);
  assert.match(route, /logger/);
  assert.match(route, /parseJsonBody/);
  assert.match(route, /requireTrustedOrigin/);
});

test("pagamentos não aprovam fluxo sem webhook validado", () => {
  const webhook = readFileSync("app/api/payments/webhook/route.ts", "utf8");
  const preference = readFileSync("app/api/payments/create-preference/route.ts", "utf8");
  assert.match(webhook, /MERCADO_PAGO_WEBHOOK_SECRET|ASAAS_WEBHOOK_SECRET/);
  assert.match(preference, /Base personalizada/);
  assert.match(preference, /status: 409/);
});
