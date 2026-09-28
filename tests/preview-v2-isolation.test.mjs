import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

const previewFiles = [
  "app/preview/site-v2/page.tsx",
  "components/preview-v2/PreviewHeader.tsx",
  "components/preview-v2/PreviewModal.tsx",
  "components/preview-v2/PreviewSiteV2.tsx",
  "lib/preview-v2/mock-data.ts",
];

test("preview v2 remains isolated from real application endpoints", async () => {
  const source = (await Promise.all(previewFiles.map((file) => readFile(file, "utf8")))).join("\n");

  for (const forbidden of ["apiFetch(", "fetch(", "createClient(", "functions/v1", "SUPABASE_", "/api/"]) {
    assert.equal(source.includes(forbidden), false, `preview must not include ${forbidden}`);
  }
});

test("preview v2 clearly discloses its demonstrative state", async () => {
  const source = await readFile("components/preview-v2/PreviewSiteV2.tsx", "utf8");

  assert.match(source, /Versão visual de teste/);
  assert.match(source, /Sem integração com backend/);
  assert.match(source, /Nenhum dado é enviado/);
});
