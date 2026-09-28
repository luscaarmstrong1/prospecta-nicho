import { chromium } from "playwright";
import fs from "fs";
import path from "path";

async function main() {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();

  console.log("Navigating to http://127.0.0.1:3102/preview/site-v2-gemini?motion=off ...");
  await page.goto("http://127.0.0.1:3102/preview/site-v2-gemini?motion=off", {
    waitUntil: "networkidle",
  });

  const outDir = path.resolve(process.cwd(), "artifacts/preview-v2-gemini");
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  // 1. Full page screenshot
  console.log("Capturing full page 1440x900...");
  await page.screenshot({
    path: path.join(outDir, "full-desktop-1440x900.png"),
    fullPage: true,
  });

  // 2. Sections
  const sections = [
    { name: "header", selector: '[data-testid="preview-gemini-header"]' },
    { name: "hero", selector: '[data-testid="preview-gemini-hero"]' },
    { name: "numbers", selector: '[data-testid="preview-gemini-numbers"]' },
    { name: "sample", selector: '[data-testid="preview-gemini-sample"]' },
    { name: "segments", selector: '[data-testid="preview-gemini-segments"]' },
    { name: "plans", selector: '[data-testid="preview-gemini-plans"]' },
    { name: "testimonials", selector: '[data-testid="preview-gemini-testimonials"]' },
    { name: "final-cta", selector: '[data-testid="preview-gemini-final-cta"]' },
    { name: "footer", selector: '[data-testid="preview-gemini-footer"]' },
  ];

  for (const s of sections) {
    const el = await page.$(s.selector);
    if (el) {
      console.log(`Capturing section ${s.name}...`);
      await el.screenshot({
        path: path.join(outDir, `section-${s.name}.png`),
      });
    } else {
      console.warn(`Element not found: ${s.selector}`);
    }
  }

  // 3. Viewports
  const viewports = [
    { name: "desktop-1920", width: 1920, height: 1080 },
    { name: "tablet-1024", width: 1024, height: 800 },
    { name: "mobile-430", width: 430, height: 932 },
    { name: "mobile-390", width: 390, height: 844 },
  ];

  for (const vp of viewports) {
    console.log(`Capturing viewport ${vp.name}...`);
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.waitForTimeout(400);
    await page.screenshot({
      path: path.join(outDir, `viewport-${vp.name}.png`),
      fullPage: true,
    });
  }

  await browser.close();
  console.log("All visual captures completed!");
}

main().catch((err) => {
  console.error("Error during capture:", err);
  process.exit(1);
});
