import { expect, test } from "@playwright/test";

test("consulta automaticamente o protocolo da URL uma única vez", async ({ page }) => {
  let calls = 0;
  await page.route("**/api/public/request-status?codigo=PN-OK001", async (route) => {
    calls += 1;
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        request: {
          publicCode: "PN-OK001",
          status: "analysis",
          product: "amostra-gratuita",
          segment: "Agências",
          city: "Campinas",
          uf: "SP",
        },
      }),
    });
  });

  await page.goto("/pedido/?codigo=PN-OK001");
  await expect(page.getByRole("heading", { name: /Status atual: analysis/i })).toBeVisible();
  await expect(page.getByLabel("Protocolo")).toHaveValue("PN-OK001");
  expect(calls).toBe(1);
});

test("falha de rede mantém a página utilizável e permite tentar novamente", async ({ page }) => {
  let calls = 0;
  await page.route("**/api/public/request-status?codigo=PN-OFFLINE", async (route) => {
    calls += 1;
    if (calls === 1) {
      await route.abort("failed");
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ ok: true, request: { publicCode: "PN-OFFLINE", status: "analysis" } }),
    });
  });

  await page.goto("/pedido/?codigo=PN-OFFLINE");
  await expect(page.locator(".status-result[role='alert']")).toContainText("Não foi possível consultar o pedido agora");
  await page.getByRole("button", { name: /Tentar novamente/i }).click();
  await expect(page.getByRole("heading", { name: /Status atual: analysis/i })).toBeVisible();
  expect(calls).toBe(2);
});

test("404 e JSON inválido exibem mensagens seguras", async ({ page }) => {
  await page.route("**/api/public/request-status?codigo=PN-404", (route) =>
    route.fulfill({ status: 404, contentType: "application/json", body: JSON.stringify({ ok: false }) }),
  );
  await page.goto("/pedido/?codigo=PN-404");
  await expect(page.locator(".status-result[role='alert']")).toContainText("Pedido não encontrado para este protocolo");

  await page.route("**/api/public/request-status?codigo=PN-JSON", (route) =>
    route.fulfill({ status: 200, contentType: "text/plain", body: "resposta inválida" }),
  );
  await page.goto("/pedido/?codigo=PN-JSON");
  await expect(page.locator(".status-result[role='alert']")).toContainText("Não foi possível consultar o pedido agora");
});
