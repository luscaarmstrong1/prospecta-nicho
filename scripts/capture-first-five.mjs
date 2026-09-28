import { chromium } from "playwright";
import fs from "node:fs";

const downloadDir = "artifacts/preview-v2/mockups-drive";

async function run() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  await page.goto("https://drive.google.com/drive/folders/1yDSNKx85P5taaZ-9c-6YwUHzODiFwEjG?usp=drive_link", { waitUntil: "networkidle" });
  await page.waitForTimeout(3000);

  // Switch to list view (first button in group)
  const listBtn = page.locator('button[aria-label*="lista"], button[aria-label*="List"]').first();
  if (await listBtn.count() > 0) {
    await listBtn.click();
    await page.waitForTimeout(1500);
  }

  // Let's get all rows in table
  const rows = await page.locator('div[role="row"]').all();
  console.log("Rows count:", rows.length);

  // The first 5 files in order of name
  // Let's click on row 1
  for (let r = 1; r <= 5; r++) {
    const row = page.locator('div[role="row"]').nth(r);
    const rowText = await row.innerText();
    console.log(`Row ${r}:`, rowText.replace(/\n/g, ' '));
    await row.click();
    await page.keyboard.press("Enter"); // opens preview
    await page.waitForTimeout(2500);
    await page.screenshot({ path: `${downloadDir}/direct_file_${r}.png` });
    await page.keyboard.press("Escape"); // closes preview
    await page.waitForTimeout(1000);
  }

  await browser.close();
  console.log("Captured 5 direct files!");
}

run().catch(console.error);
