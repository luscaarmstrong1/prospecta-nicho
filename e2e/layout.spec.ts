import { expect, test } from "@playwright/test";

test("home não cria scroll horizontal e mantém dez segmentos", async ({ page }) => {
  await page.goto("/");
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
  await expect(page.locator(".segment-labels a")).toHaveCount(10);
});

test("cards de segmento apontam para solicitação rápida", async ({ page }) => {
  await page.goto("/");
  const hrefs = await page.locator(".segment-labels a").evaluateAll((links) =>
    links.map((link) => link.getAttribute("href") || ""),
  );
  expect(hrefs.every((href) => href.startsWith("/solicitar-planilha?segment="))).toBe(true);
});

test("imagem da solicitação rápida muda conforme segmento escolhido", async ({ page }) => {
  await page.goto("/");
  const image = page.locator(".teaser-segment-media img");
  await expect(image).toHaveAttribute("src", /agencias\.webp/);

  await page.getByRole("button", { name: "Contabilidades" }).click();
  await expect(image).toHaveAttribute("src", /contabilidades\.webp/);
});

test("home segue ordem final sem seção de FAQ", async ({ page }) => {
  await page.goto("/");

  await expect(page.locator(".hero .eyebrow").first()).toContainText(
    "INTELIGÊNCIA COMERCIAL PARA QUEM PRECISA CRESCER",
  );
  await expect(page.getByText("Antes de começar, você talvez queira saber.")).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Ver todas as dúvidas" })).toHaveCount(0);

  const sectionTops = await page.evaluate(() => {
    const selectors = [
      "section.hero",
      ".builder-teaser-section",
      "section:has(.delivery-preview)",
      "section:has(.product-signal-grid)",
      ".conversion-system-section",
      ".segment-band",
      ".sample-section",
      ".final-cta",
    ];

    return selectors.map((selector) => {
      const element = document.querySelector(selector);
      if (!element) throw new Error(`Seção não encontrada: ${selector}`);
      return element.getBoundingClientRect().top + window.scrollY;
    });
  });

  expect(sectionTops).toEqual([...sectionTops].sort((a, b) => a - b));
});

test("chips de período da solicitação rápida ficam alinhados no desktop", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "Alinhamento em linha única é exigido apenas no desktop.");

  await page.goto("/");
  const chips = page.locator(".quick-period-options .choice-chip");
  await expect(chips).toHaveCount(5);

  const tops = await chips.evaluateAll((elements) =>
    elements.map((element) => Math.round(element.getBoundingClientRect().top)),
  );

  expect(Math.max(...tops) - Math.min(...tops)).toBeLessThanOrEqual(1);
});

test("whatsapp flutuante permanece fixo e visível durante scroll", async ({ page }) => {
  await page.goto("/");
  const whatsapp = page.locator(".whatsapp-floating");
  await expect(whatsapp).toBeVisible();
  await expect(whatsapp).toHaveAttribute("href", /^https:\/\/wa\.me\//);

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
    expect(sample.zIndex).toBeGreaterThanOrEqual(80);
    expect(sample.width).toBeGreaterThanOrEqual(54);
    expect(sample.height).toBeGreaterThanOrEqual(54);
  }

  expect(new Set(samples.map((sample) => sample.top)).size).toBe(1);
});
