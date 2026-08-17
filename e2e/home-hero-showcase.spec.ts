import { expect, test } from "@playwright/test";

const expectedCards = [
  ["agencias", "Base para agências"],
  ["contabilidades", "Base para contabilidades"],
  ["energia-solar", "Base para energia solar"],
  ["erp-e-sistemas", "Base para ERP e sistemas"],
  ["maquininhas", "Base para maquininhas"],
  ["comunicacao-visual", "Base para comunicação visual"],
] as const;

test("primeira dobra exibe showcase curado com busca, filtros e CTAs", async ({ page }) => {
  await page.goto("/");

  await expect(page.locator('[data-test-id="curated-showcase-hero"]')).toBeVisible();
  await expect(page.getByText("INTELIGÊNCIA COMERCIAL B2B")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Escolha um nicho. Receba uma base pronta para prospecção." })).toBeVisible();
  await expect(page.getByRole("link", { name: /Solicitar uma base/i })).toHaveAttribute("href", "/solicitar-planilha");
  await expect(page.getByRole("link", { name: /Receber amostra grátis/i })).toHaveAttribute(
    "href",
    "/produtos/amostra-gratuita",
  );

  await expect(page.locator(".showcase-card")).toHaveCount(6);
  for (const [slug, title] of expectedCards) {
    const card = page.locator(`.showcase-card[data-segment="${slug}"]`);
    await expect(card).toContainText(title);
    await expect(card.locator("img").first()).toHaveJSProperty("complete", true);
    await expect(card).toHaveAttribute("href", `/solicitar-planilha?segment=${slug}&source=showcase-grid`);
  }

  await page.getByRole("button", { name: "Agências" }).click();
  await expect(page.locator(".showcase-card")).toHaveCount(1);
  await expect(page.locator(".showcase-card")).toContainText("Base para agências");

  await page.getByRole("button", { name: "Todos" }).click();
  await page.getByPlaceholder("Buscar por segmento, cidade ou objetivo comercial...").fill("solar");
  await expect(page.locator(".showcase-card")).toHaveCount(1);
  await expect(page.locator(".showcase-card")).toContainText("Base para energia solar");

  await page.getByPlaceholder("Buscar por segmento, cidade ou objetivo comercial...").fill("termo inexistente");
  await expect(page.locator(".showcase-empty")).toContainText(
    "Nenhuma base encontrada para esse termo. Você ainda pode solicitar uma base personalizada.",
  );
  await expect(page.getByRole("link", { name: "Montar base personalizada" })).toHaveAttribute(
    "href",
    "/montar-minha-base",
  );
});
