import { expect, test } from "@playwright/test";

test.describe("ProspectaNicho Preview V2 - Gemini Candidate", () => {
  test("route loads cleanly, has no errors, isolates integrations and demonstrates actions safely", async ({ page }) => {
    const integrationRequests: string[] = [];
    const consoleErrors: string[] = [];

    page.on("request", (request) => {
      const url = request.url();
      if (/supabase\.co|\/functions\/v1|\/api\//i.test(url)) {
        integrationRequests.push(url);
      }
    });

    page.on("console", (msg) => {
      if (msg.type() === "error") {
        consoleErrors.push(msg.text());
      }
    });

    // 1. Visit Gemini candidate route with motion=off for deterministic testing
    await page.goto("/preview/site-v2-gemini/?motion=off", { waitUntil: "networkidle" });

    // 2. Verify banner and key headings
    await expect(page.getByText("Versão visual de teste Gemini", { exact: false })).toBeAttached();
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Explore o");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("mercado B2B");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("em escala nacional.");

    // 3. Verify sections present
    await expect(page.getByRole("heading", { name: "Veja a qualidade antes de decidir." })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Segmentos em destaque" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Nossas bases e planos" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Quem usa, recomenda." })).toBeVisible();

    // 4. Verify Interactive Modal on Action Clicks
    const ctaButton = page.getByRole("button", { name: /Montar Minha Base/i }).first();
    await expect(ctaButton).toBeVisible();
    await ctaButton.click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText("Montar minha base");
    await expect(dialog).toContainText("Nenhuma ação real ou envio de dados é realizado");

    // Close modal
    await page.getByRole("button", { name: /Fechar modal/i }).click();
    await expect(dialog).not.toBeVisible();

    // 5. Verify demonstrative newsletter in footer
    const newsletterInput = page.getByLabel("Seu melhor e-mail");
    await expect(newsletterInput).toBeVisible();
    await newsletterInput.fill("contato@empresa.com.br");

    const subscribeBtn = page.getByRole("button", { name: /Quero receber/i });
    await subscribeBtn.click();
    await expect(page.getByText("Demonstração — nenhum dado foi enviado.")).toBeVisible();

    // 6. Assert complete isolation from backend/supabase
    expect(integrationRequests).toEqual([]);

    // Filter out potential non-critical dev/favicon warnings
    const criticalErrors = consoleErrors.filter(
      (err) => !err.includes("favicon") && !err.includes("chrome-extension")
    );
    expect(criticalErrors).toEqual([]);
  });

  const viewports = [
    { name: "desktop-1440", width: 1440, height: 900 },
    { name: "tablet-1024", width: 1024, height: 768 },
    { name: "mobile-430", width: 430, height: 932 },
    { name: "mobile-390", width: 390, height: 844 },
  ];

  for (const vp of viewports) {
    test(`zero horizontal scroll on ${vp.name} (${vp.width}px)`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto("/preview/site-v2-gemini/?motion=off", { waitUntil: "networkidle" });

      const overflowX = await page.evaluate(() => {
        return document.documentElement.scrollWidth > window.innerWidth;
      });

      expect(overflowX).toBeFalsy();
    });
  }
});
