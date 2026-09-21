import { expect, test } from "@playwright/test";

test("home mantem ordem comercial final e remove FAQ da pagina inicial", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByTestId("preview-hero-title")).toBeVisible();
  await expect(page.getByText(/Oportunidades em todo o Brasil/)).toBeVisible();
  await expect(page.getByRole("heading", { name: /Explore o mercado B2B em escala nacional/i })).toBeVisible();
  await expect(page.getByText("Antes de comecar, voce talvez queira saber.")).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Ver todas as duvidas" })).toHaveCount(0);

  const sectionTops = await page.evaluate(() => {
    const selectors = [
      '[data-testid="preview-hero-title"]',
      '[data-testid="preview-numbers"]',
      '[data-testid="preview-sample"]',
      '[data-testid="preview-segments"]',
      '[data-testid="preview-plans"]',
      '[data-testid="preview-testimonials"]',
      '[data-testid="preview-final-cta"]',
    ];

    return selectors.map((selector) => {
      const element = document.querySelector(selector);
      if (!element) throw new Error(`Secao nao encontrada: ${selector}`);
      return element.getBoundingClientRect().top + window.scrollY;
    });
  });

  expect(sectionTops).toEqual([...sectionTops].sort((a, b) => a - b));
});

test("demonstracao da entrega exibe planilha mascarada sem coluna de site", async ({ page }) => {
  await page.goto("/");

  const preview = page.getByLabel("Demonstração de planilha comercial");
  await expect(preview).toBeVisible();
  await expect(preview).toContainText(/Amostra de base/i);
  await expect(preview).toContainText(/Dados reais e atualizados/i);
  await expect(preview.locator("thead")).not.toContainText("Site");
  await expect(preview).toContainText("Empresa");
  await expect(preview).toContainText("Cidade");
  await expect(page.getByRole("link", { name: /Receber amostra/i })).toHaveAttribute(
    "href",
    "/solicitar-planilha?source=home-v2-amostra",
  );
});
