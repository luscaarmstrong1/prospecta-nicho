import { chromium } from "playwright";

async function scrape() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto("https://drive.google.com/drive/folders/1yDSNKx85P5taaZ-9c-6YwUHzODiFwEjG?usp=drive_link", { waitUntil: "networkidle" });
  await page.waitForTimeout(5000);

  const title = await page.title();
  console.log("Drive Page Title:", title);

  const items = await page.evaluate(() => {
    const list = [];
    const elements = document.querySelectorAll("[data-id]");
    elements.forEach(el => {
      const label = el.getAttribute("aria-label");
      if (label) {
        list.push(label);
      }
    });
    return list;
  });

  console.log("Found items count:", items.length);
  console.log("Items:", items);

  await page.screenshot({ path: "artifacts/preview-v2/drive-folder.png", fullPage: true });
  await browser.close();
}

scrape().catch(console.error);
