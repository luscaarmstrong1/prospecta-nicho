import { expect, test } from "@playwright/test";

test("whatsapp flutuante usa número padrão e não desaparece com scroll ou navegação", async ({ page }) => {
  await page.goto("/");

  const whatsapp = page.locator('[data-test-id="whatsapp-floating-button"]');
  await expect(whatsapp).toBeVisible();
  await expect(whatsapp).toHaveAttribute("href", /^https:\/\/wa\.me\/5535998905896\?text=/);
  await expect(whatsapp).not.toHaveAttribute("href", /https:\/\/wa\.me\/\?text=/);

  await page.waitForTimeout(3000);
  await expect(whatsapp).toBeVisible();

  const samples = [];
  for (const scrollY of [0, 900, 1900]) {
    await page.evaluate((value) => window.scrollTo(0, value), scrollY);
    await page.waitForTimeout(120);
    samples.push(
      await whatsapp.evaluate((element) => {
        const style = window.getComputedStyle(element);
        const rect = element.getBoundingClientRect();
        return {
          opacity: style.opacity,
          position: style.position,
          visibility: style.visibility,
          zIndex: Number(style.zIndex),
          top: Math.round(rect.top),
          width: Math.round(rect.width),
          height: Math.round(rect.height),
        };
      }),
    );
  }

  for (const sample of samples) {
    expect(sample.opacity).toBe("1");
    expect(sample.position).toBe("fixed");
    expect(sample.visibility).toBe("visible");
    expect(sample.zIndex).toBeGreaterThanOrEqual(999);
    expect(sample.width).toBeGreaterThanOrEqual(54);
    expect(sample.height).toBeGreaterThanOrEqual(54);
  }
  expect(new Set(samples.map((sample) => sample.top)).size).toBe(1);

  await page.goto("/produtos/amostra-gratuita");
  await expect(page).toHaveURL(/\/solicitar-planilha/);
  await expect(whatsapp).toBeVisible();
});
