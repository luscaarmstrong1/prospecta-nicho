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
