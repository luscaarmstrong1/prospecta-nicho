import { chromium } from "playwright";
import fs from "node:fs";

const viewports = [
  { name: "frozen-desktop-1920", width: 1920, height: 1080 },
  { name: "frozen-desktop-1440", width: 1440, height: 900 },
  { name: "frozen-tablet-1024", width: 1024, height: 768 },
  { name: "frozen-mobile-430", width: 430, height: 932 },
  { name: "frozen-mobile-390", width: 390, height: 844 },
];

const targetDir = "artifacts/preview-v2/frozen";
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

async function run() {
  const browser = await chromium.launch();

  // 1. Full page captures
  for (const vp of viewports) {
    const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
    await page.goto("http://127.0.0.1:3102/preview/site-v2/?motion=off", { waitUntil: "networkidle" });
    await page.screenshot({ path: `${targetDir}/${vp.name}.png`, fullPage: true });
    await page.close();
  }

  // 2. Section captures on 1440 canonical desktop
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto("http://127.0.0.1:3102/preview/site-v2/?motion=off", { waitUntil: "networkidle" });

  const sections = [
    { name: "section-hero", selector: '[data-testid="preview-hero"]' },
    { name: "section-numbers", selector: '[data-testid="preview-numbers"]' },
    { name: "section-sample", selector: '[data-testid="preview-sample"]' },
    { name: "section-segments", selector: '[data-testid="preview-segments"]' },
    { name: "section-plans", selector: '[data-testid="preview-plans"]' },
    { name: "section-testimonials", selector: '[data-testid="preview-testimonials"]' },
    { name: "section-final-cta", selector: '[data-testid="preview-final-cta"]' },
    { name: "section-footer", selector: '[data-testid="preview-footer"]' },
  ];

  for (const sec of sections) {
    const el = page.locator(sec.selector).first();
    if (await el.count() > 0) {
      await el.screenshot({ path: `${targetDir}/${sec.name}.png` });
      console.log(`Saved ${sec.name}.png`);
    } else {
      console.warn(`Selector not found: ${sec.selector}`);
    }
  }

  await page.close();
  await browser.close();
  console.log("All golden master captures saved successfully!");
}

run().catch(console.error);
