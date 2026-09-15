import { spawnSync } from "node:child_process";

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

const result = spawnSync(process.execPath, ["node_modules/next/dist/bin/next", "build"], {
  env,
  stdio: "inherit",
});

process.exit(result.status ?? 1);
