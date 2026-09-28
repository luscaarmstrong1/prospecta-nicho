import { spawnSync } from "node:child_process";
import { existsSync, readdirSync, renameSync, rmSync, statSync } from "node:fs";
import { join } from "node:path";

function listFilesMatching(dir, predicate) {
  return readdirSync(dir).flatMap((entry) => {
    const fullPath = join(dir, entry);
    const stats = statSync(fullPath);

    if (stats.isDirectory()) {
      return listFilesMatching(fullPath, predicate);
    }

    return predicate(entry, fullPath) ? [fullPath] : [];
  });
}

function listRouteFiles(dir) {
  return listFilesMatching(dir, (entry) => entry === "route.ts");
}

function restoreInterruptedApiRoutes() {
  for (const disabledRouteFile of listFilesMatching("app/api", (entry) =>
    entry.endsWith(".static-export-disabled"),
  )) {
    const routeFile = disabledRouteFile.replace(/\.static-export-disabled$/, "");

    if (!existsSync(routeFile)) {
      renameSync(disabledRouteFile, routeFile);
    }
  }
}

function prepareStaticApiRoutes() {
  const originals = [];

  restoreInterruptedApiRoutes();

  for (const routeFile of listRouteFiles("app/api")) {
    const disabledRouteFile = `${routeFile}.static-export-disabled`;
    renameSync(routeFile, disabledRouteFile);
    originals.push([disabledRouteFile, routeFile]);
  }

  return () => {
    for (const [disabledRouteFile, routeFile] of originals) {
      renameSync(disabledRouteFile, routeFile);
    }
  };
}

function isLocalOrBlockedUrl(value) {
  if (!value) {
    return true;
  }

  try {
    const url = new URL(value);
    return ["localhost", "127.0.0.1", "0.0.0.0"].includes(url.hostname) || url.port === "9";
  } catch {
    return true;
  }
}

function publicUrlForStaticExport(key, fallback) {
  const value = process.env[key];
  return isLocalOrBlockedUrl(value) ? fallback : value;
}

const env = {
  ...process.env,
  DEPLOY_TARGET: "github-pages",
  NEXT_PUBLIC_RUNTIME_TARGET: "github-pages",
  NEXT_PUBLIC_STATIC_EXPORT: "true",
  NEXT_STATIC_EXPORT_WORKER_THREADS:
    process.platform === "win32" && process.env.CI !== "true" ? "true" : "false",
  NEXT_PUBLIC_ALLOW_GITHUB_PAGES: "true",
  NEXT_PUBLIC_BASE_PATH: process.env.NEXT_PUBLIC_BASE_PATH || "/prospecta-nicho",
  NEXT_PUBLIC_SITE_URL:
    process.env.NEXT_PUBLIC_SITE_URL || "https://luscaarmstrong1.github.io/prospecta-nicho",
  NEXT_PUBLIC_SUPABASE_URL: publicUrlForStaticExport(
    "NEXT_PUBLIC_SUPABASE_URL",
    "https://static-export.supabase.co",
  ),
  NEXT_PUBLIC_SUPABASE_FUNCTIONS_URL: publicUrlForStaticExport(
    "NEXT_PUBLIC_SUPABASE_FUNCTIONS_URL",
    "https://static-export.supabase.co/functions/v1",
  ),
};

const restoreApiRoutes = prepareStaticApiRoutes();
let result;

function exitAfterRestore(code) {
  restoreApiRoutes();
  process.exit(code);
}

process.once("SIGINT", () => exitAfterRestore(130));
process.once("SIGTERM", () => exitAfterRestore(143));

try {
  rmSync("out", { recursive: true, force: true });
  const nextBuildArgs = ["node_modules/next/dist/bin/next", "build"];

  if (env.NEXT_STATIC_EXPORT_WORKER_THREADS === "true") {
    nextBuildArgs.unshift(
      "--require",
      join(process.cwd(), "scripts/next-static-export-thread-bridge.cjs"),
    );
  }

  result = spawnSync(process.execPath, nextBuildArgs, {
    env,
    stdio: "inherit",
  });
} finally {
  restoreApiRoutes();
}

process.exit(result.status ?? 1);
