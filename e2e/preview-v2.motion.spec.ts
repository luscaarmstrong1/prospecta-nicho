import { mkdir } from "node:fs/promises";
import path from "node:path";
import { expect, test } from "@playwright/test";

const motionArtifacts = path.resolve("artifacts/preview-v2/motion");
const prohibitedRuntimeRequest = /supabase\.co|\/functions\/|\/rest\/v1|\/auth\/v1|\/api\//i;

test.describe("preview v2 motion system", () => {
  test.setTimeout(60_000);

  test.beforeEach(async ({ page }) => {
    await mkdir(motionArtifacts, { recursive: true });
    await page.route("**/*", async (route) => {
      const url = route.request().url();
      if (prohibitedRuntimeRequest.test(url)) {
        throw new Error(`Motion preview attempted a prohibited runtime request: ${url}`);
      }
      await route.continue();
    });
  });

  test("animates safely and keeps all interactions local", async ({ page }, testInfo) => {
    const errors: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });
    page.on("pageerror", (error) => errors.push(error.message));

    await page.goto("/preview/site-v2/", { waitUntil: "networkidle" });
    await expect(page.locator('[data-motion="on"]')).toBeVisible();

    const progress = page.getByTestId("motion-scroll-progress");
    const initialTransform = await progress.evaluate((element) => getComputedStyle(element).transform);
    await page.getByTestId("preview-sample").scrollIntoViewIfNeeded();
    await page.waitForTimeout(180);
    const scrolledTransform = await progress.evaluate((element) => getComputedStyle(element).transform);
    expect(scrolledTransform).not.toBe(initialTransform);

    for (const testId of ["preview-segments", "preview-plans"]) {
      await page.getByTestId(testId).scrollIntoViewIfNeeded();
      await page.waitForTimeout(140);
    }
    await page.getByTestId("preview-testimonials").scrollIntoViewIfNeeded();
    const firstName = await page.getByTestId("motion-testimonial-carousel").locator("figcaption strong").first().textContent();
    await page.getByRole("button", { name: "Próximo depoimento" }).click();
    await expect(page.getByTestId("motion-testimonial-carousel").locator("figcaption strong").first()).not.toHaveText(firstName ?? "");

    await page.getByRole("button", { name: /Montar minha base/ }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toBeHidden();

    await page.getByTestId("preview-footer").scrollIntoViewIfNeeded();
    await page.getByLabel("Seu melhor e-mail").fill("motion@exemplo.com");
    await page.getByRole("button", { name: "Quero receber" }).click();
    await expect(page.getByText("Demonstração — nenhum dado foi enviado.")).toBeVisible();

    if (["desktop", "mobile-390"].includes(testInfo.project.name)) {
      await page.goto("/preview/site-v2/?motion=off", { waitUntil: "networkidle" });
      await page.screenshot({
        path: path.join(motionArtifacts, `${testInfo.project.name}.png`),
        fullPage: true,
      });
    }
    expect(errors).toEqual([]);
  });

  test("honors reduced motion and exposes deterministic final state", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/preview/site-v2/?motion=off", { waitUntil: "networkidle" });
    const root = page.locator('[data-motion="off"]');
    await expect(root).toHaveAttribute("data-reduced-motion", "true");
    await expect(page.getByTestId("motion-scroll-progress")).toBeHidden();
    await expect(page.getByTestId("preview-hero-title")).toBeVisible();
    await expect(page.getByTestId("preview-footer")).toBeAttached();
  });
});
