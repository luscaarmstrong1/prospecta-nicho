import { chromium } from "playwright";

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto("http://127.0.0.1:3102/preview/site-v2/?motion=off", { waitUntil: "networkidle" });
  await page.screenshot({ path: "artifacts/preview-v2/before-refinement-1440.png", fullPage: true });

  const hero = page.locator('[data-testid="preview-hero"]').first();
  if (await hero.count() > 0) {
    await hero.screenshot({ path: "artifacts/preview-v2/before-hero.png" });
  }

  const numbers = page.locator('[data-testid="preview-numbers"]').first();
  if (await numbers.count() > 0) {
    await numbers.screenshot({ path: "artifacts/preview-v2/before-numbers.png" });
  }

  await browser.close();
  console.log("Baseline captures completed!");
}

main().catch(console.error);
