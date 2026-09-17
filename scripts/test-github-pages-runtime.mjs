import { spawn } from "node:child_process";
import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, resolve, sep } from "node:path";

const host = "127.0.0.1";
const port = Number(process.env.STATIC_PREVIEW_PORT || 3100);
const basePath = "/prospecta-nicho";
const outputDir = resolve(process.cwd(), "out");
const specs = [
  "e2e/admin-static-auth.spec.ts",
  "e2e/github-pages-static.spec.ts",
  "e2e/public-request-edge.spec.ts",
  "e2e/request-status-static.spec.ts",
  "e2e/no-next-api-production.spec.ts",
];

const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".webp": "image/webp",
  ".woff2": "font/woff2",
  ".xml": "application/xml; charset=utf-8",
};

if (!existsSync(outputDir)) {
  throw new Error("Diretorio out ausente. Execute npm run export:github antes dos testes estaticos.");
}

function resolveStaticFile(pathname) {
  if (pathname !== basePath && !pathname.startsWith(`${basePath}/`)) {
    return null;
  }

  const relativePath = decodeURIComponent(pathname.slice(basePath.length)).replace(/^\/+/, "");
  let filePath = resolve(outputDir, relativePath || "index.html");
  if (filePath !== outputDir && !filePath.startsWith(`${outputDir}${sep}`)) {
    return null;
  }
  if (existsSync(filePath) && statSync(filePath).isDirectory()) {
    filePath = resolve(filePath, "index.html");
  }
  return existsSync(filePath) && statSync(filePath).isFile() ? filePath : null;
}

const server = createServer((request, response) => {
  const pathname = new URL(request.url || "/", `http://${host}:${port}`).pathname;
  const filePath = resolveStaticFile(pathname);
  if (!filePath) {
    response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    response.end("Not found");
    return;
  }

  response.writeHead(200, {
    "cache-control": "no-store",
    "content-type": contentTypes[extname(filePath)] || "application/octet-stream",
  });
  if (request.method === "HEAD") {
    response.end();
    return;
  }
  createReadStream(filePath).pipe(response);
});

await new Promise((resolveListen, rejectListen) => {
  server.once("error", rejectListen);
  server.listen(port, host, resolveListen);
});

const playwrightCli = resolve(process.cwd(), "node_modules", "@playwright", "test", "cli.js");
const child = spawn(process.execPath, [playwrightCli, "test", ...specs, "--project=desktop"], {
  env: {
    ...process.env,
    NEXT_PUBLIC_RUNTIME_TARGET: "github-pages",
    PLAYWRIGHT_BASE_URL: `http://${host}:${port}`,
  },
  stdio: "inherit",
});

const exitCode = await new Promise((resolveExit, rejectExit) => {
  child.once("error", rejectExit);
  child.once("exit", (code) => resolveExit(code ?? 1));
});

await new Promise((resolveClose) => server.close(resolveClose));
process.exitCode = exitCode;
