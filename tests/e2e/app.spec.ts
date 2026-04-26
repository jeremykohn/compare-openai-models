import { test, expect } from "@playwright/test";
import {
  mockModelsSuccess,
  mockRespondError,
  mockRespondSuccess,
  startRespondRequestCapture,
} from "./helpers/mock-api";

test("runs happy path from load to rendered response", async ({ page }) => {
  await mockModelsSuccess(page, [{ id: "gpt-4.1-mini" }, { id: "gpt-4o" }]);
  await mockRespondSuccess(page, "Hello from ChatGPT", "gpt-4.1-mini");

  await page.goto("/");

  await expect(
    page.getByRole("heading", { name: "ChatGPT prompt tester" }),
  ).toBeVisible();
  const modelSelect = page.getByLabel("Model 1 *");
  const rightModelSelect = page.getByLabel("Model 2 *");
  await expect(modelSelect).toBeVisible();
  await expect(rightModelSelect).toBeVisible();
  await expect(modelSelect).toBeEnabled();
  await expect(rightModelSelect).toBeEnabled();
  await expect(page.locator("#models-select option")).toHaveCount(3);
  await expect(page.locator("#models-select-right option")).toHaveCount(3);
  await expect(modelSelect).toHaveValue("");
  await expect(rightModelSelect).toHaveValue("");
  await expect(page.getByRole("button", { name: "Send" })).toBeVisible();

  await modelSelect.selectOption("gpt-4o");
  await rightModelSelect.selectOption("gpt-4.1-mini");

  await page.getByLabel("Prompt *").fill("Write a greeting");
  const capture = startRespondRequestCapture(page);
  await page.getByRole("button", { name: "Send" }).click();

  await expect.poll(() => capture.requests.length).toBe(2);
  expect(capture.getParseError()).toBeNull();

  const capturedModels = capture.requests.map((request) => request.model);
  expect(capturedModels).toContain("gpt-4o");
  expect(capturedModels).toContain("gpt-4.1-mini");
  expect(capturedModels[0]).not.toBe(capturedModels[1]);

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
  await expect(page.getByText("Hello from ChatGPT")).toHaveCount(2);

  capture.stop();
});

test("shows left completion while right response is still pending", async ({
  page,
}) => {
  await mockModelsSuccess(page, [{ id: "gpt-4.1-mini" }, { id: "gpt-4o" }]);

  let releaseRightResponse: (() => void) | null = null;

  await page.route("**/api/respond", async (route) => {
    const requestBody = route.request().postDataJSON() as {
      model?: string;
      prompt: string;
    };

    if (requestBody.model === "gpt-4o") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          response: "Left fast response",
          model: "gpt-4o",
        }),
      });
      return;
    }

    await new Promise<void>((resolve) => {
      releaseRightResponse = () => resolve();
    });

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        response: "Right delayed response",
        model: "gpt-4.1-mini",
      }),
    });
  });

  await page.goto("/");

  const modelSelect = page.getByLabel("Model 1 *");
  const rightModelSelect = page.getByLabel("Model 2 *");
  await modelSelect.selectOption("gpt-4o");
  await rightModelSelect.selectOption("gpt-4.1-mini");

  await page.getByLabel("Prompt *").fill("Write a greeting");
  const capture = startRespondRequestCapture(page);
  await page.getByRole("button", { name: "Send" }).click();

  await expect.poll(() => capture.requests.length).toBe(2);
  expect(capture.getParseError()).toBeNull();

  const capturedModels = capture.requests.map((request) => request.model);
  expect(capturedModels).toContain("gpt-4o");
  expect(capturedModels).toContain("gpt-4.1-mini");
  expect(capturedModels[0]).not.toBe(capturedModels[1]);

  await expect(page.getByText("Left fast response")).toBeVisible();
  await expect(page.getByText("Waiting for Model 2 response...")).toBeVisible();

  (releaseRightResponse as (() => void) | null)?.();

  await expect(page.getByText("Right delayed response")).toBeVisible();

  capture.stop();
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

  const capture = startRespondRequestCapture(page);
  await page.getByRole("button", { name: "Send" }).click();

  await expect.poll(() => capture.requests.length).toBe(2);
  expect(capture.getParseError()).toBeNull();

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

  capture.stop();
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

  const capture = startRespondRequestCapture(page);
  await page.getByRole("button", { name: "Send" }).click();

  await expect.poll(() => capture.requests.length).toBe(2);
  expect(capture.getParseError()).toBeNull();

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

  capture.stop();
});
