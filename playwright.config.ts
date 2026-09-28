import { defineConfig, devices } from "@playwright/test";

const baseURL = process.env.PLAYWRIGHT_BASE_URL || "http://127.0.0.1:3100";
const webServerCommand =
  process.env.PLAYWRIGHT_WEB_SERVER_COMMAND ||
  "node node_modules/next/dist/bin/next dev --hostname 127.0.0.1 --port 3100";

export default defineConfig({
  testDir: "./e2e",
  outputDir: "artifacts/visual-qc",
  timeout: 30_000,
  fullyParallel: false,
  workers: Number(process.env.PLAYWRIGHT_WORKERS || 1),
  retries: 0,
  use: {
    baseURL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  webServer: process.env.PLAYWRIGHT_BASE_URL
    ? undefined
    : {
        command: webServerCommand,
        env: {
          ...process.env,
          ADMIN_API_TOKEN: process.env.ADMIN_API_TOKEN || "playwright-admin-token",
          ENABLE_BREAK_GLASS_ADMIN: "true",
          ENABLE_ADMIN_TOKEN_LOGIN: "true",
          NEXT_PUBLIC_ENABLE_ADMIN_TOKEN_LOGIN: "true",
        },
        url: baseURL,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      },
  projects: [
    {
      name: "desktop",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } },
    },
    {
      name: "desktop-wide",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1920, height: 1080 } },
    },
    {
      name: "mobile-390",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 390, height: 844 },
        isMobile: true,
        hasTouch: true,
      },
    },
    {
      name: "mobile-430",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 430, height: 932 },
        isMobile: true,
        hasTouch: true,
      },
    },
    {
      name: "tablet",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1024, height: 1366 },
        isMobile: true,
        hasTouch: true,
      },
    },
  ],
});
