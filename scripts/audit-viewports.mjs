import { chromium } from "playwright";
import fs from "node:fs";

const viewports = [
  { name: "desktop-1920", width: 1920, height: 1080 },
  { name: "desktop-1440", width: 1440, height: 900 },
  { name: "tablet-1024", width: 1024, height: 768 },
  { name: "mobile-430", width: 430, height: 932 },
  { name: "mobile-390", width: 390, height: 844 },
];

if (!fs.existsSync("artifacts/preview-v2")) {
  fs.mkdirSync("artifacts/preview-v2", { recursive: true });
}

async function run() {
  const browser = await chromium.launch();
  for (const vp of viewports) {
    const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
    await page.goto("http://127.0.0.1:3102/preview/site-v2/?motion=off", { waitUntil: "networkidle" });

    // Check map container and tag bounding boxes
    const map = page.locator("[class*=\"heroMap\"]").first();
    const mapBox = await map.boundingBox();
    const tags = await page.locator("[class*=\"regionTag\"]").all();
    const tagData = [];
    for (const tag of tags) {
      const text = await tag.locator("span").innerText();
      const box = await tag.boundingBox();
      tagData.push({ text, box });
    }

    // Check numbers box
    const numbersBox = await page.locator("[data-testid=\"preview-numbers\"]").first().boundingBox();
    const metricTexts = await page.locator("[class*=\"metricRow\"] strong").allInnerTexts();

    // Check footer copyright font size
    const footerBottom = page.locator("[class*=\"footerBottom\"] span").first();
    const footerBottomFs = await footerBottom.evaluate(el => window.getComputedStyle(el).fontSize);

    console.log(`=== ${vp.name} ===`);
    console.log("Map Box:", mapBox);
    console.log("Tags:", tagData.map(t => `${t.text}: x=${Math.round(t.box.x)}, y=${Math.round(t.box.y)}, w=${Math.round(t.box.width)}, h=${Math.round(t.box.height)}`));
    console.log("Footer bottom font size:", footerBottomFs);

    await page.screenshot({ path: `artifacts/preview-v2/audit-${vp.name}.png`, fullPage: true });
    // Also capture hero section specifically
    const hero = page.locator('[data-testid="preview-hero"]').first();
    if (await hero.count() > 0) {
      await hero.screenshot({ path: `artifacts/preview-v2/audit-${vp.name}-hero.png` });
    }
    // And numbers section
    const numbers = page.locator('[data-testid="preview-numbers"]').first();
    if (await numbers.count() > 0) {
      await numbers.screenshot({ path: `artifacts/preview-v2/audit-${vp.name}-numbers.png` });
    }
    // And footer section
    const footer = page.locator('[data-testid="preview-footer"]').first();
    if (await footer.count() > 0) {
      await footer.screenshot({ path: `artifacts/preview-v2/audit-${vp.name}-footer.png` });
    }
    await page.close();
  }
  await browser.close();
}

run().catch(console.error);
