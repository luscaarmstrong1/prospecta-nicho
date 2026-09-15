import { expect, test } from "@playwright/test";

test.skip(process.env.NEXT_PUBLIC_RUNTIME_TARGET !== "github-pages", "Executar somente contra export GitHub Pages.");

test("login admin estatico chama admin-login e nao expõe service role", async ({ page }) => {
  await page.route("**/functions/v1/admin-login", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true }) });
  });
  await page.goto("/prospecta-nicho/admin/login/");
  await page.getByLabel(/Token administrativo/i).fill("token-de-teste");
  await page.getByRole("button", { name: /Entrar/i }).click();
  await page.waitForURL(/\/prospecta-nicho\/admin\/$/);
  expect(await page.evaluate(() => document.documentElement.innerHTML)).not.toContain("SUPABASE_SERVICE_ROLE_KEY");
});
