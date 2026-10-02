import { chromium } from "playwright";

async function test() {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  p.on("console", (msg) => console.log("PAGE LOG:", msg.text()));
  p.on("pageerror", (err) => console.log("PAGE ERROR:", err));
  p.on("requestfailed", (req) => console.log("REQ FAILED:", req.url(), req.failure()?.errorText));
  
  const res = await p.goto("http://localhost:3102/preview/site-v2/?motion=off", { waitUntil: "networkidle" });
  console.log("Status:", res.status());
  const root = p.locator('[class*="previewRoot"]').first();
  console.log("previewRoot count:", await root.count());
  if (await root.count() > 0) {
    console.log("previewRoot class:", await root.getAttribute("class"));
    const style = await root.evaluate((el) => ({
      bg: window.getComputedStyle(el).backgroundColor,
      color: window.getComputedStyle(el).color,
    }));
    console.log("Root style:", style);
    
    // Check map
    const map = p.locator('[class*="heroMap"]').first();
    console.log("heroMap count:", await map.count());
    console.log("heroMap class:", await map.getAttribute("class"));
    const mapBox = await map.boundingBox();
    console.log("heroMap box:", mapBox);
    
    // Check tag
    const tag = p.locator('[class*="regionTag"]').first();
    console.log("regionTag count:", await tag.count());
    console.log("regionTag class:", await tag.getAttribute("class"));
    console.log("regionTag box:", await tag.boundingBox());
    console.log("regionTag style:", await tag.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return { position: cs.position, left: cs.left, top: cs.top, width: cs.width, height: cs.height };
    }));
  } else {
    console.log("HTML:", (await p.content()).slice(0, 500));
  }
  await b.close();
}

test().catch(console.error);
