import { chromium } from "@playwright/test";

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto("http://localhost:3000/solucoes/sites-landing-pages", { waitUntil: "networkidle" });

  const logoHref = await page.locator("header a").first().getAttribute("href");
  console.log("Logo href:", logoHref);

  const navLinks = await page.evaluate(() => {
    return Array.from(document.querySelectorAll("header nav a")).map((a) => ({
      text: a.innerText.trim(),
      href: a.getAttribute("href"),
    }));
  });
  console.log("Nav links:", navLinks);

  const headerCta = await page.evaluate(() => {
    const el = document.querySelector("header a[class*='headerSpecialistBtn']");
    return el ? el.getAttribute("href") : null;
  });
  console.log("Header CTA WhatsApp link:", headerCta?.slice(0, 50) + "...");

  const heroPrimary = await page.evaluate(() => {
    const el = document.querySelector("section a[class*='primaryButton']");
    return el ? el.getAttribute("href") : null;
  });
  console.log("Hero Primary CTA WhatsApp link:", heroPrimary?.slice(0, 50) + "...");

  const heroSecondary = await page.evaluate(() => {
    const el = document.querySelector("section a[class*='secondaryButton']");
    return el ? el.getAttribute("href") : null;
  });
  console.log("Hero Secondary CTA href:", heroSecondary);

  await browser.close();
}

main();
