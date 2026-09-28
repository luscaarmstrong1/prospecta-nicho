import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { expect, test } from "@playwright/test";
import sharp from "sharp";

const artifactsDir = path.resolve("artifacts/preview-v2");
const sectionsDir = path.join(artifactsDir, "sections");
const prohibitedRuntimeRequest = /supabase\.co|\/functions\/|\/rest\/v1|\/auth\/v1|\/api\//i;

test.describe("preview v2 visual quality", () => {
  test.setTimeout(60_000);

  test.beforeEach(async ({ page }) => {
    await mkdir(artifactsDir, { recursive: true });
    await mkdir(sectionsDir, { recursive: true });

    await page.route("**/*", async (route) => {
      const url = route.request().url();
      if (prohibitedRuntimeRequest.test(url)) {
        throw new Error(`Preview attempted a prohibited runtime request: ${url}`);
      }
      await route.continue();
    });
  });

  test("renders every section without backend traffic or layout overflow", async ({ page }, testInfo) => {
    const browserErrors: string[] = [];
    const assetErrors: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") browserErrors.push(message.text());
    });
    page.on("pageerror", (error) => browserErrors.push(error.message));
    page.on("requestfailed", (request) => assetErrors.push(`${request.url()}: ${request.failure()?.errorText}`));
    page.on("response", (response) => {
      if (response.request().resourceType() === "image" && response.status() >= 400) {
        assetErrors.push(`${response.url()}: HTTP ${response.status()}`);
      }
    });

    await page.goto("/preview/site-v2/?motion=off", { waitUntil: "networkidle" });

    await expect(page.getByTestId("preview-hero")).toBeVisible();
    await expect(page.getByTestId("preview-header")).toBeVisible();
    await expect(page.getByTestId("preview-hero-title")).toBeVisible();
    await expect(page.getByTestId("preview-map")).toBeVisible();
    await expect(page.getByTestId("preview-numbers")).toBeVisible();
    await expect(page.getByTestId("preview-sample")).toBeVisible();
    await expect(page.getByTestId("preview-segments")).toBeVisible();
    await expect(page.getByTestId("preview-plans")).toBeVisible();
    await expect(page.getByTestId("preview-testimonials")).toBeVisible();
    await expect(page.getByTestId("preview-final-cta")).toBeVisible();
    await expect(page.getByTestId("preview-footer")).toBeVisible();

    await page.evaluate(async () => {
      for (let y = 0; y < document.documentElement.scrollHeight; y += window.innerHeight * 0.75) {
        window.scrollTo(0, y);
        await new Promise((resolve) => window.setTimeout(resolve, 100));
      }
      window.scrollTo(0, 0);
    });
    await page.waitForLoadState("networkidle");

    const layout = await page.evaluate(() => ({
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
    }));
    expect(layout.scrollWidth).toBeLessThanOrEqual(layout.clientWidth + 1);
    expect(browserErrors).toEqual([]);
    expect(assetErrors).toEqual([]);

    const projectName = testInfo.project.name;
    await page.screenshot({
      path: path.join(artifactsDir, `current-${projectName}.png`),
      fullPage: true,
    });

    if (projectName === "desktop") {
      const fullPagePath = path.join(artifactsDir, "current.png");
      await page.screenshot({ path: fullPagePath, fullPage: true });
      const metricTestIds = {
        header: "preview-header",
        hero: "preview-hero",
        heroTitle: "preview-hero-title",
        heroActions: "preview-hero-actions",
        map: "preview-map",
        numbers: "preview-numbers",
        sample: "preview-sample",
        segments: "preview-segments",
        plans: "preview-plans",
        testimonials: "preview-testimonials",
        finalCta: "preview-final-cta",
        footer: "preview-footer",
      } as const;
      const metrics: Record<string, { x: number; y: number; width: number; height: number }> = {};
      for (const [name, testId] of Object.entries(metricTestIds)) {
        const box = await page.getByTestId(testId).boundingBox();
        if (!box) throw new Error(`Unable to measure ${testId}.`);
        metrics[name] = box;
      }
      await writeFile(
        path.join(artifactsDir, "layout-metrics.json"),
        `${JSON.stringify({ viewport: testInfo.project.use.viewport, metrics }, null, 2)}\n`,
      );
      const sectionCaptures = {
        hero: ["preview-header", "preview-hero"],
        sample: ["preview-sample"],
        segments: ["preview-segments"],
        plans: ["preview-plans"],
        testimonials: ["preview-testimonials"],
        footer: ["preview-final-cta", "preview-footer"],
      } as const;

      for (const [section, testIds] of Object.entries(sectionCaptures)) {
        const boxes = await Promise.all(testIds.map((testId) => page.getByTestId(testId).boundingBox()));
        if (boxes.some((box) => !box)) throw new Error(`Unable to measure ${section} section.`);
        const measured = boxes.filter((box): box is NonNullable<typeof box> => Boolean(box));
        const left = Math.min(...measured.map((box) => box.x));
        const top = Math.min(...measured.map((box) => box.y));
        const right = Math.max(...measured.map((box) => box.x + box.width));
        const bottom = Math.max(...measured.map((box) => box.y + box.height));
        await sharp(fullPagePath)
          .extract({
            left: Math.max(0, Math.round(left)),
            top: Math.max(0, Math.round(top)),
            width: Math.round(right - left),
            height: Math.round(bottom - top),
          })
          .png()
          .toFile(path.join(sectionsDir, `${section}-current.png`));
      }
    }
  });
});
