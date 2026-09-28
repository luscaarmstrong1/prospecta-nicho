import { chromium } from "playwright";

async function inspect() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto("http://127.0.0.1:3102/preview/site-v2/?motion=off", { waitUntil: "networkidle" });

  const metrics = await page.locator('[class*="metricRow"] > div').all();
  console.log("=== METRIC COLUMNS ===");
  for (const m of metrics) {
    const text = await m.innerText();
    const style = await m.locator("strong").evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return { fontSize: cs.fontSize, fontWeight: cs.fontWeight, color: cs.color };
    });
    console.log(text.replace(/\n/g, " | "), JSON.stringify(style));
  }

  const tags = await page.locator('[class*="regionTag"]').all();
  console.log("\n=== REGION TAGS ===");
  for (const t of tags) {
    const text = await t.innerText();
    const box = await t.boundingBox();
    console.log(text.replace(/\n/g, " | "), box);
  }

  await browser.close();
}

inspect().catch(console.error);
