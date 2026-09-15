import { spawnSync } from "node:child_process";
import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";

function listRouteFiles(dir) {
  return readdirSync(dir).flatMap((entry) => {
    const fullPath = join(dir, entry);
    const stats = statSync(fullPath);

    if (stats.isDirectory()) {
      return listRouteFiles(fullPath);
    }

    return entry === "route.ts" ? [fullPath] : [];
  });
}

function prepareStaticApiRoutes() {
  const originals = [];

  for (const routeFile of listRouteFiles("app/api")) {
    const source = readFileSync(routeFile, "utf8");
    const staticSource = source.replaceAll("force-dynamic", "force-static");

    if (staticSource !== source) {
      originals.push([routeFile, source]);
      writeFileSync(routeFile, staticSource, "utf8");
    }
  }

  return () => {
    for (const [routeFile, source] of originals) {
      writeFileSync(routeFile, source, "utf8");
    }
  };
}

const env = {
  ...process.env,
  DEPLOY_TARGET: "github-pages",
  NEXT_PUBLIC_RUNTIME_TARGET: "github-pages",
  NEXT_PUBLIC_STATIC_EXPORT: "true",
  NEXT_PUBLIC_ALLOW_GITHUB_PAGES: "true",
  NEXT_PUBLIC_BASE_PATH: process.env.NEXT_PUBLIC_BASE_PATH || "/prospecta-nicho",
  NEXT_PUBLIC_SITE_URL:
    process.env.NEXT_PUBLIC_SITE_URL || "https://luscaarmstrong1.github.io/prospecta-nicho",
};

const restoreApiRoutes = prepareStaticApiRoutes();
let result;

try {
  result = spawnSync(process.execPath, ["node_modules/next/dist/bin/next", "build"], {
    env,
    stdio: "inherit",
  });
} finally {
  restoreApiRoutes();
}

process.exit(result.status ?? 1);
