import { expect, test } from "@playwright/test";

async function fillCommonFields(page: import("@playwright/test").Page) {
  const segmentGroup = page.getByRole("group", { name: /Segmento/ });
  await segmentGroup.getByText("Agências", { exact: true }).click();
  await expect(
    segmentGroup.getByRole("radio", { name: "Agências", exact: true }),
  ).toBeChecked();
  await page.getByLabel(/Cidade ou região/i).fill("Campinas");
  await page.getByLabel("UF").selectOption("SP");
  await page.getByLabel("Nome").fill("Cliente Teste");
  await page.getByRole("textbox", { name: "WhatsApp" }).fill("(19) 99999-9999");
  await page.getByLabel(/Li e concordo/i).check();
}

test("entrada permanece neutra mesmo com parâmetros legados", async ({ page }) => {
  await page.goto("/solicitar-planilha?segment=agencias&source=e2e");

  await expect(page.getByRole("heading", { name: /Como você quer começar/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /Amostra grátis/i })).toHaveAttribute("aria-pressed", "false");
  await expect(page.getByRole("button", { name: /Base personalizada/i })).toHaveAttribute("aria-pressed", "false");
  await expect(page.locator("form")).toHaveCount(0);
});

test("amostra envia somente os campos essenciais e abre o protocolo", async ({ page }) => {
  let submittedBody: Record<string, unknown> | undefined;
  await page.route("**/api/free-sample-request", async (route) => {
    submittedBody = route.request().postDataJSON();
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ ok: true, publicCode: "PN-E2E001" }),
    });
  });

  await page.goto("/solicitar-planilha?source=e2e");
  await page.getByRole("button", { name: /Amostra grátis/i }).click();
  await expect(page.getByLabel(/Quantidade aproximada/i)).toHaveCount(0);
  await expect(page.getByText(/capital social/i)).toHaveCount(0);
  await expect(page.getByText(/CNAE/i)).toHaveCount(0);
  await fillCommonFields(page);
  await page.getByRole("button", { name: /Solicitar amostra grátis/i }).click();

  await expect(page.getByText(/Protocolo PN-E2E001/i)).toBeVisible();
  await page.waitForURL(/\/pedido\/?\?codigo=PN-E2E001/);
  expect(submittedBody).toMatchObject({
    niche: "Agências",
    city: "Campinas",
    state: "SP",
    quantity: 10,
    consent: true,
  });
  expect(submittedBody).not.toHaveProperty("enrichment");
});

for (const scenario of [
  { name: "HTTP 400", status: 400, expected: /Confira os campos destacados/i },
  { name: "HTTP 500", status: 500, expected: /Não foi possível enviar sua solicitação/i },
  { name: "falha de rede", status: 0, expected: /Não foi possível conectar agora/i },
]) {
  test(`formulário preserva os dados após ${scenario.name}`, async ({ page }) => {
    await page.route("**/api/free-sample-request", async (route) => {
      if (scenario.status === 0) {
        await route.abort("failed");
        return;
      }
      await route.fulfill({
        status: scenario.status,
        contentType: "application/json",
        body: JSON.stringify({ ok: false }),
      });
    });

    await page.goto("/solicitar-planilha");
    await page.getByRole("button", { name: /Amostra grátis/i }).click();
    await fillCommonFields(page);
    await page.getByRole("button", { name: /Solicitar amostra grátis/i }).click();

    await expect(page.locator(".request-feedback[role='alert']")).toContainText(scenario.expected);
    await expect(page.getByLabel(/Cidade ou região/i)).toHaveValue("Campinas");
    await expect(page.getByLabel("Nome")).toHaveValue("Cliente Teste");
    await expect(page.getByRole("textbox", { name: "WhatsApp" })).toHaveValue("(19) 99999-9999");
  });
}

test("base personalizada exige quantidade e não duplica envio", async ({ page }) => {
  let requestCount = 0;
  await page.route("**/api/custom-base-request", async (route) => {
    requestCount += 1;
    await new Promise((resolve) => setTimeout(resolve, 200));
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ ok: true, message: "Pedido recebido." }),
    });
  });

  await page.goto("/solicitar-planilha");
  await page.getByRole("button", { name: /Base personalizada/i }).click();
  await expect(page.getByLabel(/Quantidade aproximada/i)).toBeVisible();
  await expect(page.getByLabel(/Quer acrescentar algum critério/i)).toBeVisible();
  await expect(page.getByText(/capital social/i)).toHaveCount(0);
  await expect(page.getByText(/CNAE/i)).toHaveCount(0);
  await fillCommonFields(page);
  await page.getByLabel(/Quantidade aproximada/i).selectOption({ index: 1 });
  const submit = page.getByRole("button", { name: /Solicitar base personalizada/i });
  await submit.evaluate((element) => {
    const button = element as HTMLButtonElement;
    button.click();
    button.click();
  });

  await expect(page.getByText("Pedido recebido", { exact: true })).toBeVisible();
  expect(requestCount).toBe(1);
});
