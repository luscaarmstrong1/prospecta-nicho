import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import http from "node:http";
import { spawn } from "node:child_process";
import sharp from "sharp";

const auditBaseDir = "artifacts/visual-audit";
const driveMockupsDir = "artifacts/preview-v2/mockups-drive";

const pagesConfig = [
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

function checkServer() {
  return new Promise((resolve) => {
    const req = http.get("http://127.0.0.1:3102/", (res) => {
      resolve(res.statusCode === 200 || res.statusCode === 304);
    });
    req.on("error", () => resolve(false));
    req.setTimeout(1500, () => {
      req.destroy();
      resolve(false);
    });
  });
}

async function ensureServerRunning() {
  const isUp = await checkServer();
  if (isUp) {
    console.log("Local server is already running on http://127.0.0.1:3102");
    return null;
  }

  console.log("Starting Next.js dev server on http://127.0.0.1:3102...");
  const child = spawn(
    process.execPath,
    ["node_modules/next/dist/bin/next", "dev", "--hostname", "127.0.0.1", "--port", "3102"],
    {
      env: {
        ...process.env,
        NODE_ENV: "development",
        GITHUB_PAGES: undefined,
        NEXT_PUBLIC_STATIC_EXPORT: undefined,
        DEPLOY_TARGET: undefined,
        NEXT_PUBLIC_RUNTIME_TARGET: undefined,
        NEXT_PUBLIC_BASE_PATH: "",
      },
      stdio: "pipe",
    }
  );

  // Wait for server to become ready
  for (let i = 0; i < 30; i++) {
    await new Promise((r) => setTimeout(r, 1500));
    if (await checkServer()) {
      console.log("Next.js dev server ready!");
      return child;
    }
  }

  throw new Error("Timeout waiting for Next.js dev server to start on 3102");
}

async function generateAudit() {
  console.log("=== STARTING FULL VISUAL AUDIT ===");

  if (!fs.existsSync(auditBaseDir)) {
    fs.mkdirSync(auditBaseDir, { recursive: true });
  }

  const serverProc = await ensureServerRunning();

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();

  const auditSummary = [];

  for (const item of pagesConfig) {
    console.log(`\n--- Auditing ${item.id.toUpperCase()} (${item.route}) ---`);
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
      // Capture baseline
      await page.goto("http://127.0.0.1:3102/", { waitUntil: "networkidle" });
      await page.waitForTimeout(1000);
      await page.screenshot({ path: refPath, fullPage: true });
    } else {
      const srcSlide = path.join(driveMockupsDir, item.mockupFile);
      if (fs.existsSync(srcSlide) && item.extractCrop) {
        await sharp(srcSlide)
          .extract(item.extractCrop)
          .resize(1440, null, { fit: "inside" })
          .toFile(refPath);
      }
    }

    // 2. Capture actual.png
    console.log(`Navigating to http://127.0.0.1:3102${item.route}...`);
    const response = await page.goto(`http://127.0.0.1:3102${item.route}`, {
      waitUntil: "networkidle",
    });

    const status = response ? response.status() : 0;
    console.log(`  HTTP Status: ${status}`);

    // Wait for animations and fonts to settle
    await page.waitForTimeout(1500);

    await page.screenshot({ path: actualPath, fullPage: true });
    console.log(`  Saved actual.png`);

    // 3. Normalize dimensions for accurate pixel comparison
    const refMeta = await sharp(refPath).metadata();
    const actMeta = await sharp(actualPath).metadata();

    const targetWidth = 1440;
    const targetHeight = Math.min(refMeta.height || 1000, actMeta.height || 1000);

    const refNormBuffer = await sharp(refPath)
      .resize(targetWidth, targetHeight, { fit: "cover", position: "top" })
      .raw()
      .toBuffer();

    const actNormBuffer = await sharp(actualPath)
      .resize(targetWidth, targetHeight, { fit: "cover", position: "top" })
      .raw()
      .toBuffer();

    // 4. Compute Pixel Diff & 50/50 Overlay
    const totalPixels = targetWidth * targetHeight;
    let diffCount = 0;
    const channels = 3; // RGB
    const diffRaw = Buffer.alloc(totalPixels * 4);
    const overlayRaw = Buffer.alloc(totalPixels * 4);

    const threshold = 35; // Per-channel delta threshold

    for (let i = 0; i < totalPixels; i++) {
      const rIdx = i * channels;
      const oIdx = i * 4;

      const r1 = refNormBuffer[rIdx] || 0;
      const g1 = refNormBuffer[rIdx + 1] || 0;
      const b1 = refNormBuffer[rIdx + 2] || 0;

      const r2 = actNormBuffer[rIdx] || 0;
      const g2 = actNormBuffer[rIdx + 1] || 0;
      const b2 = actNormBuffer[rIdx + 2] || 0;

      // Overlay 50/50
      overlayRaw[oIdx] = Math.round(r1 * 0.5 + r2 * 0.5);
      overlayRaw[oIdx + 1] = Math.round(g1 * 0.5 + g2 * 0.5);
      overlayRaw[oIdx + 2] = Math.round(b1 * 0.5 + b2 * 0.5);
      overlayRaw[oIdx + 3] = 255;

      // Diff
      const delta = Math.abs(r1 - r2) + Math.abs(g1 - g2) + Math.abs(b1 - b2);
      if (delta > threshold * 3) {
        diffCount++;
        // Highlight mismatch with vivid magenta
        diffRaw[oIdx] = 255;
        diffRaw[oIdx + 1] = 0;
        diffRaw[oIdx + 2] = 128;
        diffRaw[oIdx + 3] = 255;
      } else {
        // Dim match
        diffRaw[oIdx] = Math.round(r2 * 0.3);
        diffRaw[oIdx + 1] = Math.round(g2 * 0.3);
        diffRaw[oIdx + 2] = Math.round(b2 * 0.3);
        diffRaw[oIdx + 3] = 255;
      }
    }

    // Save overlay image
    await sharp(overlayRaw, {
      raw: { width: targetWidth, height: targetHeight, channels: 4 },
    })
      .png()
      .toFile(overlayPath);

    // Save diff image
    await sharp(diffRaw, {
      raw: { width: targetWidth, height: targetHeight, channels: 4 },
    })
      .png()
      .toFile(diffPath);

    const differencePercent = Number(((diffCount / totalPixels) * 100).toFixed(3));
    const similarityPercent = Number((100 - differencePercent).toFixed(3));

    const metrics = {
      page: item.id,
      route: item.route,
      width: targetWidth,
      height: targetHeight,
      totalPixels,
      differentPixels: diffCount,
      differencePercent,
      similarityPercent,
      reference: refPath,
      actual: actualPath,
      overlay: overlayPath,
      diff: diffPath,
      timestamp: new Date().toISOString(),
    };

    fs.writeFileSync(metricsPath, JSON.stringify(metrics, null, 2));

    auditSummary.push(metrics);
    console.log(`  Metrics computed:`, metrics);
  }

  await browser.close();

  console.log("\n=== AUDIT COMPLETE SUMMARY ===");
  console.table(auditSummary);

  if (serverProc) {
    serverProc.kill();
  }
}

generateAudit().catch(console.error);
