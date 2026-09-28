import { spawn } from "node:child_process";
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { chromium } from "@playwright/test";

const outputDir = join(process.cwd(), "artifacts", "screenshots");
mkdirSync(outputDir, { recursive: true });

async function run() {
  console.log("Starting Next.js server on port 3210...");
  const server = spawn("npx", ["next", "start", "-p", "3210"], {
    shell: true,
    stdio: "inherit",
  });

  // Wait for server to become responsive
  const url = "http://127.0.0.1:3210";
  let connected = false;
  for (let i = 0; i < 30; i++) {
    try {
      const res = await fetch(`${url}/solucoes/sites-landing-pages`);
      if (res.ok) {
        connected = true;
        break;
      }
    } catch {
      await new Promise((r) => setTimeout(r, 1000));
    }
  }

  if (!connected) {
    console.error("Failed to connect to Next server");
    server.kill();
    process.exit(1);
  }

  console.log("Next server is up! Launching browser...");
  const browser = await chromium.launch();

  // Helper to scroll page and trigger rendering
  async function fullPageScroll(page) {
    await page.evaluate(async () => {
      await new Promise((resolve) => {
        let totalHeight = 0;
        const distance = 400;
        const timer = setInterval(() => {
          const scrollHeight = document.body.scrollHeight;
          window.scrollBy(0, distance);
          totalHeight += distance;
          if (totalHeight >= scrollHeight) {
            clearInterval(timer);
            window.scrollTo(0, 0);
            resolve();
          }
        }, 100);
      });
    });
    await page.waitForTimeout(500);
  }

  // Desktop 1440
  console.log("Capturing Desktop 1440...");
  const desktopContext = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });
  const desktopPage = await desktopContext.newPage();
  await desktopPage.goto(`${url}/solucoes/sites-landing-pages`, { waitUntil: "networkidle" });
  await fullPageScroll(desktopPage);
  await desktopPage.screenshot({
    path: join(outputDir, "prospecta-web-desktop.png"),
    fullPage: true,
  });
  await desktopPage.screenshot({
    path: join(outputDir, "prospecta-web-hero-desktop.png"),
  });

  // Mobile 390
  console.log("Capturing Mobile 390...");
  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });
  const mobilePage = await mobileContext.newPage();
  await mobilePage.goto(`${url}/solucoes/sites-landing-pages`, { waitUntil: "networkidle" });
  await fullPageScroll(mobilePage);
  await mobilePage.screenshot({
    path: join(outputDir, "prospecta-web-mobile.png"),
    fullPage: true,
  });

  // B2B Home bridge capture
  console.log("Capturing B2B Home with contextual bridge...");
  await desktopPage.goto(`${url}/`, { waitUntil: "networkidle" });
  const bridgeElement = desktopPage.locator("[class*='webBridgeSection']");
  if (await bridgeElement.count() > 0) {
    await bridgeElement.first().screenshot({
      path: join(outputDir, "b2b-web-bridge.png"),
    });
  }

  await browser.close();
  server.kill();
  console.log("Screenshots captured successfully in artifacts/screenshots!");
  process.exit(0);
}

run().catch((err) => {
  console.error("Error during capture:", err);
  process.exit(1);
});
