import fs from "node:fs";
import crypto from "node:crypto";

const files = [
  "app/preview/site-v2/page.tsx",
  "components/preview-v2/PreviewSiteV2.tsx",
  "components/preview-v2/PreviewHeader.tsx",
  "components/preview-v2/PreviewModal.tsx",
  "components/preview-v2/preview-v2.module.css",
  "components/preview-v2/motion/PreviewMotion.tsx",
  "lib/preview-v2/mock-data.ts",
  "public/preview-v2/assets/logo-official-transparent.png",
  "public/preview-v2/assets/hero-national.webp",
  "public/preview-v2/assets/office-intelligence.webp",
  "public/preview-v2/assets/earth-network.webp",
  "public/preview-v2/assets/segment-agencias.webp",
  "public/preview-v2/assets/segment-contabilidades.webp",
  "public/preview-v2/assets/segment-energia-solar.webp",
  "public/preview-v2/assets/avatar-carlos.webp",
  "public/preview-v2/assets/avatar-patricia.webp",
  "public/preview-v2/assets/avatar-rafael.webp",
  "public/preview-v2/brazil-network.webp",
  "public/preview-v2/market-intelligence-office.webp",
  "e2e/preview-v2.spec.ts",
  "e2e/preview-v2.motion.spec.ts",
  "e2e/preview-v2.regression.spec.ts",
  "e2e/preview-v2.visual.spec.ts",
  "tests/preview-v2-isolation.test.mjs",
];

const lines = files.map((file) => {
  const buf = fs.readFileSync(file);
  const hash = crypto.createHash("sha256").update(buf).digest("hex");
  return `${hash}  ${file}`;
});

const targetFile = "artifacts/preview-v2/frozen/checksums.sha256";
fs.writeFileSync(targetFile, lines.join("\n") + "\n");
console.log(`Saved ${targetFile} with ${lines.length} entries`);
