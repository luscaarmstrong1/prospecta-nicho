import { expect, test } from "@playwright/test";

test("solicitação rápida salva antes de exibir WhatsApp", async ({ page }) => {
  await page.goto("/solicitar-planilha?segment=agencias&source=e2e");

  await expect(page.getByRole("heading", { name: /Solicite uma base para Agências/i })).toBeVisible();
  await page.getByLabel("Cidade ou região").fill("Campinas");
  await page.getByLabel("UF").fill("SP");
  await page.getByLabel("Nome").fill("Cliente Teste");
  await page.getByRole("textbox", { name: "WhatsApp" }).fill("(19) 99999-9999");
  await page.getByLabel(/Li e concordo/i).check();
  await page.getByRole("button", { name: /Solicitar esta planilha/i }).click();

  await expect(page.getByRole("heading", { name: /Sua planilha entrou para validação/i })).toBeVisible();
  await expect(page.getByLabel("Resumo da solicitação")).toContainText("Agências");
  await expect(page.getByText(/Protocolo/i)).toBeVisible();
});

test("formulário rápido oferece refinamento completo", async ({ page }) => {
  await page.goto("/solicitar-planilha?segment=contabilidades&source=e2e");
  await expect(page.getByRole("link", { name: /Quero refinar mais critérios/i })).toHaveAttribute(
    "href",
    /\/montar-minha-base\?segment=contabilidades/,
  );
});

test("solicitação rápida exibe imagem do segmento selecionado", async ({ page }) => {
  await page.goto("/solicitar-planilha?segment=energia-solar&source=e2e");
  await expect(page.locator(".quick-segment-hero img")).toHaveAttribute("src", /energia-solar\.webp/);
});
