import { chromium } from "playwright";
import fs from "node:fs";

const downloadDir = "artifacts/preview-v2/mockups-drive";
if (!fs.existsSync(downloadDir)) {
  fs.mkdirSync(downloadDir, { recursive: true });
}

async function run() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  await page.goto("https://drive.google.com/drive/folders/1yDSNKx85P5taaZ-9c-6YwUHzODiFwEjG?usp=drive_link", { waitUntil: "networkidle" });
  await page.waitForTimeout(3000);

  // Click on the grid view button (the one next to list view)
  const gridButton = page.locator('button[aria-label*="grade"], button[aria-label*="Grid"], div[role="button"][aria-label*="grade"]').first();
  if (await gridButton.count() > 0) {
    await gridButton.click();
    await page.waitForTimeout(2000);
  } else {
    // Or click directly on the grid icon seen in the screenshot at top right
    const iconBtn = page.locator('div[role="group"] button, div[role="radiogroup"] button').last();
    if (await iconBtn.count() > 0) {
      await iconBtn.click();
      await page.waitForTimeout(2000);
    }
  }

  // Let's click on the text of the first file "ChatGPT Image 20_09_2026, 12_50_49 (1).png"
  const fileText = page.locator('text="ChatGPT Image"').first();
  console.log("File text count:", await fileText.count());
  if (await fileText.count() > 0) {
    await fileText.dblclick();
    await page.waitForTimeout(3000);

    for (let i = 1; i <= 15; i++) {
      await page.screenshot({ path: `${downloadDir}/slide_${i}.png` });
      console.log(`Saved slide_${i}.png`);
      await page.keyboard.press("ArrowRight");
      await page.waitForTimeout(2500);
    }
  } else {
    // If not found, let's take a screenshot to inspect
    await page.screenshot({ path: `${downloadDir}/failed_find.png` });
  }

  await browser.close();
  console.log("Capture process finished!");
}

run().catch(console.error);
