import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const driveFolder = "https://drive.google.com/drive/folders/1yDSNKx85P5taaZ-9c-6YwUHzODiFwEjG?usp=drive_link";
const outDir = "artifacts/preview-v2/mockups-drive-hires";
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const page = await context.newPage();

  console.log("Navigating to Google Drive folder...");
  await page.goto(driveFolder, { waitUntil: "networkidle" });
  await page.waitForTimeout(5000);

  // Click on the first file item
  const firstItem = page.locator('[data-target="doc"]').first();
  console.log("Found doc items:", await firstItem.count());
  
  if (await firstItem.count() === 0) {
    const anyItem = page.locator('[role="row"], [role="gridcell"]').filter({ hasText: "ChatGPT Image" }).first();
    await anyItem.dblclick();
  } else {
    await firstItem.dblclick();
  }

  await page.waitForTimeout(4000);

  for (let i = 1; i <= 15; i++) {
    await page.waitForTimeout(2000);

    // Get current image title
    const currentTitle = await page.evaluate(() => {
      const titleEl = document.querySelector('[aria-label*="ChatGPT Image"], [title*="ChatGPT Image"], [data-tooltip*="ChatGPT Image"]');
      return titleEl ? (titleEl.getAttribute('title') || titleEl.getAttribute('aria-label') || titleEl.textContent) : `image_${Date.now()}`;
    });

    console.log(`Slide ${i} Title:`, currentTitle);

    // Screenshot the image viewport or download img src
    const imgElement = page.locator('img[src*="googleusercontent"]').first();
    if (await imgElement.count() > 0) {
      const box = await imgElement.boundingBox();
      if (box) {
        await page.screenshot({
          path: path.join(outDir, `drive_slide_${String(i).padStart(2, '0')}.png`),
          clip: box,
        });
        console.log(`Saved drive_slide_${String(i).padStart(2, '0')}.png (${box.width}x${box.height})`);
      }
    }

    // Click next button
    const nextBtn = page.locator('[aria-label="Próximo"], [aria-label="Next"], [data-tooltip="Próximo"], [data-tooltip="Next"]').first();
    if (await nextBtn.count() > 0) {
      await nextBtn.click();
    } else {
      await page.keyboard.press("ArrowRight");
    }
  }

  await browser.close();
  console.log("Completed!");
}

run().catch(console.error);
