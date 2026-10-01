import { expect, test } from "@playwright/test";

const expectedSegments = [
  ["Indústrias", "industria"],
  ["Comércios", "comercio"],
  ["Serviços", "servicos"],
  ["Tecnologia", "tecnologia"],
] as const;

test("hero oficial apresenta promessa, mapa e ações reais", async ({ page }) => {
  await page.goto("/");

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
  await page.goto("/");

  const cards = page.getByTestId("motion-segment-card");
  await expect(cards).toHaveCount(expectedSegments.length);

  for (const [title, segment] of expectedSegments) {
    const card = cards.filter({ hasText: title });
    await expect(card).toBeVisible();
    await expect(card.locator("img")).toHaveJSProperty("complete", true);
    await expect(card.getByRole("link", { name: /Acessar segmento/i })).toHaveAttribute(
      "href",
      `/solicitar-planilha?segment=${segment}&source=home-v2-segmento`,
    );
  }
});

