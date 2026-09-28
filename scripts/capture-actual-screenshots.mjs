import { chromium } from "playwright";
import fs from "node:fs";

const pages = [
  { path: "", name: "home" },
  { path: "solucoes", name: "solucoes" },
  { path: "segmentos", name: "segmentos" },
  { path: "planos", name: "planos" },
  { path: "conteudo", name: "conteudo" },
  { path: "sobre", name: "sobre" },
];

const viewports = [
  { name: "1440", width: 1440, height: 900 },
  { name: "390", width: 390, height: 844 },
];

async function capture() {
  const outDir = "artifacts/visual-diff/actual";
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const browser = await chromium.launch({ headless: true });

  for (const vp of viewports) {
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: 1,
    });
    const page = await context.newPage();

    for (const p of pages) {
      const url = `http://127.0.0.1:3102/${p.path}`;
      console.log(`Capturing ${p.name} at ${vp.name}px from ${url}...`);
      await page.goto(url, { waitUntil: "networkidle" });
      await page.waitForTimeout(1000);
      await page.screenshot({
        path: `${outDir}/${p.name}_${vp.name}.png`,
        fullPage: true,
      });
    }
    await context.close();
  }

  await browser.close();
  console.log("All screenshots captured successfully!");
}

capture().catch(console.error);
