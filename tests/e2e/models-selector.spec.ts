import { test, expect } from "@playwright/test";
import { mockModelsSuccess } from "./helpers/mock-api";
import { getModel1Select } from "./helpers/selectors";

test("shows loading indicator then model options", async ({ page }) => {
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
          { id: "gpt-4o", object: "model", created: 0, owned_by: "openai" },
        ],
        usedConfigFilter: true,
        showFallbackNote: false,
      }),
    });
  });

  await page.goto("/");

  await expect(page.getByText("Loading models...")).toBeVisible();
  (releaseModelsResponse as (() => void) | null)?.();

  const model1Select = getModel1Select(page);
  await expect(model1Select).toBeVisible();
  await expect(model1Select).toContainText("gpt-4.1-mini");
});

test("shows model fetch error and supports retry", async ({ page }) => {
  let shouldFail = true;

  await page.route("**/api/models", async (route) => {
    if (shouldFail) {
      await route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({
          message:
            "Error: Failed API call, could not get list of OpenAI models",
          details: "Authorization: Bearer [REDACTED]",
        }),
      });
      return;
    }

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

  await expect(
    page.getByText(
      "Error: Failed API call, could not get list of OpenAI models",
    ),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Try again" })).toBeVisible();

  shouldFail = false;
  await page.getByRole("button", { name: "Try again" }).click();

  const model1Select = getModel1Select(page);
  await expect(model1Select).toBeVisible();
  await expect(model1Select).toContainText("gpt-4.1-mini");
});

test("shows fallback note when server indicates fallback mode", async ({
  page,
}) => {
  await mockModelsSuccess(page, [{ id: "gpt-4.1-mini" }], {
    showFallbackNote: true,
    usedConfigFilter: false,
  });

  await page.goto("/");

  await expect(
    page.getByText(
      "Note: List of OpenAI models may include some older models that are no longer available.",
    ),
  ).toBeVisible();
});
