import { expect, test } from "@playwright/test";

test("official home uses the approved v2 visual with real navigation", async ({ page }) => {
  await page.goto("/leads");

  await expect(
    page.getByRole("heading", { name: "Prospecta Nicho: encontre oportunidades B2B em todo o Brasil." }),
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: "Veja a qualidade dos nossos dados antes de decidir." })).toBeVisible();
  await expect(page.getByTestId("preview-segments")).toBeVisible();
  await expect(page.getByTestId("preview-plans")).toBeVisible();
  await expect(page.getByTestId("preview-final-cta")).toBeVisible();

  await expect(page.getByText("Versão visual de teste", { exact: false })).toHaveCount(0);
  await expect(page.getByRole("dialog", { name: "Preferências de cookies" })).toBeVisible();
  await expect(page.getByTestId("preview-header-actions").getByRole("link", { name: /Falar com um especialista/ })).toHaveAttribute(
    "href",
    /\/solicitar-planilha\?source=home-v2-header/,
  );
  await expect(page.getByTestId("preview-hero").getByRole("link", { name: /Ver planos e bases/ })).toHaveAttribute(
    "href",
    /\/solicitar-planilha\?source=home-v2-hero/,
  );
  await expect(page.locator('a[href="/sites"]')).toHaveCount(1);
});

test("official home remains usable on mobile without horizontal overflow", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "O cenário define seu próprio viewport móvel.");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/leads");

  await expect(page.getByTestId("preview-hero-title")).toBeVisible();
  await page.getByRole("button", { name: "Abrir menu" }).click();
  await expect(page.getByTestId("preview-header").locator('a[href="/solicitar-planilha?source=home-v2-header-mobile"]')).toHaveAttribute(
    "href",
    "/solicitar-planilha?source=home-v2-header-mobile",
  );

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
  expect(overflow).toBe(false);
});

test("frozen preview route stays available and demonstrative", async ({ page }) => {
  await page.goto("/preview/site-v2/");

  await expect(page.getByText("Versão visual de teste", { exact: false })).toBeAttached();
  await expect(page.getByRole("button", { name: /Montar minha base/ })).toBeVisible();
});
