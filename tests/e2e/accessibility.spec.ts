import type { Page } from "@playwright/test";
import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import {
  mockModelsError,
  mockModelsSuccess,
  mockRespondError,
  mockRespondSuccess,
} from "./helpers/mock-api";

async function analyzePage(page: Page) {
  return new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
}

async function waitForNuxtHydration(page: Page) {
  await page.waitForFunction(() => {
    const getNuxtApp = (
      window as Window & {
        useNuxtApp?: () => { isHydrating?: boolean };
      }
    ).useNuxtApp;

    if (typeof getNuxtApp !== "function") {
      return false;
    }

    return getNuxtApp().isHydrating === false;
  });
}

test("has no critical accessibility violations on idle-ready state", async ({
  page,
}) => {
  await mockModelsSuccess(page, [{ id: "gpt-4.1-mini" }]);

  await page.goto("/");
  await expect(page.getByLabel("Model 1 *")).toBeVisible();
  await expect(page.getByLabel("Model 2 *")).toBeVisible();

  const results = await analyzePage(page);
  expect(results.violations).toEqual([]);
});

test("has no critical accessibility violations on loading state", async ({
  page,
}) => {
  let releaseModelsResponse: (() => void) | null = null;

  await page.route("**/api/models", async (route) => {
    await new Promise<void>((resolve) => {
      releaseModelsResponse = () => resolve();
    });

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        object: "list",
        data: [
          {
            id: "gpt-4.1-mini",
            object: "model",
            created: 0,
            owned_by: "openai",
          },
        ],
        usedConfigFilter: true,
        showFallbackNote: false,
      }),
    });
  });

  await page.goto("/");
  await expect(page.getByText("Loading models...")).toBeVisible();
  (releaseModelsResponse as (() => void) | null)?.();

  const results = await analyzePage(page);
  expect(results.violations).toEqual([]);
});

test("has no critical accessibility violations on success response state", async ({
  page,
}) => {
  await mockModelsSuccess(page, [{ id: "gpt-4.1-mini" }]);
  await mockRespondSuccess(page, "Hello from success state");

  await page.goto("/");
  await waitForNuxtHydration(page);
  await expect(page.getByLabel("Model 1 *")).toContainText("gpt-4.1-mini");

  await page.getByLabel("Prompt *").fill("hello");
  await Promise.all([
    page.waitForResponse(
      (response) =>
        response.url().includes("/api/respond") &&
        response.request().method() === "POST",
    ),
    page.getByRole("button", { name: "Send" }).click(),
  ]);
  await expect(
    page.getByRole("heading", {
      name: "Response from Model 1 (gpt-4.1-mini)",
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", {
      name: "Response from Model 2 (gpt-4.1-mini)",
    }),
  ).toBeVisible();

  const results = await analyzePage(page);
  expect(results.violations).toEqual([]);
});
test("has no critical accessibility violations on error states", async ({
  page,
}) => {
  await mockModelsError(
    page,
    "Error: Failed API call, could not get list of OpenAI models",
  );

  await page.goto("/");
  await expect(
    page.getByText(
      "Error: Failed API call, could not get list of OpenAI models",
    ),
  ).toBeVisible();

  const modelsErrorResults = await analyzePage(page);
  expect(modelsErrorResults.violations).toEqual([]);

  await page.unroute("**/api/models");
  await mockModelsSuccess(page, [{ id: "gpt-4.1-mini" }]);
  await mockRespondError(
    page,
    500,
    "Request to OpenAI failed.",
    "Authorization: Bearer [REDACTED]",
  );
  await page.reload();
  await waitForNuxtHydration(page);

  await page.getByLabel("Prompt *").fill("hello");
  await page.getByRole("button", { name: "Send" }).click();
  await expect(page.getByText("Something went wrong").first()).toBeVisible({
    timeout: 10_000,
  });

  const responseErrorResults = await analyzePage(page);
  expect(responseErrorResults.violations).toEqual([]);
});
