import { expect, test } from "@playwright/test";

test("official home uses the approved v2 visual with real navigation", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Explore o mercado B2B em escala nacional." })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Veja a qualidade antes de decidir." })).toBeVisible();
  await expect(page.getByTestId("preview-segments")).toBeVisible();
  await expect(page.getByTestId("preview-plans")).toBeVisible();
  await expect(page.getByTestId("preview-final-cta")).toBeVisible();

  await expect(page.getByText("Versão visual de teste", { exact: false })).toHaveCount(0);

  const menuButton = page.getByRole("button", { name: "Abrir menu" });
  if ((await menuButton.count()) > 0) {
    await expect(menuButton).toHaveAttribute("aria-expanded", "false");
    await menuButton.click();
    await expect(page.locator('a[href="/solicitar-planilha?source=header-mobile-v2"]')).toBeVisible();
  } else {
    await expect(page.getByRole("link", { name: /Criar minha conta/ }).first()).toHaveAttribute(
      "href",
      /\/solicitar-planilha\?source=header-v2/,
    );
  }

  await expect(page.getByRole("link", { name: /Montar minha base/ }).first()).toHaveAttribute(
    "href",
    /\/solicitar-planilha\?source=home-v2-hero/,
  );
  await expect(page.getByRole("link", { name: /Entrar/ }).first()).toHaveAttribute("href", "/admin/login");
  await expect(page.locator('a[href="/solucoes/agencias-de-marketing"]')).toHaveCount(1);
});

test("official home remains usable on mobile without horizontal overflow", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Explore o mercado B2B em escala nacional." })).toBeVisible();
  await page.getByRole("button", { name: "Abrir menu" }).click();
  await expect(page.getByRole("link", { name: "Criar minha conta" })).toBeVisible();

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
  expect(overflow).toBe(false);
});

test("frozen preview route stays available and demonstrative", async ({ page }) => {
  await page.goto("/preview/site-v2/");

  await expect(page.getByText("Versão visual de teste", { exact: false })).toBeAttached();
  await expect(page.getByRole("button", { name: /Montar minha base/ })).toBeVisible();
});
