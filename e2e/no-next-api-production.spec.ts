import { expect, test } from "@playwright/test";

test.skip(process.env.NEXT_PUBLIC_RUNTIME_TARGET !== "github-pages", "Executar somente contra export GitHub Pages.");

test("runtime GitHub Pages resolve backend pelo Supabase", async ({ page }) => {
  await page.goto("/prospecta-nicho/health/");
  const html = await page.content();
  expect(html).not.toContain("/_next/server/app/api");
  expect(html).not.toContain("SUPABASE_SERVICE_ROLE_KEY");
});
