import { readFileSync } from "node:fs";

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
  workflow.includes("peaceiris/actions-gh-pages@v3") &&
  workflow.includes("publish_dir: ./out") &&
  workflow.includes("publish_branch: gh-pages") &&
  workflow.includes("NEXT_PUBLIC_SUPABASE_URL") &&
  !workflow.includes("environment: github-pages") &&
  !workflow.includes("SUPABASE_SERVICE_ROLE_KEY");

console.log(
  JSON.stringify(
    {
      ok: missingBlocks.length === 0 && leakedFrontendSecrets.length === 0 && workflowOk,
      message: "Campos sensiveis permanecem bloqueados no export padrao e segredos privados ficam fora do frontend.",
      blocked: prohibitedDefaultFields,
      missingBlocks,
      leakedFrontendSecrets,
      workflowOk,
    },
    null,
    2,
  ),
);

if (missingBlocks.length || leakedFrontendSecrets.length || !workflowOk) {
  process.exitCode = 1;
}
