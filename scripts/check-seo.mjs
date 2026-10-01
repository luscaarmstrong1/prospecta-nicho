import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const canonicalDomain = "https://prospectanicho.app";
const requiredRoutes = ["leads-b2b", "sites", "landing-pages", "automacao", "projetos", "sobre", "contato"];
const failures = [];

function read(path) {
  return readFileSync(join(root, path), "utf8");
}

const siteUrl = read("lib/site-url.ts");
const layout = read("app/layout.tsx");
const home = read("app/page.tsx");
const homeView = read("components/home-v2/HomeSiteV2.tsx");
const sitemap = read("app/sitemap.ts");
const robots = read("app/robots.ts");

if (!siteUrl.includes(canonicalDomain)) failures.push("lib/site-url.ts não define o domínio canônico de produção.");
if (!layout.includes("GOOGLE_SITE_VERIFICATION")) failures.push("app/layout.tsx não aceita GOOGLE_SITE_VERIFICATION.");
if (!layout.includes("Organization")) failures.push("app/layout.tsx não publica Organization JSON-LD.");
if (!home.includes("WebSite")) failures.push("app/page.tsx não publica WebSite JSON-LD.");
if (!home.includes("Prospecta Nicho | Leads B2B, Sites, Landing Pages e Automação")) failures.push("A home não tem o título SEO aprovado.");
if (!homeView.includes("Prospecta Nicho: encontre")) failures.push("O H1 da home não contém a marca Prospecta Nicho.");
if (!robots.includes("/sitemap.xml")) failures.push("robots.ts não referencia o sitemap.");

for (const route of requiredRoutes) {
  if (!existsSync(join(root, "app", route, "page.tsx"))) failures.push(`Rota obrigatória ausente: /${route}`);
  if (!sitemap.includes(`"/${route}"`)) failures.push(`Sitemap não inclui /${route}.`);
}

const publicSeoFiles = ["app/layout.tsx", "app/page.tsx", "app/sitemap.ts", "app/robots.ts", "lib/site.ts", "lib/site-url.ts", "lib/seo.ts"];
for (const file of publicSeoFiles) {
  const text = read(file);
  if (/prospectanicho\.com\.br|github\.io\/prospecta-nicho/i.test(text)) {
    failures.push(`${file} contém host público legado.`);
  }
  if (/SUPABASE_SERVICE_ROLE_KEY/.test(text)) failures.push(`${file} referencia service_role em superfície pública.`);
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log("SEO check: OK");
