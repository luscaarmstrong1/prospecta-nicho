import { expect, test } from "@playwright/test";

test("home mantem ordem comercial final e remove FAQ da pagina inicial", async ({ page }) => {
  await page.goto("/");

  await expect(page.locator('[data-test-id="curated-showcase-hero"]')).toBeVisible();
  await expect(page.getByText(/INTELIG.NCIA COMERCIAL B2B/)).toBeVisible();
  await expect(page.getByRole("heading", { name: /Escolha um nicho\. Receba uma base pronta para prospec..o\./ })).toBeVisible();
  await expect(page.getByText("Antes de comecar, voce talvez queira saber.")).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Ver todas as duvidas" })).toHaveCount(0);

  const sectionTops = await page.evaluate(() => {
    const selectors = [
      ".curated-hero",
      "section:has(.delivery-preview)",
      "section:has(.product-signal-grid)",
      ".conversion-system-section",
      ".segment-band",
      ".sample-section",
      ".final-cta",
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

  const preview = page.locator(".delivery-preview");
  await expect(preview.getByText(/Pr.via da entrega/)).toBeVisible();
  await expect(preview.getByText(/Dados fict.cios e mascarados/)).toBeVisible();
  await expect(preview.locator(".delivery-row").nth(0)).not.toContainText("Site");
  await expect(preview).toContainText("Empresa");
  await expect(preview).toContainText("Status");
  await expect(page.getByRole("link", { name: /Solicitar tabela gr.tis de teste/i })).toHaveAttribute(
    "href",
    "/produtos/amostra-gratuita",
  );
});
