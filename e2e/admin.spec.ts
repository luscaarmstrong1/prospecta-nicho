import { expect, test } from "@playwright/test";

const adminToken = process.env.ADMIN_API_TOKEN || "playwright-admin-token";

async function loginAsAdmin(page: import("@playwright/test").Page) {
  await page.goto("/admin/login");
  await page.getByLabel(/Token administrativo/i).fill(adminToken);
  const [response] = await Promise.all([
    page.waitForResponse((res) => res.url().includes("/api/admin/session") && res.request().method() === "POST"),
    page.getByRole("button", { name: /Entrar/i }).click(),
  ]);
  expect(response.ok()).toBeTruthy();
  await page.waitForURL(/\/admin$/);
  await expect(page.getByRole("heading", { name: /Operação protegida da ProspectaNicho/i })).toBeVisible();
}

test("admin de produtos exige login e expõe tabela após autenticação", async ({ page }) => {
  await page.goto("/admin/produtos");
  await expect(page.getByRole("heading", { name: /Login administrativo/i })).toBeVisible();

  await loginAsAdmin(page);
  await page.goto("/admin/produtos");
  await expect(page.getByRole("heading", { name: /Produtos/i })).toBeVisible();
  await expect(page.locator(".admin-product-row").first()).toBeVisible();
  await expect(page.locator(".admin-drawer")).toBeVisible();
});

test("admin opera pedido CNPJ real ate criacao do job", async ({ page }) => {
  test.setTimeout(60_000);
  const response = await page.request.post("/api/custom-requests", {
    data: {
      segment: "agencias",
      location: "Campinas",
      state: "SP",
      period: "sem filtro de abertura",
      name: "Cliente CRM E2E",
      whatsapp: "(19) 98888-7777",
      quantity: "100",
      source: "e2e-admin-crm",
      consent: true,
      idempotencyKey: `e2e-admin-crm-${Date.now()}-${Math.random()}`,
    },
  });
  expect(response.ok()).toBeTruthy();
  const body = (await response.json()) as { crm?: { requestId?: string; publicCode?: string } };
  expect(body.crm?.requestId).toBeTruthy();

  await loginAsAdmin(page);
  await page.goto(`/admin/requests/detalhe/?id=${body.crm?.requestId}`);
  await expect(page.locator(".lead", { hasText: body.crm?.publicCode || "" })).toBeVisible();

  for (const label of [/Validar filtros/i, /Marcar pagamento/i, /Criar job CNPJ/i]) {
    const action = page.waitForResponse((res) => res.url().includes("/api/admin/requests/") && res.request().method() === "POST");
    if (!label.test("Validar filtros")) page.once("dialog", (dialog) => dialog.accept());
    await page.getByRole("button", { name: label }).click();
    expect((await action).ok()).toBeTruthy();
  }

  await page.goto("/admin/jobs");
  const firstJob = page.locator(".admin-table-row").first();
  await expect(firstJob).toContainText("rfb_cnpj");
  await expect(firstJob).toContainText(/linhas exportadas/i);
});

test("admin de preços expõe campos de alteração e auditoria após login", async ({ page }) => {
  await loginAsAdmin(page);
  await page.goto("/admin/precos");
  await expect(page.getByRole("heading", { name: /preços/i })).toBeVisible();
  await expect(page.locator(".admin-drawer")).toContainText(/preço|histórico|auditoria/i);
});
