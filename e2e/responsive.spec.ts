import { expect, test } from "@playwright/test";

const viewports = [
  { width: 360, height: 800 },
  { width: 390, height: 844 },
  { width: 430, height: 932 },
  { width: 768, height: 1024 },
  { width: 820, height: 1180 },
  { width: 1024, height: 768 },
  { width: 1280, height: 800 },
  { width: 1440, height: 900 },
  { width: 1920, height: 1080 },
];

test("home preserva responsividade visual nos principais tamanhos", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "A matriz define todos os viewports explicitamente.");
  test.setTimeout(60_000);

  for (const viewport of viewports) {
    await page.setViewportSize(viewport);
    await page.goto("/");

    await expect(page.getByTestId("preview-hero")).toBeVisible();
    await expect(page.getByTestId("motion-segment-card").first()).toBeVisible();
    await expect(page.getByLabel("Demonstração de planilha comercial")).toBeVisible();
    await expect(page.locator('[data-test-id="whatsapp-floating-button"]')).toBeVisible();

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(1);
  }
});

test("segmentos e planos se mantêm íntegros sem quebrar a largura", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByTestId("motion-segment-card")).toHaveCount(4);
  await expect(page.getByTestId("preview-plans").getByRole("heading", { level: 3 })).toHaveCount(4);

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
});
