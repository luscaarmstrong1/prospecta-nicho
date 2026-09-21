import { expect, test } from "@playwright/test";

test.skip(
  process.env.NEXT_PUBLIC_RUNTIME_TARGET !== "github-pages",
  "Executar somente contra export GitHub Pages.",
);

test("home estatica carrega sem chamar API Route local", async ({ page }) => {
  const apiRequests: string[] = [];

  page.on("request", (request) => {
    const pathname = new URL(request.url()).pathname;
    if (pathname.startsWith("/api/")) {
      apiRequests.push(request.url());
    }
  });

  await page.goto("/prospecta-nicho/");

  await expect(page.getByRole("heading", { name: /Explore o mercado B2B em escala nacional/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /Montar minha base/i }).first()).toBeVisible();
  expect(apiRequests).toEqual([]);
});
