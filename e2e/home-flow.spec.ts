import { expect, test } from "@playwright/test";

test("home mantém a sequência comercial atual e não exibe FAQ", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByTestId("preview-hero")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Prospecta Nicho: encontre oportunidades B2B em todo o Brasil." }),
  ).toBeVisible();
  await expect(page.getByText("Antes de começar, você talvez queira saber.")).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Ver todas as dúvidas" })).toHaveCount(0);

  const sectionTops = await page.evaluate(() => {
    const testIds = [
      "preview-hero",
      "preview-sample",
      "preview-segments",
      "preview-plans",
      "preview-testimonials",
      "preview-final-cta",
    ];

    return testIds.map((testId) => {
      const element = document.querySelector(`[data-testid="${testId}"]`);
      if (!element) throw new Error(`Seção não encontrada: ${testId}`);
      return element.getBoundingClientRect().top + window.scrollY;
    });
  });

  expect(sectionTops).toEqual([...sectionTops].sort((a, b) => a - b));
});

test("amostra apresenta tabela comercial e CTA funcional", async ({ page }) => {
  await page.goto("/");

  const sample = page.getByTestId("preview-sample");
  const table = sample.getByLabel("Demonstração de planilha comercial");
  await expect(sample.getByRole("heading", { name: "Veja a qualidade dos nossos dados antes de decidir." })).toBeVisible();
  await expect(table).toBeVisible();
  await expect(table).toContainText("CNPJ");
  await expect(table).toContainText("Razão Social");
  await expect(table).toContainText("Telefone");
  await expect(sample.getByRole("link", { name: /Receber amostra grátis/i })).toHaveAttribute(
    "href",
    "/solicitar-planilha?source=home-v2-amostra",
  );
});
