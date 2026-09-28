import { chromium } from "playwright";
import fs from "node:fs";

const downloadDir = "artifacts/preview-v2/mockups-drive";

async function run() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  await page.goto("https://drive.google.com/drive/folders/1yDSNKx85P5taaZ-9c-6YwUHzODiFwEjG?usp=drive_link", { waitUntil: "networkidle" });
  await page.waitForTimeout(3000);

  // Switch to grid view
  const gridBtn = page.locator('button[aria-label*="grade"], button[aria-label*="Grid"]').last();
  if (await gridBtn.count() > 0) {
    await gridBtn.click();
    await page.waitForTimeout(1500);
  }

  // Cards positions on 1440x900 grid view:
  // Row 1: y = 340
  // Card 1 (Soluções): x = 90
  // Card 2 (Segmentos): x = 255
  // Card 3 (Planos): x = 420
  // Card 4 (Conteúdo): x = 585
  // Card 5 (Sobre): x = 750

  const cards = [
    { name: "view_solucoes", x: 90, y: 340 },
    { name: "view_segmentos", x: 255, y: 340 },
    { name: "view_planos", x: 420, y: 340 },
    { name: "view_conteudo", x: 585, y: 340 },
    { name: "view_sobre", x: 750, y: 340 }
  ];

  for (const card of cards) {
    await page.mouse.dblclick(card.x, card.y);
    await page.waitForTimeout(2500);
    await page.screenshot({ path: `${downloadDir}/${card.name}.png` });
    console.log(`Saved ${card.name}.png`);
    await page.keyboard.press("Escape");
    await page.waitForTimeout(1000);
  }

  await browser.close();
}

run().catch(console.error);
