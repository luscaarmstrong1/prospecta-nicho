import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
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

function listFilesFromDisk(root) {
  if (!existsSync(root)) return [];
  const files = [];
  const stack = [root];
  while (stack.length) {
    const current = stack.pop();
    if (!current) continue;
    const relativeParts = current.split(/[\\/]/);
    if (relativeParts.some((part) => ignored.has(part))) continue;
    const stats = statSync(current);
    if (stats.isDirectory()) {
      for (const entry of readdirSync(current)) {
        stack.push(join(current, entry));
      }
      continue;
    }
    if (extensions.test(current)) files.push(current.replaceAll("\\", "/"));
  }
  return files;
}

function listFiles(root) {
  try {
    const output = execFileSync("git", ["ls-files", root], { encoding: "utf8" });
    return output.split(/\r?\n/).filter(Boolean).filter((file) => extensions.test(file));
  } catch {
    return listFilesFromDisk(root);
  }
}

let failures = [];
for (const root of roots) {
  for (const file of listFiles(root)) {
    if (file.split(/[\\/]/).some((part) => ignored.has(part))) continue;
    const absolutePath = join(process.cwd(), file);
    if (!existsSync(absolutePath)) continue;
    const text = readFileSync(absolutePath, "utf8");
    const searchable = text
      .split(/\r?\n/)
      .filter((line) =>
        !line.includes("checkoutLinkEnvKey") &&
        !line.includes("id:") &&
        !line.includes("href:") &&
        !line.includes("Href:") &&
        !line.includes("NEXT_PUBLIC_") &&
        !line.includes("/assets/") &&
        !line.includes("slug:") &&
        !line.includes("comunicacao-visual") &&
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
