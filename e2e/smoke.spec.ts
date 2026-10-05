import { expect, test } from "@playwright/test";

test.describe("Smoke Tests Essenciais - Sites & Landing Pages (/) e Leads B2B (/leads)", () => {
  test("HOME / (Sites & Landing Pages) carrega com sucesso, hierarquia, sem erros e sem overflow", async ({
    page,
    isMobile,
  }) => {
    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        consoleErrors.push(msg.text());
      }
    });

    const response = await page.goto("/?motion=off");
    expect(response?.status()).toBe(200);

    // H1 único e correto
    const h1 = page.locator("h1");
    await expect(h1).toHaveCount(1);
    await expect(h1).toContainText("Sites & Landing Pages");

    // Header correto e interligado
    const header = page.locator('[data-testid="site-v2-header"]');
    await expect(header).toBeVisible();

    // Abas ocultas não devem existir e soluções devem estar visíveis
    const menuBtn = header.getByRole("button", { name: /menu/i });
    if (await menuBtn.isVisible()) {
      await menuBtn.click();
      const mobileNav = header.locator('[class*="mobileNav"]');
      await expect(mobileNav).toBeVisible();
      await expect(mobileNav.getByRole("link", { name: "Segmentos", exact: true })).toHaveCount(0);
      await expect(mobileNav.getByRole("link", { name: "Planos", exact: true })).toHaveCount(0);
      await expect(mobileNav.getByRole("link", { name: "Conteúdo", exact: true })).toHaveCount(0);
      await expect(mobileNav.getByRole("link", { name: "Início", exact: true })).toBeVisible();
      await expect(mobileNav.getByRole("link", { name: "Leads B2B", exact: true })).toBeVisible();
      await expect(mobileNav.getByRole("link", { name: "Sobre", exact: true })).toBeVisible();
      await expect(mobileNav.getByRole("link", { name: "Contato", exact: true })).toBeVisible();
    } else {
      const nav = header.locator("nav");
      await expect(nav.getByRole("link", { name: "Segmentos", exact: true })).toHaveCount(0);
      await expect(nav.getByRole("link", { name: "Planos", exact: true })).toHaveCount(0);
      await expect(nav.getByRole("link", { name: "Conteúdo", exact: true })).toHaveCount(0);
      await expect(nav.getByRole("link", { name: "Início", exact: true })).toBeVisible();
      await expect(nav.getByRole("link", { name: "Leads B2B", exact: true })).toBeVisible();
      await expect(nav.getByRole("link", { name: "Sobre", exact: true })).toBeVisible();
      await expect(nav.getByRole("link", { name: "Contato", exact: true })).toBeVisible();
    }

    // CTA principal
    const heroBtn = page.getByRole("link", { name: /Solicitar projeto/i }).first();
    await expect(heroBtn).toBeVisible();

    // Link para Leads
    const leadsLink = page.locator('a[href="/leads"], a[href="/leads-b2b"]');
    await expect(leadsLink.first()).toBeAttached();

    // Sem overflow horizontal
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth - clientWidth).toBeLessThanOrEqual(1);

    // Sem erros de console
    expect(consoleErrors).toEqual([]);
  });

  test("LEADS /leads (Leads B2B) carrega com sucesso, mapa, cards, sem erros e sem overflow", async ({
    page,
    isMobile,
  }) => {
    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        consoleErrors.push(msg.text());
      }
    });

    const response = await page.goto("/leads?motion=off");
    expect(response?.status()).toBe(200);

    // Header correto e interligado
    const header = page.locator('[data-testid="site-v2-header"]');
    await expect(header).toBeVisible();

    // Abas ocultas não devem existir e soluções devem estar visíveis
    const menuBtn = header.getByRole("button", { name: /menu/i });
    if (await menuBtn.isVisible()) {
      await menuBtn.click();
      const mobileNav = header.locator('[class*="mobileNav"]');
      await expect(mobileNav).toBeVisible();
      await expect(mobileNav.getByRole("link", { name: "Segmentos", exact: true })).toHaveCount(0);
      await expect(mobileNav.getByRole("link", { name: "Planos", exact: true })).toHaveCount(0);
      await expect(mobileNav.getByRole("link", { name: "Conteúdo", exact: true })).toHaveCount(0);
      await expect(mobileNav.getByRole("link", { name: "Início", exact: true })).toBeVisible();
      await expect(mobileNav.getByRole("link", { name: "Sites & Landing Pages", exact: true })).toBeVisible();
      await expect(mobileNav.getByRole("link", { name: "Sobre", exact: true })).toBeVisible();
      await expect(mobileNav.getByRole("link", { name: "Contato", exact: true })).toBeVisible();
    } else {
      const nav = header.locator("nav");
      await expect(nav.getByRole("link", { name: "Segmentos", exact: true })).toHaveCount(0);
      await expect(nav.getByRole("link", { name: "Planos", exact: true })).toHaveCount(0);
      await expect(nav.getByRole("link", { name: "Conteúdo", exact: true })).toHaveCount(0);
      await expect(nav.getByRole("link", { name: "Início", exact: true })).toBeVisible();
      await expect(nav.getByRole("link", { name: "Sites & Landing Pages", exact: true })).toBeVisible();
      await expect(nav.getByRole("link", { name: "Sobre", exact: true })).toBeVisible();
      await expect(nav.getByRole("link", { name: "Contato", exact: true })).toBeVisible();
    }

    // H1 único e correto
    const h1 = page.locator("h1");
    await expect(h1).toHaveCount(1);
    await expect(h1).toContainText("Prospecta Nicho:");
    await expect(h1).toContainText("oportunidades B2B");

    // Mapa e Cards Regionais
    const hero = page.getByTestId("preview-hero");
    await expect(hero).toBeVisible();
    await expect(page.getByTestId("preview-map")).toBeVisible();
    await expect(page.locator(".home-v2_regionTag__p2R4z, [class*='regionTag']")).toHaveCount(5);

    // Painel de Números
    await expect(page.getByTestId("preview-numbers")).toBeVisible();
    await expect(page.getByText("5.8M")).toBeVisible();
    await expect(page.getByText("+600")).toBeVisible();
    await expect(page.getByText("5.570")).toBeVisible();

    // CTA principal
    const heroCta = hero.getByRole("link", { name: /Ver planos e bases/i });
    await expect(heroCta).toBeVisible();

    // Sem overflow horizontal
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth - clientWidth).toBeLessThanOrEqual(1);

    // Sem erros de console
    expect(consoleErrors).toEqual([]);
  });
});
