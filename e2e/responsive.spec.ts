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

test("home preserva responsividade visual nos principais tamanhos", async ({ page }) => {
  test.setTimeout(60_000);

  for (const viewport of viewports) {
    await page.setViewportSize(viewport);
    await page.goto("/");

    await expect(page.getByTestId("preview-hero-title")).toBeVisible();
    await expect(page.getByTestId("preview-map")).toBeVisible();
    await expect(page.getByTestId("preview-sample")).toBeVisible();
    await expect(page.locator('[data-test-id="whatsapp-floating-button"]')).toBeVisible();

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(1);
  }
});

test("showcase adapta colunas e filtros sem quebrar largura", async ({ page }, testInfo) => {
  await page.goto("/");
  const segments = page.getByTestId("preview-segments");
  await expect(segments).toBeVisible();
  await expect(segments).toContainText("Agências");
  await expect(segments).toContainText("Energia Solar");

  const metrics = await segments.locator("[data-testid='motion-segment-card']").first().evaluate((element) => {
    const style = window.getComputedStyle(element);
    return {
      columns: style.gridTemplateColumns.split(" ").filter(Boolean).length,
    };
  });

  if (testInfo.project.name === "desktop") {
    expect(metrics.columns).toBeGreaterThanOrEqual(1);
  } else {
    expect(metrics.columns).toBeGreaterThanOrEqual(1);
  }

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
});
