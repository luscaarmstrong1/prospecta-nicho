import { expect, test } from "@playwright/test";

for (const width of [390, 768, 1024, 1440]) {
  test(`screenshot visual da home em ${width}px`, async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop", "A captura define seu próprio viewport.");
    await page.setViewportSize({ width, height: width < 700 ? 920 : 1000 });
    await page.goto("/");
    await expect(page.getByTestId("preview-hero-title")).toBeVisible();
    await expect(page.getByTestId("motion-segment-card").first()).toBeVisible();
    await expect(page.locator('[data-test-id="whatsapp-floating-button"]')).toBeVisible();
    await page.screenshot({ path: testInfo.outputPath(`home-${width}.png`), fullPage: true });
  });
}
