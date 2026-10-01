import { expect, test } from "@playwright/test";

test("home não cria scroll horizontal e mantém quatro segmentos", async ({ page }) => {
  await page.goto("/");
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
  await expect(page.getByTestId("motion-segment-card")).toHaveCount(4);
});

test("cards de segmento apontam para a solicitação correta", async ({ page }) => {
  await page.goto("/");
  const hrefs = await page.getByTestId("motion-segment-card").getByRole("link", { name: /Acessar segmento/i }).evaluateAll(
    (links) => links.map((link) => link.getAttribute("href") || ""),
  );
  expect(hrefs).toHaveLength(4);
  expect(hrefs.every((href) => href.startsWith("/solicitar-planilha?segment="))).toBe(true);
});

test("home segue ordem final sem seção de FAQ", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByTestId("preview-hero").getByText("Bases B2B segmentadas")).toBeVisible();
  await expect(page.getByText("Antes de começar, você talvez queira saber.")).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Ver todas as dúvidas" })).toHaveCount(0);

  const sectionTops = await page.evaluate(() => {
    const testIds = [
      "preview-hero",
      "preview-sample",
      "preview-segments",
      "preview-plans",
      "preview-testimonials",
      "preview-final-cta",
    ];

    return testIds.map((testId) => {
      const element = document.querySelector(`[data-testid="${testId}"]`);
      if (!element) throw new Error(`Seção não encontrada: ${testId}`);
      return element.getBoundingClientRect().top + window.scrollY;
    });
  });

  expect(sectionTops).toEqual([...sectionTops].sort((a, b) => a - b));
});

test("cards de planos ficam alinhados no desktop", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "Alinhamento dos planos é validado no desktop.");

  await page.goto("/");
  const planHeadings = page.getByTestId("preview-plans").getByRole("heading", { level: 3 });
  await expect(planHeadings).toHaveCount(4);

  const tops = await planHeadings.evaluateAll((elements) =>
    elements.map((element) => Math.round(element.closest("article")?.getBoundingClientRect().top ?? -1)),
  );
  expect(Math.max(...tops) - Math.min(...tops)).toBeLessThanOrEqual(1);
});

test("whatsapp flutuante permanece fixo e visível durante scroll", async ({ page }) => {
  await page.goto("/");
  const whatsapp = page.locator('[data-test-id="whatsapp-floating-button"]');
  await expect(whatsapp).toBeVisible();
  await expect(whatsapp).toHaveAttribute("href", /^https:\/\/wa\.me\/5535998905896\?text=/);

  const samples = [];
  for (const scrollY of [0, 800, 1800]) {
    await page.evaluate((value) => window.scrollTo(0, value), scrollY);
    await page.waitForTimeout(120);
    samples.push(
      await whatsapp.evaluate((element) => {
        const style = window.getComputedStyle(element);
        const rect = element.getBoundingClientRect();
        return {
          display: style.display,
          visibility: style.visibility,
          opacity: style.opacity,
          position: style.position,
          zIndex: Number(style.zIndex),
          top: Math.round(rect.top),
          width: Math.round(rect.width),
          height: Math.round(rect.height),
        };
      }),
    );
  }

  for (const sample of samples) {
    expect(sample.display).not.toBe("none");
    expect(sample.visibility).toBe("visible");
    expect(sample.opacity).toBe("1");
    expect(sample.position).toBe("fixed");
    expect(sample.zIndex).toBeGreaterThanOrEqual(999);
    expect(sample.width).toBeGreaterThanOrEqual(54);
    expect(sample.height).toBeGreaterThanOrEqual(54);
  }

  expect(new Set(samples.map((sample) => sample.top)).size).toBe(1);
});

