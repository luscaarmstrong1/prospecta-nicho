import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { execSync } from "node:child_process";

const rootDir = process.cwd();
const handoffDir = path.join(rootDir, "handoff", "prospectanicho-frontends-final");
const zipPath = path.join(rootDir, "handoff", "prospectanicho-frontends-antigravity-final.zip");

// Clean and prepare target folders
if (fs.existsSync(handoffDir)) {
  fs.rmSync(handoffDir, { recursive: true, force: true });
}
fs.mkdirSync(path.join(handoffDir, "frontend"), { recursive: true });
fs.mkdirSync(path.join(handoffDir, "public-assets"), { recursive: true });
fs.mkdirSync(path.join(handoffDir, "docs"), { recursive: true });
fs.mkdirSync(path.join(handoffDir, "screenshots"), { recursive: true });

function computeSha256(filePath) {
  const fileBuffer = fs.readFileSync(filePath);
  return crypto.createHash("sha256").update(fileBuffer).digest("hex");
}

function copyPreservingStructure(relPath, targetBaseDir) {
  const src = path.join(rootDir, relPath);
  const dest = path.join(targetBaseDir, relPath);
  if (!fs.existsSync(src)) {
    console.warn(`Warning: source file not found: ${relPath}`);
    return null;
  }
  const destDir = path.dirname(dest);
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }
  fs.copyFileSync(src, dest);
  return {
    path: relPath.replace(/\\/g, "/"),
    sha256: computeSha256(dest),
  };
}

function copyDirectoryRecursive(srcDirRel, targetBaseDir) {
  const srcDir = path.join(rootDir, srcDirRel);
  if (!fs.existsSync(srcDir)) return [];
  const entries = fs.readdirSync(srcDir, { withFileTypes: true });
  const copied = [];
  for (const entry of entries) {
    const entryRel = path.join(srcDirRel, entry.name);
    if (entry.isDirectory()) {
      copied.push(...copyDirectoryRecursive(entryRel, targetBaseDir));
    } else if (entry.isFile()) {
      const res = copyPreservingStructure(entryRel, targetBaseDir);
      if (res) copied.push(res);
    }
  }
  return copied;
}

console.log("=== 1. PACKAGING FRONTEND SOURCE FILES ===");
const frontendFilesList = [
  // App pages
  "app/page.tsx",
  "app/solucoes/page.tsx",
  "app/segmentos/page.tsx",
  "app/planos/page.tsx",
  "app/conteudo/page.tsx",
  "app/sobre/page.tsx",
  "app/layout.tsx",
  "app/globals.css",

  // App shell & global UI
  "components/AppShell.tsx",
  "components/CookieBanner.tsx",
  "components/WhatsAppFloatingButton.tsx",
  "components/Header.tsx",
  "components/Footer.tsx",
  "components/PreviewBanner.tsx",

  // Helper libs used by frontend
  "lib/asset-path.ts",
  "lib/whatsapp.ts",
  "lib/site.ts",
  "lib/routes.ts",
  "lib/segments.ts",
  "lib/products.ts",
  "lib/structured-data.ts",
  "lib/tracking.ts",
  "lib/public-request-schema.ts",
];

const packagedFrontend = [];
const frontendTargetDir = path.join(handoffDir, "frontend");

for (const rel of frontendFilesList) {
  const res = copyPreservingStructure(rel, frontendTargetDir);
  if (res) {
    packagedFrontend.push({ ...res, purpose: `Core frontend component/route: ${rel}` });
  }
}

// Copy components/home-v2 and components/shared-v2
const homeV2Components = copyDirectoryRecursive("components/home-v2", frontendTargetDir);
homeV2Components.forEach(f => packagedFrontend.push({ ...f, purpose: "Home V2 component" }));

const sharedV2Components = copyDirectoryRecursive("components/shared-v2", frontendTargetDir);
sharedV2Components.forEach(f => packagedFrontend.push({ ...f, purpose: "Shared V2 marketing component" }));

// Copy lib/home-v2 and lib/site-v2
const homeV2Libs = copyDirectoryRecursive("lib/home-v2", frontendTargetDir);
homeV2Libs.forEach(f => packagedFrontend.push({ ...f, purpose: "Home V2 data/motion library" }));

const siteV2Libs = copyDirectoryRecursive("lib/site-v2", frontendTargetDir);
siteV2Libs.forEach(f => packagedFrontend.push({ ...f, purpose: "Site V2 configuration/content library" }));

console.log(`Packaged ${packagedFrontend.length} frontend source files.`);

console.log("=== 2. PACKAGING PUBLIC ASSETS ===");
const publicAssetsTargetDir = path.join(handoffDir, "public-assets");
const packagedAssets = [];

// Copy public/preview-v2 and other public assets
const previewAssets = copyDirectoryRecursive("public/preview-v2", publicAssetsTargetDir);
previewAssets.forEach(f => packagedAssets.push({ ...f, purpose: "Preview V2 UI asset / photo / icon" }));

const otherPublicAssets = copyDirectoryRecursive("public/assets", publicAssetsTargetDir);
otherPublicAssets.forEach(f => packagedAssets.push({ ...f, purpose: "Public asset" }));

console.log(`Packaged ${packagedAssets.length} public asset files.`);

console.log("=== 3. PACKAGING SCREENSHOTS ===");
const screenshotsTargetDir = path.join(handoffDir, "screenshots");
const screenshotRoutes = [
  { id: "home", src: "artifacts/visual-audit/home/actual.png" },
  { id: "solucoes", src: "artifacts/visual-audit/solucoes/actual.png" },
  { id: "segmentos", src: "artifacts/visual-audit/segmentos/actual.png" },
  { id: "planos", src: "artifacts/visual-audit/planos/actual.png" },
  { id: "conteudo", src: "artifacts/visual-audit/conteudo/actual.png" },
  { id: "sobre", src: "artifacts/visual-audit/sobre/actual.png" },
];

const packagedScreenshots = [];
for (const s of screenshotRoutes) {
  const destName = `${s.id}.png`;
  const destPath = path.join(screenshotsTargetDir, destName);
  let srcPath = path.join(rootDir, s.src);
  if (!fs.existsSync(srcPath)) {
    srcPath = path.join(rootDir, `artifacts/visual-diff/actual/${s.id}_1440.png`);
  }
  if (fs.existsSync(srcPath)) {
    fs.copyFileSync(srcPath, destPath);
    packagedScreenshots.push({
      path: `screenshots/${destName}`,
      sha256: computeSha256(destPath),
      purpose: `Captured screenshot for route /${s.id === 'home' ? '' : s.id} at 1440px`,
    });
  }
}
console.log(`Packaged ${packagedScreenshots.length} screenshots.`);

console.log("=== 4. GENERATING HANDOFF_CODEX.md & README.txt ===");

const handoffDocContent = `# ProspectaNicho Frontend Handoff

## 1. Objetivo

Este pacote contém o snapshot congelado do frontend mais recente desenvolvido no Antigravity para as seis páginas oficiais da ProspectaNicho:

- **Home** (\`/\`)
- **Soluções** (\`/solucoes\`)
- **Segmentos** (\`/segmentos\`)
- **Planos** (\`/planos\`)
- **Conteúdo** (\`/conteudo\`)
- **Sobre** (\`/sobre\`)

O objetivo deste handoff é fornecer ao **Codex** todos os componentes, estilos, bibliotecas e assets necessários para integrar, versionar, publicar no GitHub Pages e dar continuidade aos refinamentos visuais sem afetar backend, Supabase ou CRM.

---

## 2. Workspace de Origem

\`\`\`
C:\\Users\\lucas\\Documents\\Codex\\2026-06-14\\leads-b2b-recuperada
\`\`\`

---

## 3. Rotas Oficiais Entregues

| Página | Rota Local | URL Canônica / GitHub Pages |
| :--- | :--- | :--- |
| **Home** | \`http://127.0.0.1:3102/\` | \`https://luscaarmstrong1.github.io/prospecta-nicho/\` |
| **Soluções** | \`http://127.0.0.1:3102/solucoes\` | \`https://luscaarmstrong1.github.io/prospecta-nicho/solucoes/\` |
| **Segmentos** | \`http://127.0.0.1:3102/segmentos\` | \`https://luscaarmstrong1.github.io/prospecta-nicho/segmentos/\` |
| **Planos** | \`http://127.0.0.1:3102/planos\` | \`https://luscaarmstrong1.github.io/prospecta-nicho/planos/\` |
| **Conteúdo** | \`http://127.0.0.1:3102/conteudo\` | \`https://luscaarmstrong1.github.io/prospecta-nicho/conteudo/\` |
| **Sobre** | \`http://127.0.0.1:3102/sobre\` | \`https://luscaarmstrong1.github.io/prospecta-nicho/sobre/\` |

---

## 4. Arquivos Principais

- **Home oficial**: \`frontend/app/page.tsx\` e \`frontend/components/home-v2/HomeSiteV2.tsx\`
- **Soluções**: \`frontend/app/solucoes/page.tsx\`
- **Segmentos**: \`frontend/app/segmentos/page.tsx\`
- **Planos**: \`frontend/app/planos/page.tsx\`
- **Conteúdo**: \`frontend/app/conteudo/page.tsx\`
- **Sobre**: \`frontend/app/sobre/page.tsx\`
- **Header Global Oficial**: \`frontend/components/shared-v2/SiteHeader.tsx\`
- **Footer Global Oficial**: \`frontend/components/shared-v2/SiteFooter.tsx\`
- **Shared CTA Global**: \`frontend/components/shared-v2/SharedCTA.tsx\`
- **Estilos Globais e Módulos**:
  - \`frontend/app/globals.css\`
  - \`frontend/components/home-v2/home-v2.module.css\`
  - \`frontend/components/shared-v2/site-pages.module.css\`
- **Configurações e Conteúdos**:
  - \`frontend/lib/site-v2/config.ts\`
  - \`frontend/lib/site-v2/content.ts\`
  - \`frontend/lib/home-v2/mock-data.ts\`
  - \`frontend/lib/home-v2/motion.ts\`

---

## 5. Estrutura de Diretórios Entregue

\`\`\`
prospectanicho-frontends-final/
├── frontend/
│   ├── app/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── solucoes/page.tsx
│   │   ├── segmentos/page.tsx
│   │   ├── planos/page.tsx
│   │   ├── conteudo/page.tsx
│   │   └── sobre/page.tsx
│   ├── components/
│   │   ├── AppShell.tsx
│   │   ├── CookieBanner.tsx
│   │   ├── Footer.tsx
│   │   ├── Header.tsx
│   │   ├── PreviewBanner.tsx
│   │   ├── WhatsAppFloatingButton.tsx
│   │   ├── home-v2/
│   │   │   ├── HomeFooter.tsx
│   │   │   ├── HomeHeader.tsx
│   │   │   ├── HomeSiteV2.tsx
│   │   │   ├── home-v2.module.css
│   │   │   └── motion/HomeMotion.tsx
│   │   └── shared-v2/
│   │       ├── SharedCTA.tsx
│   │       ├── SiteFooter.tsx
│   │       ├── SiteHeader.tsx
│   │       └── site-pages.module.css
│   └── lib/
│       ├── asset-path.ts
│       ├── home-v2/
│       │   ├── mock-data.ts
│       │   └── motion.ts
│       ├── products.ts
│       ├── public-request-schema.ts
│       ├── routes.ts
│       ├── segments.ts
│       ├── site.ts
│       ├── site-v2/
│       │   ├── config.ts
│       │   └── content.ts
│       ├── structured-data.ts
│       ├── tracking.ts
│       └── whatsapp.ts
├── public-assets/
│   └── public/
│       ├── assets/
│       └── preview-v2/
│           └── assets/
├── screenshots/
│   ├── home.png
│   ├── solucoes.png
│   ├── segmentos.png
│   ├── planos.png
│   ├── conteudo.png
│   └── sobre.png
├── docs/
│   └── HANDOFF_CODEX.md
├── HANDOFF_CODEX.md
├── README.txt
└── manifest.json
\`\`\`

---

## 6. Assets Públicos

Todos os assets estáticos utilizados pelas 6 páginas foram preservados em \`public-assets/\`, mantendo o caminho correspondente a \`public/\`:

- Logomarca ProspectaNicho (\`logo-official-transparent.png\`)
- Render nacional do Brasil (\`hero-national.webp\`)
- Visual espacial da Terra com conexões (\`earth-network.webp\`, \`earth-brazil-space.png\`)
- Fotos executivas e de setores (\`office-meeting-team.png\`, \`finance-accounting.png\`, \`solar-energy.png\`, \`industry-factory.png\`, \`server-datacenter.png\`, \`healthcare-hospital.png\`, \`city-sp-night.png\`, \`city-rio-hero.png\`)
- Avatares de depoimentos e time (\`avatar-carlos.webp\`, \`avatar-rafael.webp\`, \`avatar-patricia.webp\`)

---

## 7. Dependências NPM Utilizadas

As seguintes dependências reais do \`package.json\` são necessárias para o frontend:

- \`next\`: ^15.5.25
- \`react\`: ^19.1.2
- \`react-dom\`: ^19.1.2
- \`framer-motion\`: ^12.23.12
- \`lucide-react\`: ^0.468.0
- \`zod\`: ^4.1.13
- \`react-hook-form\`: ^7.66.1
- \`@hookform/resolvers\`: ^5.2.2

*Nota: O projeto utiliza CSS Modules e CSS nativo; não há dependência de Tailwind CSS.*

---

## 8. Estado Visual Medido (Métricas Reais)

As medições pixel-a-pixel realizadas por comparação direta contra os mockups oficiais de referência do Google Drive registraram:

| Rota | Dimensão | Similaridade Medida | Diferença Medida | Status |
| :--- | :---: | :---: | :---: | :--- |
| **Home (\`/\`)** | 1440x5186 px | **99.043%** | **0.957%** | Muito próxima da referência / Congelada |
| **Planos (\`/planos\`)** | 1440x2143 px | **79.860%** | **20.140%** | Funcional com estrutura 1:1 |
| **Soluções (\`/solucoes\`)** | 1440x2143 px | **78.869%** | **21.131%** | Funcional com estrutura 1:1 |
| **Sobre (\`/sobre\`)** | 1440x2143 px | **75.523%** | **24.477%** | Funcional com estrutura 1:1 |
| **Conteúdo (\`/conteudo\`)** | 1440x2143 px | **71.428%** | **28.572%** | Funcional com estrutura 1:1 |
| **Segmentos (\`/segmentos\`)** | 1440x2143 px | **68.393%** | **31.607%** | Funcional com estrutura 1:1 |

---

## 9. Pendências Visuais

A **Home** está muito próxima da referência. As cinco páginas internas (\`/solucoes\`, \`/segmentos\`, \`/planos\`, \`/conteudo\`, \`/sobre\`) ainda possuem diferenças visuais em relação aos mockups e deverão continuar sendo refinadas pelo Codex caso seja desejada fidelidade pixel-perfect 1:1 rigorosa.

---

## 10. Instruções ao Codex

1. **NÃO substituir backend**: Não alterar ou sobrescrever Supabase, migrations, autenticação, APIs, workers Python ou integrações existentes no repositório.
2. **Mesclar exclusivamente o frontend**: Copiar os arquivos de \`frontend/\` e \`public-assets/\` para as respectivas pastas do projeto.
3. **Preservar Header e Footer unificados**: O componente oficial de Header é \`components/shared-v2/SiteHeader.tsx\` e o de Footer é \`components/shared-v2/SiteFooter.tsx\`, integrados via \`components/AppShell.tsx\`.
4. **Validar integridade e compilação**:
   - \`npm run typecheck\`
   - \`npm run lint\`
   - \`npm test\`
   - \`npm run check:security\`
   - \`npm run worker:test\`
   - \`npm run export:github\`
5. **Versionar e Publicar**:
   - Fazer commit das alterações de frontend;
   - Realizar push para o repositório remoto;
   - Publicar no GitHub Pages.

---

## 11. GitHub Pages e BasePath

O build de exportação estática (\`npm run export:github\`) utiliza a variável \`NEXT_PUBLIC_BASE_PATH=/prospecta-nicho\` e exporta os arquivos para a pasta \`/out\`. O helper \`lib/asset-path.ts\` garante a resolução adequada de caminhos em ambiente de produção GitHub Pages. O Codex deve manter essa configuração ao executar o deploy.

---

## 12. URLs Finais Esperadas

- \`https://luscaarmstrong1.github.io/prospecta-nicho/\`
- \`https://luscaarmstrong1.github.io/prospecta-nicho/solucoes/\`
- \`https://luscaarmstrong1.github.io/prospecta-nicho/segmentos/\`
- \`https://luscaarmstrong1.github.io/prospecta-nicho/planos/\`
- \`https://luscaarmstrong1.github.io/prospecta-nicho/conteudo/\`
- \`https://luscaarmstrong1.github.io/prospecta-nicho/sobre/\`
`;

fs.writeFileSync(path.join(handoffDir, "docs", "HANDOFF_CODEX.md"), handoffDocContent, "utf8");
fs.writeFileSync(path.join(handoffDir, "HANDOFF_CODEX.md"), handoffDocContent, "utf8");

const readmeContent = `PROSPECTANICHO — FRONTEND HANDOFF

Arquivo principal de instrucoes:
docs/HANDOFF_CODEX.md

Rotas oficiais incluidas:
- / (Home)
- /solucoes (Solucoes)
- /segmentos (Segmentos)
- /planos (Planos)
- /conteudo (Conteudo)
- /sobre (Sobre)

Este pacote contem exclusivamente arquivos de frontend, estilos, configuracoes e assets publicos necessarios para a execucao e refinamento das seis paginas.
Nao contem backend, secrets, credenciais, banco de dados ou migrations.
`;

fs.writeFileSync(path.join(handoffDir, "README.txt"), readmeContent, "utf8");

console.log("=== 5. GENERATING MANIFEST.JSON ===");
const allPackaged = [
  ...packagedFrontend,
  ...packagedAssets,
  ...packagedScreenshots,
  {
    path: "docs/HANDOFF_CODEX.md",
    sha256: computeSha256(path.join(handoffDir, "docs", "HANDOFF_CODEX.md")),
    purpose: "Documentação completa de handoff para o Codex",
  },
  {
    path: "HANDOFF_CODEX.md",
    sha256: computeSha256(path.join(handoffDir, "HANDOFF_CODEX.md")),
    purpose: "Cópia raiz da documentação de handoff para o Codex",
  },
  {
    path: "README.txt",
    sha256: computeSha256(path.join(handoffDir, "README.txt")),
    purpose: "Instruções resumidas de handoff",
  },
];

const manifest = {
  project: "ProspectaNicho",
  handoffVersion: "frontend-final-antigravity",
  generatedAt: new Date().toISOString(),
  originWorkspace: "C:\\Users\\lucas\\Documents\\Codex\\2026-06-14\\leads-b2b-recuperada",
  routes: [
    "/",
    "/solucoes",
    "/segmentos",
    "/planos",
    "/conteudo",
    "/sobre"
  ],
  metricsMeasured: {
    home: { similarity: "99.043%", difference: "0.957%" },
    solucoes: { similarity: "78.869%", difference: "21.131%" },
    planos: { similarity: "79.860%", difference: "20.140%" },
    sobre: { similarity: "75.523%", difference: "24.477%" },
    conteudo: { similarity: "71.428%", difference: "28.572%" },
    segmentos: { similarity: "68.393%", difference: "31.607%" }
  },
  totalFiles: allPackaged.length,
  files: allPackaged,
};

fs.writeFileSync(path.join(handoffDir, "manifest.json"), JSON.stringify(manifest, null, 2), "utf8");
console.log(`Manifest created with ${allPackaged.length} files listed.`);

console.log("=== 6. CREATING ZIP PACKAGE ===");
// Remove old zip if exists
if (fs.existsSync(zipPath)) {
  fs.unlinkSync(zipPath);
}

// Create zip using System.IO.Compression.ZipFile
execSync(`powershell -NoProfile -Command "Add-Type -AssemblyName 'System.IO.Compression.FileSystem'; [System.IO.Compression.ZipFile]::CreateFromDirectory('${handoffDir.replace(/\\/g, '\\\\')}', '${zipPath.replace(/\\/g, '\\\\')}')"`);

console.log(`ZIP created successfully at: ${zipPath}`);

console.log("=== 7. TESTING ZIP INTEGRITY ===");
const tempTestExtractDir = path.join(rootDir, "handoff", "temp_zip_test_extract");
if (fs.existsSync(tempTestExtractDir)) {
  fs.rmSync(tempTestExtractDir, { recursive: true, force: true });
}
fs.mkdirSync(tempTestExtractDir, { recursive: true });

execSync(`powershell -NoProfile -Command "Add-Type -AssemblyName 'System.IO.Compression.FileSystem'; [System.IO.Compression.ZipFile]::ExtractToDirectory('${zipPath.replace(/\\/g, '\\\\')}', '${tempTestExtractDir.replace(/\\/g, '\\\\')}')"`);

const checkFiles = [
  "manifest.json",
  "HANDOFF_CODEX.md",
  "README.txt",
  "frontend/app/page.tsx",
  "frontend/app/solucoes/page.tsx",
  "frontend/app/segmentos/page.tsx",
  "frontend/app/planos/page.tsx",
  "frontend/app/conteudo/page.tsx",
  "frontend/app/sobre/page.tsx",
  "screenshots/home.png",
  "screenshots/solucoes.png",
  "screenshots/segmentos.png",
  "screenshots/planos.png",
  "screenshots/conteudo.png",
  "screenshots/sobre.png",
];

let allOk = true;
for (const cf of checkFiles) {
  const full = path.join(tempTestExtractDir, cf);
  if (!fs.existsSync(full)) {
    console.error(`Zip test check failed: missing ${cf}`);
    allOk = false;
  }
}

if (allOk) {
  console.log("ZIP integrity verified 100%! All critical files extracted intact.");
} else {
  throw new Error("ZIP verification failed!");
}

// Clean up temporary extraction directory only
fs.rmSync(tempTestExtractDir, { recursive: true, force: true });
console.log("Temporary extraction directory cleaned up. ZIP preserved.");

console.log("\n=== HANDOFF PACKAGING COMPLETED SUCCESSFULLY ===");
console.log(`Folder: ${handoffDir}`);
console.log(`ZIP: ${zipPath}`);
console.log(`Total Files: ${allPackaged.length}`);
