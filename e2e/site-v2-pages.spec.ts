import { test, expect } from "@playwright/test";

const marketingRoutes = [
  "/solucoes",
  "/solucoes/sites-landing-pages",
  "/segmentos",
  "/planos",
  "/conteudo",
  "/sobre",
];

const viewports = [
  { name: "desktop-1920", width: 1920, height: 1080 },
  { name: "desktop-1440", width: 1440, height: 900 },
  { name: "tablet-1024", width: 1024, height: 1366 },
  { name: "mobile-430", width: 430, height: 932 },
  { name: "mobile-390", width: 390, height: 844 },
];

test.describe("ProspectaNicho V2 Marketing Pages - Visual & Quality QA", () => {
  for (const route of marketingRoutes) {
    test(`Route ${route} renders without console errors and has no horizontal overflow across viewports`, async ({ page }) => {
      const consoleErrors: string[] = [];
      page.on("pageerror", (err) => consoleErrors.push(err.message));

      await page.goto(route, { waitUntil: "networkidle" });
      expect(consoleErrors).toHaveLength(0);

      // Verify header and footer are present
      await expect(page.getByTestId("site-v2-header")).toBeVisible();
      await expect(page.getByTestId("site-v2-footer")).toBeVisible();

      // Check viewports for overflow
      for (const vp of viewports) {
        await page.setViewportSize({ width: vp.width, height: vp.height });
        await page.waitForTimeout(150);

        const hasHorizontalScroll = await page.evaluate(() => {
          return document.documentElement.scrollWidth > document.documentElement.clientWidth + 1;
        });
        expect(hasHorizontalScroll, `Horizontal scroll detected on ${route} at ${vp.name}`).toBe(false);
      }
    });
  }

  test("Segmentos search input and filter cluster renders correctly", async ({ page }) => {
    await page.goto("/segmentos", { waitUntil: "networkidle" });
    const searchInput = page.getByPlaceholder(/Buscar segmento/i);
    await expect(searchInput).toBeVisible();
    await expect(page.getByText(/Todas as regiões/i)).toBeVisible();
    await expect(page.getByText(/Ordenar por relevância/i)).toBeVisible();
  });

  test("Planos FAQ accordion and pricing cards render cleanly", async ({ page }) => {
    await page.goto("/planos", { waitUntil: "networkidle" });
    await expect(page.getByText("R$ 149")).toBeVisible();
    await expect(page.getByText("Sob consulta")).toBeVisible();
    await expect(page.getByText(/Perguntas frequentes/i)).toBeVisible();
  });
});
