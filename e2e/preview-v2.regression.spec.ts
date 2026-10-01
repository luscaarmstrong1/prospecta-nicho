import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { expect, test, type Locator, type Page } from "@playwright/test";

const auditDir = path.resolve("artifacts/preview-v2/final-audit");
const prohibitedRuntimeRequest = /supabase\.co|\/functions\/|\/rest\/v1|\/auth\/v1|\/api\//i;

type AuditTarget = {
  name: string;
  locate: (page: Page) => Locator;
  expectedCount?: number;
};

type ElementState = {
  count: number;
  visible: boolean;
  opacity: number;
  display: string;
  visibility: string;
  clipPath: string;
  width: number;
  height: number;
  left: number;
  right: number;
  inDocumentBounds: boolean;
};

const targets: AuditTarget[] = [
  { name: "headerLogo", locate: (page) => page.getByTestId("preview-header").locator("img").first() },
  { name: "headerNavigation", locate: (page) => page.getByTestId("preview-header").locator("nav") },
  { name: "headerActions", locate: (page) => page.getByTestId("preview-header-actions").getByRole("button"), expectedCount: 2 },
  { name: "heroEyebrow", locate: (page) => page.getByTestId("preview-hero").getByText("Oportunidades em todo o Brasil") },
  { name: "heroTitle", locate: (page) => page.getByTestId("preview-hero-title") },
  { name: "heroLead", locate: (page) => page.getByTestId("preview-hero").locator("p").filter({ hasText: "Dados atualizados" }) },
  { name: "heroActions", locate: (page) => page.getByTestId("preview-hero-actions") },
  { name: "heroMap", locate: (page) => page.getByTestId("preview-map") },
  { name: "regionalCards", locate: (page) => page.getByTestId("preview-map").locator("small", { hasText: "empresas" }).locator(".."), expectedCount: 5 },
  { name: "heroBenefits", locate: (page) => page.getByLabel("Benefícios da solução").locator(":scope > div"), expectedCount: 4 },
  { name: "numbersCard", locate: (page) => page.getByTestId("preview-numbers") },
  { name: "numbersMetrics", locate: (page) => page.getByTestId("preview-numbers").locator("strong"), expectedCount: 3 },
  { name: "numbersChart", locate: (page) => page.getByTestId("preview-numbers").locator("svg") },
  { name: "numbersImage", locate: (page) => page.getByTestId("preview-numbers-image") },
  { name: "sampleHeading", locate: (page) => page.getByTestId("preview-sample").locator("h2") },
  { name: "sampleCta", locate: (page) => page.getByTestId("preview-sample").getByRole("button", { name: /Receber amostra/ }) },
  { name: "sampleTrust", locate: (page) => page.getByTestId("preview-sample").locator("span").filter({ hasText: /Sem compromisso|Sem cartão/ }), expectedCount: 2 },
  { name: "sampleSpreadsheet", locate: (page) => page.getByLabel("Demonstração de planilha comercial") },
  { name: "sampleRows", locate: (page) => page.getByTestId("preview-sample").locator("tbody tr"), expectedCount: 5 },
  { name: "sampleBadge", locate: (page) => page.getByTestId("preview-sample").getByText("Dados reais e atualizados") },
  { name: "sampleFooter", locate: (page) => page.getByTestId("preview-sample").getByText("Baixar amostra em Excel") },
  { name: "segmentsHeading", locate: (page) => page.getByTestId("preview-segments").locator("h2") },
  { name: "segmentsViewAll", locate: (page) => page.getByTestId("preview-segments").getByRole("button", { name: /Ver todos/ }) },
  { name: "segmentCards", locate: (page) => page.getByTestId("motion-segment-card"), expectedCount: 3 },
  { name: "segmentImages", locate: (page) => page.getByTestId("motion-segment-card").locator("img"), expectedCount: 3 },
  { name: "segmentCtas", locate: (page) => page.getByTestId("motion-segment-card").getByRole("button"), expectedCount: 3 },
  { name: "plansHeading", locate: (page) => page.getByTestId("preview-plans").locator("h2") },
  { name: "plansPill", locate: (page) => page.getByTestId("preview-plans").getByText(/Todos os planos incluem/) },
  { name: "planCards", locate: (page) => page.getByTestId("preview-plans").locator("article"), expectedCount: 4 },
  { name: "planPrices", locate: (page) => page.getByTestId("preview-plans").locator("article strong"), expectedCount: 4 },
  { name: "planButtons", locate: (page) => page.getByTestId("preview-plans").locator("article button"), expectedCount: 4 },
  { name: "testimonialsHeading", locate: (page) => page.getByTestId("preview-testimonials").locator("h2") },
  { name: "testimonialArrows", locate: (page) => page.getByTestId("preview-testimonials").getByRole("button"), expectedCount: 2 },
  { name: "testimonialCards", locate: (page) => page.getByTestId("motion-testimonial-carousel").locator("figure"), expectedCount: 3 },
  { name: "testimonialAvatars", locate: (page) => page.getByTestId("motion-testimonial-carousel").locator("img"), expectedCount: 3 },
  { name: "finalCtaImage", locate: (page) => page.getByTestId("preview-final-cta").locator("img") },
  { name: "finalCtaHeading", locate: (page) => page.getByTestId("preview-final-cta").locator("h2") },
  { name: "finalCtaActions", locate: (page) => page.getByTestId("preview-final-cta").getByRole("button"), expectedCount: 2 },
  { name: "finalTrustItems", locate: (page) => page.getByTestId("preview-final-trust").locator(":scope > span"), expectedCount: 3 },
  { name: "footerLogo", locate: (page) => page.getByTestId("preview-footer").locator("img").first() },
  { name: "footerSocials", locate: (page) => page.getByTestId("preview-footer").getByLabel("Redes sociais demonstrativas").getByRole("button"), expectedCount: 3 },
  { name: "footerColumns", locate: (page) => page.getByTestId("preview-footer").locator("h3"), expectedCount: 4 },
  { name: "footerMap", locate: (page) => page.getByTestId("preview-footer").locator("img").nth(1) },
  { name: "newsletterInput", locate: (page) => page.getByLabel("Seu melhor e-mail") },
  { name: "newsletterButton", locate: (page) => page.getByRole("button", { name: "Quero receber" }) },
  { name: "footerCopyright", locate: (page) => page.getByTestId("preview-footer").getByText(/Todos os direitos reservados/) },
];

async function settleFullPage(page: Page, mode: "slow" | "fast") {
  if (mode === "fast") {
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  } else {
    await page.evaluate(async () => {
      for (let y = 0; y < document.documentElement.scrollHeight; y += window.innerHeight * 0.65) {
        window.scrollTo(0, y);
        await new Promise((resolve) => window.setTimeout(resolve, 90));
      }
    });
  }
  await page.waitForTimeout(1_800);
}

async function inspect(locator: Locator): Promise<ElementState> {
  const count = await locator.count();
  if (count === 0) {
    return { count, visible: false, opacity: 0, display: "missing", visibility: "missing", clipPath: "missing", width: 0, height: 0, left: 0, right: 0, inDocumentBounds: false };
  }

  const states = await locator.evaluateAll((elements) => elements.map((element) => {
    const style = getComputedStyle(element);
    const box = element.getBoundingClientRect();
    return {
      opacity: Number.parseFloat(style.opacity),
      display: style.display,
      visibility: style.visibility,
      clipPath: style.clipPath,
      width: box.width,
      height: box.height,
      left: box.left,
      right: box.right,
      inDocumentBounds: box.right >= 0 && box.left <= document.documentElement.scrollWidth,
    };
  }));
  const visible = states.every((state) =>
    state.display !== "none"
    && state.visibility !== "hidden"
    && state.opacity >= 0.05
    && !/inset\([^)]*100%/.test(state.clipPath)
    && state.width > 0
    && state.height > 0
    && state.inDocumentBounds,
  );
  return {
    count,
    visible,
    opacity: Math.min(...states.map((state) => state.opacity)),
    display: states.map((state) => state.display).join(","),
    visibility: states.map((state) => state.visibility).join(","),
    clipPath: states.map((state) => state.clipPath).join(","),
    width: Math.min(...states.map((state) => state.width)),
    height: Math.min(...states.map((state) => state.height)),
    left: Math.min(...states.map((state) => state.left)),
    right: Math.max(...states.map((state) => state.right)),
    inDocumentBounds: states.every((state) => state.inDocumentBounds),
  };
}

async function auditPage(page: Page, url: string, scrollMode: "slow" | "fast") {
  await page.goto(url, { waitUntil: "networkidle" });
  await settleFullPage(page, scrollMode);
  const result: Record<string, ElementState> = {};
  for (const target of targets) {
    result[target.name] = await inspect(target.locate(page));
  }
  return result;
}

test.describe("preview v2 final visual regression", () => {
  test.setTimeout(90_000);

  test.beforeEach(async ({ page }) => {
    await mkdir(auditDir, { recursive: true });
    await page.route("**/*", async (route) => {
      const url = route.request().url();
      if (prohibitedRuntimeRequest.test(url)) {
        throw new Error(`Preview attempted a prohibited runtime request: ${url}`);
      }
      await route.continue();
    });
  });

  test("motion on preserves every element from motion off after a fast scroll", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop", "Detailed comparison uses the approved 1440x900 baseline.");
    const motionOff = await auditPage(page, "/preview/site-v2/?motion=off", "slow");
    await page.screenshot({ path: path.join(auditDir, "motion-off-1440x900.png"), fullPage: true });
    const motionOn = await auditPage(page, "/preview/site-v2/", "fast");
    await page.screenshot({ path: path.join(auditDir, "motion-on-settled-1440x900.png"), fullPage: true });

    const report = Object.fromEntries(targets.map(({ name }) => [name, {
      motionOff: motionOff[name],
      motionOn: motionOn[name],
    }]));
    await writeFile(path.join(auditDir, "visibility-report.json"), `${JSON.stringify(report, null, 2)}\n`);

    for (const target of targets) {
      expect(motionOff[target.name].visible, `${target.name} must be visible with motion off`).toBe(true);
      expect(motionOn[target.name].visible, `${target.name} must be visible after motion settles`).toBe(true);
      expect(motionOn[target.name].count, `${target.name} count changed`).toBe(motionOff[target.name].count);
      if (target.expectedCount) expect(motionOn[target.name].count, `${target.name} count`).toBe(target.expectedCount);
    }
  });

  test("critical content survives keyboard scrolling and viewport resize", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop", "Resize path starts from desktop.");
    await page.goto("/preview/site-v2/", { waitUntil: "networkidle" });
    await page.keyboard.press("End");
    await page.waitForTimeout(1_800);
    await expect(page.getByTestId("preview-footer")).toBeVisible();
    await page.keyboard.press("Home");
    await page.keyboard.press("PageDown");
    await page.keyboard.press("PageDown");
    await page.keyboard.press("PageUp");
    for (const viewport of [{ width: 1024, height: 1366 }, { width: 430, height: 932 }, { width: 1440, height: 900 }]) {
      await page.setViewportSize(viewport);
      await page.waitForTimeout(250);
      await expect(page.getByTestId("preview-hero-title")).toBeVisible();
      await expect(page.getByTestId("preview-footer")).toBeAttached();
    }
  });

  test("reduced motion and coarse pointers keep the complete page visible", async ({ page }, testInfo) => {
    test.skip(!["mobile-390", "mobile-430"].includes(testInfo.project.name), "Coarse-pointer audit runs on touch projects.");
    await page.emulateMedia({ reducedMotion: "reduce" });
    const states = await auditPage(page, "/preview/site-v2/", "fast");
    for (const target of targets.filter((target) => !["headerNavigation", "headerActions", "footerMap", "numbersChart"].includes(target.name))) {
      expect(
        states[target.name].visible,
        `${target.name} must remain visible on ${testInfo.project.name}: ${JSON.stringify(states[target.name])}`,
      ).toBe(true);
    }
    await expect(page.locator('[data-reduced-motion="true"]')).toBeVisible();
  });
});
