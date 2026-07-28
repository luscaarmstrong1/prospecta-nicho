import { readFileSync } from "node:fs";
import { join } from "node:path";
import { execFileSync } from "node:child_process";

const roots = ["app", "components", "lib", "docs"];
const extensions = /\.(ts|tsx|md)$/;
const ignored = new Set(["node_modules", ".next", "public", "work", "artifacts"]);

const forbidden = [
  ["publico", "público"],
  ["prospeccao", "prospecção"],
  ["operacao", "operação"],
  ["criterios", "critérios"],
  ["validacao", "validação"],
  ["regiao", "região"],
  ["voce", "você"],
  ["generica", "genérica"],
  ["obrigatoria", "obrigatória"],
  ["cartao", "cartão"],
  ["duvidas", "dúvidas"],
  ["recem", "recém"],
  ["contabil", "contábil"],
  ["comunicacao", "comunicação"],
  ["negocios", "negócios"],
  ["estetica", "estética"],
  ["alimentacao", "alimentação"],
  ["proxima", "próxima"],
];

function listFiles(root) {
  const output = execFileSync("git", ["ls-files", root], { encoding: "utf8" });
  return output.split(/\r?\n/).filter(Boolean).filter((file) => extensions.test(file));
}

let failures = [];
for (const root of roots) {
  for (const file of listFiles(root)) {
    if (file.split(/[\\/]/).some((part) => ignored.has(part))) continue;
    const text = readFileSync(join(process.cwd(), file), "utf8");
    const searchable = text
      .split(/\r?\n/)
      .filter((line) =>
        !line.includes("checkoutLinkEnvKey") &&
        !line.includes("id:") &&
        !line.includes("NEXT_PUBLIC_") &&
        !line.includes("/assets/") &&
        !line.includes("slug:") &&
        !line.includes("empresas-recem-abertas")
      )
      .join("\n");
    const lower = searchable.toLowerCase();
    for (const [bad, good] of forbidden) {
      const pattern = new RegExp(`(^|[^\\p{L}])${bad}([^\\p{L}]|$)`, "iu");
      if (pattern.test(lower)) failures.push(`${file}: use "${good}" em vez de "${bad}" em texto público`);
    }
  }
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log("Spellcheck pt-BR: OK");
