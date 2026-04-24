import { test, expect } from "@playwright/test";
import {
  mockModelsSuccess,
  mockRespondError,
  mockRespondSuccess,
} from "./helpers/mock-api";

test("runs happy path from load to rendered response", async ({ page }) => {
  await mockModelsSuccess(page, [{ id: "gpt-4.1-mini" }, { id: "gpt-4o" }]);
  await mockRespondSuccess(page, "Hello from ChatGPT", "gpt-4.1-mini");

  await page.goto("/");

  await expect(
    page.getByRole("heading", { name: "ChatGPT prompt tester" }),
  ).toBeVisible();
  const modelSelect = page.getByLabel("Model *");
  const rightModelSelect = page.getByLabel("Model (inactive)");
  await expect(modelSelect).toBeVisible();
  await expect(rightModelSelect).toBeVisible();
  await expect(modelSelect).toBeEnabled();
  await expect(rightModelSelect).toBeDisabled();
  await expect(page.locator("#models-select option")).toHaveCount(3);
  await expect(page.locator("#models-select-right option")).toHaveCount(3);
  await expect(modelSelect).toHaveValue("");
  await expect(page.getByRole("button", { name: "Send" })).toBeVisible();

  await page.getByLabel("Prompt *").fill("Write a greeting");
  await Promise.all([
    page.waitForResponse(
      (response) =>
        response.url().includes("/api/respond") &&
        response.request().method() === "POST",
    ),
    page.getByRole("button", { name: "Send" }).click(),
  ]);

  await expect(page.getByRole("heading", { name: "Output 1" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Output 2" })).toBeVisible();
  await expect(page.getByText("Hello from ChatGPT")).toHaveCount(2);
});
test("shows error details toggle when submission fails", async ({ page }) => {
  await mockModelsSuccess(page, [{ id: "gpt-4.1-mini" }]);
  await mockRespondError(
    page,
    503,
    "Service unavailable",
    "Request id: abc123",
  );

  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "ChatGPT prompt tester" }),
  ).toBeVisible();
  await expect(page.locator("#models-select option")).toHaveCount(2);

  const promptInput = page.locator("#prompt-input");
  await promptInput.fill("Write a greeting");
  await expect(promptInput).toHaveValue("Write a greeting");
  await Promise.all([
    page.waitForResponse(
      (response) =>
        response.url().includes("/api/respond") &&
        response.request().method() === "POST",
    ),
    page.getByRole("button", { name: "Send" }).click(),
  ]);

  await expect(page.getByText("Something went wrong")).toHaveCount(2);

  const details = page.locator('[data-testid="error-details-toggle"]');
  await expect(details).toHaveCount(2);
  await expect(details.nth(0)).not.toHaveAttribute("open", "");
  await expect(details.nth(1)).not.toHaveAttribute("open", "");
  await expect(details.first().getByText("Error Details")).toBeVisible();

  await details.first().locator("summary").click();
  await expect(details.first()).toHaveAttribute("open", "");
  await expect(details.first().getByText("Status Code")).toBeVisible();
  await expect(details.first().getByText("503")).toBeVisible();
  await expect(details.first().getByText("Type")).toHaveCount(0);
});

test("renders typed error metadata when API provides type/code/param", async ({
  page,
}) => {
  await mockModelsSuccess(page, [{ id: "gpt-4.1-mini" }]);
  await page.route("**/api/respond", async (route) => {
    await route.fulfill({
      status: 400,
      contentType: "application/json",
      body: JSON.stringify({
        message: "Request to OpenAI failed.",
        type: "invalid_request_error",
        code: "model_not_found",
        param: "model",
      }),
    });
  });

  await page.goto("/");
  await expect(page.locator("#models-select option")).toHaveCount(2);
  await page.locator("#prompt-input").fill("Write a greeting");

  await Promise.all([
    page.waitForResponse(
      (response) =>
        response.url().includes("/api/respond") &&
        response.request().method() === "POST",
    ),
    page.getByRole("button", { name: "Send" }).click(),
  ]);

  const details = page.locator('[data-testid="error-details-toggle"]');
  await expect(details).toHaveCount(2);
  await details.first().locator("summary").click();

  await expect(details.first().getByText("Type")).toBeVisible();
  await expect(
    details.first().getByText("invalid_request_error"),
  ).toBeVisible();
  await expect(details.first().getByText("Error Code")).toBeVisible();
  await expect(details.first().getByText("model_not_found")).toBeVisible();
  await expect(details.first().getByText("Param")).toBeVisible();
  await expect(
    details.first().getByText("model", { exact: true }),
  ).toBeVisible();
});
