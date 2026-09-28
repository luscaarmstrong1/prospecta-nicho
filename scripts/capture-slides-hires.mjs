import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const targetDir = "artifacts/preview-v2/mockups-drive";
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

async function run() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });

  await page.goto("https://drive.google.com/drive/folders/1yDSNKx85P5taaZ-9c-6YwUHzODiFwEjG?usp=drive_link", { waitUntil: "networkidle" });
  await page.waitForTimeout(4000);

  const fileItem = page.locator('[role="row"], [role="gridcell"]').filter({ hasText: "ChatGPT Image" }).first();
  console.log("File item count:", await fileItem.count());

  if (await fileItem.count() > 0) {
    await fileItem.dblclick();
    await page.waitForTimeout(4000);

    for (let i = 1; i <= 15; i++) {
      console.log(`Processing slide ${i}...`);

      // Let's capture the center container or full page
      await page.screenshot({ path: `${targetDir}/slide_1080p_${i}.png` });

      // Check if there are img elements inside the viewer
      const imgSrcs = await page.evaluate(() => {
        const imgs = Array.from(document.querySelectorAll('img'));
        return imgs.map(img => img.src).filter(src => src.includes('googleusercontent') || src.includes('drive'));
      });
      console.log(`Slide ${i} img srcs:`, imgSrcs.length);

      await page.keyboard.press("ArrowRight");
      await page.waitForTimeout(3000);
    }
  }

  await browser.close();
  console.log("Done!");
}

run().catch(console.error);
