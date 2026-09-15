import { expect, test } from "@playwright/test";

test.skip(process.env.NEXT_PUBLIC_RUNTIME_TARGET !== "github-pages", "Executar somente contra export GitHub Pages.");

test("pagina de pedido consulta protocolo por Edge Function", async ({ page }) => {
  await page.route("**/functions/v1/public-request-status?codigo=PN-EDGE01", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ ok: true, request: { publicCode: "PN-EDGE01", status: "analysis", segment: "agencias", city: "Campinas", uf: "SP" } }),
    });
  });
  await page.goto("/prospecta-nicho/pedido/?codigo=PN-EDGE01");
  await expect(page.getByText(/Status atual: analysis/i)).toBeVisible();
});
