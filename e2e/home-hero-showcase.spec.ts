import { expect, test } from "@playwright/test";

const expectedSegments = [
  ["Indústrias", "industria"],
  ["Comércios", "comercio"],
  ["Serviços", "servicos"],
  ["Tecnologia", "tecnologia"],
] as const;

test("hero oficial apresenta promessa, mapa e ações reais", async ({ page }) => {
  await page.goto("/leads");

  const hero = page.getByTestId("preview-hero");
  await expect(hero).toBeVisible();
  await expect(hero.getByText("Bases B2B segmentadas")).toBeVisible();
  await expect(
    hero.getByRole("heading", { name: "Prospecta Nicho: encontre oportunidades B2B em todo o Brasil." }),
  ).toBeVisible();
  await expect(hero.getByRole("link", { name: /Ver planos e bases/i })).toHaveAttribute(
    "href",
    "/solicitar-planilha?source=home-v2-hero",
  );
  await expect(hero.getByRole("link", { name: /Ver como funciona/i })).toHaveAttribute("href", "#amostra");
});

test("segmentos em destaque usam os quatro recortes comerciais atuais", async ({ page }) => {
  await page.goto("/leads");

  const cards = page.getByTestId("motion-segment-card");
  await expect(cards).toHaveCount(expectedSegments.length);

  for (const [title, segment] of expectedSegments) {
    const card = cards.filter({ hasText: title });
    await card.scrollIntoViewIfNeeded();
    await expect(card).toBeVisible();
    const image = card.locator("img");
    await expect(image).toHaveJSProperty("complete", true, { timeout: 15_000 });
    expect(await image.evaluate((element: HTMLImageElement) => element.naturalWidth)).toBeGreaterThan(0);
    await expect(card.getByRole("link", { name: /Acessar segmento/i })).toHaveAttribute(
      "href",
      `/solicitar-planilha?segment=${segment}&source=home-v2-segmento`,
    );
  }
});

