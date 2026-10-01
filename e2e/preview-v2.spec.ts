import { expect, test } from "@playwright/test";

test("preview v2 is navigable and keeps actions demonstrative", async ({ page }) => {
  const integrationRequests: string[] = [];
  page.on("request", (request) => {
    const url = request.url();
    if (/supabase\.co|\/functions\/v1|\/api\//i.test(url)) integrationRequests.push(url);
  });

  await page.goto("/preview/site-v2/");

  await expect(page.getByText("Versão visual de teste", { exact: false })).toBeAttached();
  await expect(page.getByRole("heading", { name: "Explore o mercado B2B em escala nacional." })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Veja a qualidade antes de decidir." })).toBeVisible();

  await page.getByRole("button", { name: /Montar minha base/ }).click();
  await expect(page.getByRole("dialog")).toContainText("Nenhum dado foi enviado");
  await page.getByRole("button", { name: "Continuar explorando" }).click();

  await page.getByLabel("Seu melhor e-mail").fill("teste@exemplo.com");
  await page.getByRole("button", { name: /Quero receber/ }).click();
  await expect(page.getByRole("button", { name: "Enviando..." })).toBeVisible();
  await expect(page.getByText("Demonstração — nenhum dado foi enviado.")).toBeVisible();
  expect(integrationRequests).toEqual([]);
});
