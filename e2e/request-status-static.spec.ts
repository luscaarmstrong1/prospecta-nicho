import { expect, test } from "@playwright/test";

test.skip(process.env.NEXT_PUBLIC_RUNTIME_TARGET !== "github-pages", "Executar somente contra export GitHub Pages.");

test("página de pedido consulta protocolo por Edge Function", async ({ page }) => {
  await page.route("**/functions/v1/public-request-status?codigo=PN-EDGE0001", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        request: {
          publicCode: "PN-EDGE0001",
          status: "analysis",
          statusLabel: "Em análise",
          segment: "agencias",
          city: "Campinas",
          uf: "SP",
        },
      }),
    });
  });
  await page.goto("/prospecta-nicho/pedido/?codigo=PN-EDGE0001");
  await expect(page.getByRole("heading", { name: /Status atual: Em análise/i })).toBeVisible();
});
