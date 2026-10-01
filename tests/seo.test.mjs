import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

const root = process.cwd();
const read = (path) => readFileSync(join(root, path), "utf8");

test("SEO usa prospectanicho.app como origem canônica", () => {
  assert.match(read("lib/site-url.ts"), /https:\/\/prospectanicho\.app/);
  assert.doesNotMatch(read("lib/site-url.ts"), /prospectanicho\.com\.br/);
});

test("home publica marca, metadata e dados estruturados", () => {
  assert.match(read("app/page.tsx"), /Prospecta Nicho \| Leads B2B, Sites, Landing Pages e Automação/);
  assert.match(read("app/page.tsx"), /WebSite/);
  assert.match(read("app/layout.tsx"), /Organization/);
  assert.match(read("components\/home-v2\/HomeSiteV2.tsx"), /Prospecta Nicho: encontre/);
});

test("rotas estratégicas são páginas reais e indexáveis no sitemap", () => {
  const sitemap = read("app/sitemap.ts");
  for (const route of ["leads-b2b", "sites", "landing-pages", "automacao", "projetos", "sobre", "contato"]) {
    assert.equal(existsSync(join(root, "app", route, "page.tsx")), true, `Página /${route} ausente`);
    assert.match(sitemap, new RegExp(`\\[\"/${route}\"`));
  }
});

test("verificação Google depende de variável de ambiente", () => {
  const layout = read("app/layout.tsx");
  assert.match(layout, /GOOGLE_SITE_VERIFICATION/);
  assert.doesNotMatch(layout, /google-site-verification=[A-Za-z0-9_-]{12,}/);
});
