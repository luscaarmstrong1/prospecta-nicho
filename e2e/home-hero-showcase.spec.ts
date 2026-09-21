import { expect, test } from "@playwright/test";

test("primeira dobra exibe showcase curado com busca, filtros e CTAs", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByTestId("preview-hero-title")).toBeVisible();
  await expect(page.getByText("Oportunidades em todo o Brasil")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Explore o mercado B2B em escala nacional." })).toBeVisible();
  await expect(page.getByRole("link", { name: /Montar minha base/i }).first()).toHaveAttribute(
    "href",
    "/solicitar-planilha?source=home-v2-hero",
  );
  await expect(page.getByRole("link", { name: /Ver como funciona/i })).toHaveAttribute("href", "#amostra");

  await expect(page.getByTestId("preview-map")).toBeVisible();
  await expect(page.getByTestId("preview-numbers")).toBeVisible();
  await expect(page.getByTestId("preview-segments")).toBeVisible();
  await expect(page.getByRole("link", { name: /Receber amostra/i })).toHaveAttribute(
    "href",
    "/solicitar-planilha?source=home-v2-amostra",
  );
});
