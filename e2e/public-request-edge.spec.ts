import { expect, test } from "@playwright/test";

test.skip(process.env.NEXT_PUBLIC_RUNTIME_TARGET !== "github-pages", "Executar somente contra export GitHub Pages.");

test("solicitação unificada chama Supabase Function em vez de API local", async ({ page }) => {
  await page.route("**/functions/v1/public-create-request", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ ok: true, publicCode: "PN-EDGE01", crm: { publicCode: "PN-EDGE01" } }),
    });
  });
  await page.goto("/prospecta-nicho/solicitar-planilha/?segment=agencias&source=e2e-static");
  await page.getByRole("button", { name: /Base personalizada/i }).click();
  await page.getByRole("radio", { name: /Agências/i }).check();
  await page.getByLabel(/Cidade ou região/i).fill("Campinas");
  await page.getByLabel("UF").selectOption("SP");
  await page.getByLabel("Nome").fill("Cliente Static");
  await page.getByRole("textbox", { name: "WhatsApp" }).fill("(19) 99999-9999");
  await page.getByLabel(/Quantidade aproximada/i).selectOption({ index: 1 });
  await page.getByLabel(/Li e concordo/i).check();
  await page.getByRole("button", { name: /Solicitar base personalizada/i }).click();
  await page.waitForURL(/\/pedido\/?\?codigo=PN-EDGE01/);
  expect(page.url()).not.toContain("/api/");
});
