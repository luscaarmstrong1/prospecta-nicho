import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const auditBaseDir = "artifacts/visual-audit";
const driveMockupsDir = "artifacts/preview-v2/mockups-drive";

const pages = [
  {
    id: "home",
    route: "/",
    mockupFile: "slide_1080p_1.png",
    isHome: true,
  },
  {
    id: "solucoes",
    route: "/solucoes",
    mockupFile: "slide_1080p_1.png",
    extractCrop: { left: 654, top: 118, width: 594, height: 884 },
  },
  {
    id: "segmentos",
    route: "/segmentos",
    mockupFile: "slide_1080p_2.png",
    extractCrop: { left: 654, top: 118, width: 594, height: 884 },
  },
  {
    id: "planos",
    route: "/planos",
    mockupFile: "slide_1080p_3.png",
    extractCrop: { left: 654, top: 118, width: 594, height: 884 },
  },
  {
    id: "conteudo",
    route: "/conteudo",
    mockupFile: "slide_1080p_4.png",
    extractCrop: { left: 654, top: 118, width: 594, height: 884 },
  },
  {
    id: "sobre",
    route: "/sobre",
    mockupFile: "slide_1080p_5.png",
    extractCrop: { left: 654, top: 118, width: 594, height: 884 },
  },
];

async function runAudit() {
  console.log("==================================================");
  console.log("STARTING EXACT PIXEL-PERFECT VISUAL AUDIT");
  console.log("==================================================");

  if (!fs.existsSync(auditBaseDir)) {
    fs.mkdirSync(auditBaseDir, { recursive: true });
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();

  const results = [];
  const networkErrors = [];
  const consoleErrors = [];

  page.on("requestfailed", (request) => {
    networkErrors.push({ url: request.url(), failure: request.failure()?.errorText });
  });

  page.on("response", (response) => {
    if (response.status() >= 400) {
      networkErrors.push({ url: response.url(), status: response.status() });
    }
  });

  page.on("console", (msg) => {
    if (msg.type() === "error") {
      consoleErrors.push(msg.text());
    }
  });

  for (const item of pages) {
    console.log(`\n>>> Auditing ${item.id.toUpperCase()} (Route: ${item.route})`);
    const pageDir = path.join(auditBaseDir, item.id);
    if (!fs.existsSync(pageDir)) {
      fs.mkdirSync(pageDir, { recursive: true });
    }

    const refPath = path.join(pageDir, "reference.png");
    const actualPath = path.join(pageDir, "actual.png");
    const overlayPath = path.join(pageDir, "overlay.png");
    const diffPath = path.join(pageDir, "diff.png");
    const metricsPath = path.join(pageDir, "metrics.json");

    // 1. Prepare reference.png
    if (item.isHome) {
      // For Home, the frozen approved V2 baseline
      const homeBaseline = "artifacts/visual-diff/actual/home_1440.png";
      if (fs.existsSync(homeBaseline)) {
        fs.copyFileSync(homeBaseline, refPath);
      } else {
        await page.goto("http://127.0.0.1:3102/", { waitUntil: "networkidle" });
        await page.waitForTimeout(1000);
        await page.screenshot({ path: refPath, fullPage: true });
      }
    } else {
      const srcSlide = path.join(driveMockupsDir, item.mockupFile);
      if (fs.existsSync(srcSlide) && item.extractCrop) {
        await sharp(srcSlide)
          .extract(item.extractCrop)
          .resize(1440, null, { fit: "inside" })
          .toFile(refPath);
      }
    }

    // 2. Navigate and capture actual.png
    const pageUrl = `http://127.0.0.1:3102${item.route}`;
    const initialNetworkErrors = networkErrors.length;
    const initialConsoleErrors = consoleErrors.length;

    const response = await page.goto(pageUrl, { waitUntil: "networkidle" });
    const readyState = await page.evaluate(() => document.readyState);
    const status = response ? response.status() : 0;

    await page.waitForTimeout(1500);
    await page.screenshot({ path: actualPath, fullPage: true });

    const pageNetworkErrors = networkErrors.length - initialNetworkErrors;
    const pageConsoleErrors = consoleErrors.length - initialConsoleErrors;

    console.log(`  HTTP Status: ${status} | readyState: ${readyState} | 404/500 Assets: ${pageNetworkErrors} | Console Errors: ${pageConsoleErrors}`);

    // 3. Normalize dimensions for comparison
    const refMeta = await sharp(refPath).metadata();
    const actMeta = await sharp(actualPath).metadata();

    const targetWidth = 1440;
    const targetHeight = Math.min(refMeta.height || 1200, actMeta.height || 1200);

    const refBuffer = await sharp(refPath)
      .resize(targetWidth, targetHeight, { fit: "cover", position: "top" })
      .raw()
      .toBuffer();

    const actBuffer = await sharp(actualPath)
      .resize(targetWidth, targetHeight, { fit: "cover", position: "top" })
      .raw()
      .toBuffer();

    // 4. Pixel-by-pixel diff & 50/50 overlay calculation
    const totalPixels = targetWidth * targetHeight;
    let differentPixels = 0;
    const channels = 3;
    const diffRaw = Buffer.alloc(totalPixels * 4);
    const overlayRaw = Buffer.alloc(totalPixels * 4);

    const threshold = 35;

    for (let i = 0; i < totalPixels; i++) {
      const rIdx = i * channels;
      const oIdx = i * 4;

      const r1 = refBuffer[rIdx] || 0;
      const g1 = refBuffer[rIdx + 1] || 0;
      const b1 = refBuffer[rIdx + 2] || 0;

      const r2 = actBuffer[rIdx] || 0;
      const g2 = actBuffer[rIdx + 1] || 0;
      const b2 = actBuffer[rIdx + 2] || 0;

      // 50/50 Overlay
      overlayRaw[oIdx] = Math.round(r1 * 0.5 + r2 * 0.5);
      overlayRaw[oIdx + 1] = Math.round(g1 * 0.5 + g2 * 0.5);
      overlayRaw[oIdx + 2] = Math.round(b1 * 0.5 + b2 * 0.5);
      overlayRaw[oIdx + 3] = 255;

      // Color Delta
      const delta = Math.abs(r1 - r2) + Math.abs(g1 - g2) + Math.abs(b1 - b2);
      if (delta > threshold * 3) {
        differentPixels++;
        // Mismatch highlight (vivid magenta)
        diffRaw[oIdx] = 255;
        diffRaw[oIdx + 1] = 0;
        diffRaw[oIdx + 2] = 128;
        diffRaw[oIdx + 3] = 255;
      } else {
        // Match dim
        diffRaw[oIdx] = Math.round(r2 * 0.35);
        diffRaw[oIdx + 1] = Math.round(g2 * 0.35);
        diffRaw[oIdx + 2] = Math.round(b2 * 0.35);
        diffRaw[oIdx + 3] = 255;
      }
    }

    // Save overlay.png
    await sharp(overlayRaw, {
      raw: { width: targetWidth, height: targetHeight, channels: 4 },
    })
      .png()
      .toFile(overlayPath);

    // Save diff.png
    await sharp(diffRaw, {
      raw: { width: targetWidth, height: targetHeight, channels: 4 },
    })
      .png()
      .toFile(diffPath);

    const differencePercent = Number(((differentPixels / totalPixels) * 100).toFixed(3));
    const similarityPercent = Number((100 - differencePercent).toFixed(3));

    const metricsData = {
      page: item.id,
      route: item.route,
      mockupFile: item.mockupFile,
      width: targetWidth,
      height: targetHeight,
      totalPixels,
      differentPixels,
      differencePercent,
      similarityPercent,
      networkErrors: pageNetworkErrors,
      consoleErrors: pageConsoleErrors,
      referencePath: refPath,
      actualPath: actualPath,
      overlayPath: overlayPath,
      diffPath: diffPath,
      timestamp: new Date().toISOString(),
    };

    fs.writeFileSync(metricsPath, JSON.stringify(metricsData, null, 2));

    results.push(metricsData);
    console.log(`  differentPixels: ${differentPixels} / ${totalPixels}`);
    console.log(`  differencePercent: ${differencePercent}% | similarityPercent: ${similarityPercent}%`);
  }

  await browser.close();

  console.log("\n==================================================");
  console.log("FINAL MEASURED AUDIT TABLE");
  console.log("==================================================");
  console.table(
    results.map((r) => ({
      Page: r.page.toUpperCase(),
      Dimension: `${r.width}x${r.height}`,
      "Diff Pixels": r.differentPixels,
      "Difference %": `${r.differencePercent}%`,
      "Similarity %": `${r.similarityPercent}%`,
      "Assets 404": r.networkErrors,
      "Console Errors": r.consoleErrors,
    }))
  );

  return results;
}

runAudit().catch(console.error);
