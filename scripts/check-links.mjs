import { readFileSync } from "node:fs";
import { join } from "node:path";
import { publicRoutes } from "../lib/routes.ts";

const roots = ["app", "components", "lib"];
const normalizeRoute = (route) => route === "/" ? route : route.replace(/\/+$/, "");
const localRouteSet = new Set(publicRoutes.map(normalizeRoute));
const failures = [];

async function* walk(dir) {
  const { readdir } = await import("node:fs/promises");
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(path);
    if (entry.isFile() && /\.(ts|tsx)$/.test(entry.name)) yield path;
  }
}

for (const root of roots) {
  for await (const file of walk(join(process.cwd(), root))) {
    const text = readFileSync(file, "utf8");
    for (const match of text.matchAll(/href=["'`]([^"'`]+)["'`]/g)) {
      const href = match[1];
      if (!href || href === "#") failures.push(`${file}: link vazio`);
      if (/localhost|127\.0\.0\.1|:3000|:3001|javascript:/i.test(href)) failures.push(`${file}: link proibido ${href}`);
      const routeOnly = normalizeRoute(href.split("?")[0].split("#")[0]);
      if (routeOnly.startsWith("/") && !routeOnly.includes("[") && !localRouteSet.has(routeOnly) && !routeOnly.startsWith("/admin")) {
        failures.push(`${file}: rota não catalogada ${href}`);
      }
    }
  }
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log("Links check: OK");
