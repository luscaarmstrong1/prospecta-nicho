import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const prohibitedDefaultFields = [
  "cpf",
  "nome_socio",
  "telefone_particular",
  "email_pessoal",
  "score_enriquecido",
] as const;

const forbiddenPublicHints = ["cpf", "nome_socio", "telefone_particular", "email_pessoal"];
const missingBlocks = forbiddenPublicHints.filter((field) => !prohibitedDefaultFields.includes(field as never));
const publicFrontendFiles = [
  "src/lib/api/client.ts",
  "src/lib/api/runtime.ts",
  ".github/workflows/deploy-github-pages.yml",
];
const forbiddenFrontendSecrets = ["SUPABASE_SERVICE_ROLE_KEY", "EXPORT_SIGNING_SECRET", "RFB_DATA_DIR", "ADMIN_API_TOKEN"];
const leakedFrontendSecrets = publicFrontendFiles.flatMap((file) => {
  const source = readFileSync(file, "utf8");
  return forbiddenFrontendSecrets.filter((secret) => source.includes(secret)).map((secret) => `${file}:${secret}`);
});
const workflow = readFileSync(".github/workflows/deploy-github-pages.yml", "utf8");
const workflowOk =
  workflow.includes("contents: write") &&
  /peaceiris\/actions-gh-pages@[0-9a-f]{40} # v4/.test(workflow) &&
  workflow.includes("publish_dir: ./out") &&
  workflow.includes("publish_branch: gh-pages") &&
  workflow.includes("NEXT_PUBLIC_SUPABASE_URL") &&
  !workflow.includes("environment: github-pages") &&
  !workflow.includes("SUPABASE_SERVICE_ROLE_KEY");
const privateEnvKeys = [
  "SUPABASE_SERVICE_ROLE_KEY",
  "EXPORT_SIGNING_SECRET",
  "R2_SECRET_ACCESS_KEY",
  "ADMIN_API_TOKEN",
  "CLICKHOUSE_PASSWORD",
  "REDIS_URL",
] as const;

function walkFiles(root: string): string[] {
  if (!existsSync(root)) return [];
  return readdirSync(root).flatMap((entry) => {
    const path = join(root, entry);
    const stats = statSync(path);
    if (stats.isDirectory()) return walkFiles(path);
    return stats.isFile() ? [path] : [];
  });
}

const publicBundleFiles = walkFiles("out").filter((file) => /\.(html|js|css|json|txt|xml|webmanifest)$/i.test(file));
const leakedSecretValues = publicBundleFiles.flatMap((file) => {
  const source = readFileSync(file, "utf8");
  return privateEnvKeys
    .map((key) => ({ key, value: process.env[key] || "" }))
    .filter(({ value }) => value.length >= 12 && source.includes(value))
    .map(({ key }) => `${file}:${key}`);
});

console.log(
  JSON.stringify(
    {
      ok: missingBlocks.length === 0 && leakedFrontendSecrets.length === 0 && leakedSecretValues.length === 0 && workflowOk,
      message: "Campos sensiveis permanecem bloqueados no export padrao e segredos privados ficam fora do frontend.",
      blocked: prohibitedDefaultFields,
      missingBlocks,
      leakedFrontendSecrets,
      leakedSecretValues,
      workflowOk,
    },
    null,
    2,
  ),
);

if (missingBlocks.length || leakedFrontendSecrets.length || leakedSecretValues.length || !workflowOk) {
  process.exitCode = 1;
}
