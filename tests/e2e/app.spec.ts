import { test, expect, type Locator } from "@playwright/test";
import { MODEL_SELECT_IDS } from "../../shared/constants/model-selectors";
import {
  mockModelsSuccess,
  mockRespondError,
  mockRespondSuccess,
  startRespondRequestCapture,
} from "./helpers/mock-api";
import {
  getModel1Select,
  getModel2Select,
  getModel3Select,
  getPromptInput,
} from "./helpers/selectors";

async function expectContainedWithin(
  childLocator: Locator,
  parentLocator: Locator,
) {
  const child = await childLocator.boundingBox();
  const parent = await parentLocator.boundingBox();

  expect(child).not.toBeNull();
  expect(parent).not.toBeNull();

  expect((child?.x ?? 0) + (child?.width ?? 0)).toBeLessThanOrEqual(
    (parent?.x ?? 0) + (parent?.width ?? 0) + 1,
  );
  expect(child?.x ?? 0).toBeGreaterThanOrEqual((parent?.x ?? 0) - 1);
}

test("runs happy path from load to rendered response", async ({ page }) => {
  await mockModelsSuccess(page, [{ id: "gpt-4.1-mini" }, { id: "gpt-4o" }]);
  await mockRespondSuccess(page, "Hello from ChatGPT", "gpt-4.1-mini");

  await page.goto("/");

  await expect(
    page.getByRole("heading", { name: "Compare OpenAI Models" }),
  ).toBeVisible();
  const model1Select = getModel1Select(page);
  const model2Select = getModel2Select(page);
  const model3Select = getModel3Select(page);
  await expect(model1Select).toBeVisible();
  await expect(model2Select).toBeVisible();
  await expect(model3Select).toBeVisible();
  await expect(model1Select).toBeEnabled();
  await expect(model2Select).toBeEnabled();
  await expect(model3Select).toBeEnabled();
  await expect(page.locator(`#${MODEL_SELECT_IDS.model1} option`)).toHaveCount(
    3,
  );
  await expect(page.locator(`#${MODEL_SELECT_IDS.model2} option`)).toHaveCount(
    3,
  );
  await expect(page.locator(`#${MODEL_SELECT_IDS.model3} option`)).toHaveCount(
    3,
  );
  await expect(model1Select).toHaveValue("");
  await expect(model2Select).toHaveValue("");
  await expect(model3Select).toHaveValue("");
  await expect(page.getByRole("button", { name: "Send" })).toBeVisible();
  await expect(
    page.locator('[data-testid="comparison-model3-prompt-toggle"]'),
  ).toBeHidden();

  await model1Select.selectOption("gpt-4o");
  await model2Select.selectOption("gpt-4.1-mini");
  await model3Select.selectOption("gpt-4o");

  await getPromptInput(page).fill("Write a greeting");
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
      name: /Response from Model 1 \(.+\) in .+ seconds/,
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", {
      name: /Response from Model 2 \(.+\) in .+ seconds/,
    }),
  ).toBeVisible();
  await expect(page.getByText("Hello from ChatGPT")).toHaveCount(3);
  await expect(
    page.getByRole("heading", {
      name: "Response from Model 3 (gpt-4o) comparing responses from Model 1 and Model 2",
    }),
  ).toBeVisible();
  await expect(
    page.locator('[data-testid="comparison-model3-loading"]'),
  ).toBeHidden();
  await expect(
    page.locator('[data-testid="comparison-model3-response"]'),
  ).toBeVisible();
  await expect(
    page.locator('[data-testid="comparison-model3-response"]'),
  ).toContainText("Hello from ChatGPT");

  const promptToggle = page.locator(
    '[data-testid="comparison-model3-prompt-toggle"]',
  );
  await expect(promptToggle).toBeVisible();
  await expect(promptToggle).toHaveText("Comparison prompt for Model 3");
  await expect(promptToggle).toHaveAttribute("aria-expanded", "false");

  const generatedPrompt = page.locator(
    '[data-testid="comparison-model3-generated-prompt"]',
  );
  await expect(generatedPrompt).toBeHidden();

  await promptToggle.click();
  await expect(promptToggle).toHaveAttribute("aria-expanded", "true");
  await expect(generatedPrompt).toBeVisible();
  await expect(generatedPrompt).toContainText(
    "Compare Response 1 and Response 2, and highlight key differences.",
  );
  await expect(generatedPrompt).toContainText("## High-Level Summary");
  await expect(generatedPrompt).not.toContainText("Write a greeting");
  await expect(generatedPrompt).not.toContainText("Hello from ChatGPT");

  capture.stop();
});

test("renders markdown structure in model 3 success response", async ({
  page,
}) => {
  await mockModelsSuccess(page, [{ id: "gpt-4.1-mini" }, { id: "gpt-4o" }]);

  let respondCallCount = 0;

  await page.route("**/api/respond", async (route) => {
    respondCallCount += 1;

    if (respondCallCount <= 2) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          response: `Outer response ${respondCallCount}`,
          model: "gpt-4.1-mini",
        }),
      });
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        response: "## Summary\n\n- First item\n- Second item\n\n`inline-code`",
        model: "gpt-4o",
      }),
    });
  });

  await page.goto("/");

  await getModel1Select(page).selectOption("gpt-4o");
  await getModel2Select(page).selectOption("gpt-4.1-mini");
  await getModel3Select(page).selectOption("gpt-4o");
  await getPromptInput(page).fill("Write a greeting");

  const capture = startRespondRequestCapture(page);
  await page.getByRole("button", { name: "Send" }).click();

  await expect.poll(() => capture.requests.length).toBe(3);
  expect(capture.getParseError()).toBeNull();

  const response = page.locator('[data-testid="comparison-model3-response"]');
  await expect(response).toBeVisible();
  await expect(
    response.getByRole("heading", { name: "Summary" }),
  ).toBeVisible();
  await expect(response.locator("li")).toHaveCount(2);
  await expect(response.locator("code")).toContainText("inline-code");

  capture.stop();
});

test("renders model 3 error panel with details when comparison request fails", async ({
  page,
}) => {
  await mockModelsSuccess(page, [{ id: "gpt-4.1-mini" }, { id: "gpt-4o" }]);

  let respondCallCount = 0;

  await page.route("**/api/respond", async (route) => {
    respondCallCount += 1;

    if (respondCallCount <= 2) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          response: `Outer response ${respondCallCount}`,
          model: "gpt-4.1-mini",
        }),
      });
      return;
    }

    await route.fulfill({
      status: 503,
      contentType: "application/json",
      body: JSON.stringify({
        message: "Model 3 comparison unavailable",
        details: "upstream timeout",
      }),
    });
  });

  await page.goto("/");

  await getModel1Select(page).selectOption("gpt-4o");
  await getModel2Select(page).selectOption("gpt-4.1-mini");
  await getModel3Select(page).selectOption("gpt-4o");
  await getPromptInput(page).fill("Write a greeting");

  const capture = startRespondRequestCapture(page);
  await page.getByRole("button", { name: "Send" }).click();

  await expect.poll(() => capture.requests.length).toBe(3);
  expect(capture.getParseError()).toBeNull();

  const comparisonPanel = page.locator(
    '[data-testid="comparison-output-panel"]',
  );

  await expect(
    comparisonPanel.locator('[data-testid="comparison-model3-error"]'),
  ).toBeVisible();
  await expect(
    comparisonPanel.locator('[data-testid="comparison-model3-prompt-toggle"]'),
  ).toBeHidden();
  const model3ErrorDetailsToggle = comparisonPanel.locator(
    '[data-testid="comparison-model3-error-details-toggle"]',
  );
  await expect(model3ErrorDetailsToggle).toBeVisible();
  await model3ErrorDetailsToggle.locator("summary").click();
  await expect(model3ErrorDetailsToggle).toHaveAttribute("open", "");
  await expect(model3ErrorDetailsToggle.getByText("Status Code")).toBeVisible();
  await expect(model3ErrorDetailsToggle.getByText("503")).toBeVisible();

  capture.stop();
});

test("exposes stable literal selector ID contract values", async ({ page }) => {
  await mockModelsSuccess(page, [{ id: "gpt-4.1-mini" }, { id: "gpt-4o" }]);

  await page.goto("/");

  await expect(page.locator("#model1-select")).toBeVisible();
  await expect(page.locator("#model2-select")).toBeVisible();
  await expect(page.locator("#model3-select")).toBeVisible();
  await expect(page.locator("#model1-select option")).toHaveCount(3);
  await expect(page.locator("#model2-select option")).toHaveCount(3);
  await expect(page.locator("#model3-select option")).toHaveCount(3);
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

  const model1Select = getModel1Select(page);
  const model2Select = getModel2Select(page);
  const model3Select = getModel3Select(page);
  await model1Select.selectOption("gpt-4o");
  await model2Select.selectOption("gpt-4.1-mini");
  await model3Select.selectOption("gpt-4o");

  await getPromptInput(page).fill("Write a greeting");
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
  await expect(
    page.getByText("Waiting for Model 1 and Model 2 responses..."),
  ).toBeVisible();

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
    page.getByRole("heading", { name: "Compare OpenAI Models" }),
  ).toBeVisible();
  await expect(page.locator(`#${MODEL_SELECT_IDS.model1} option`)).toHaveCount(
    2,
  );

  const promptInput = getPromptInput(page);
  await promptInput.fill("Write a greeting");
  await expect(promptInput).toHaveValue("Write a greeting");

  const capture = startRespondRequestCapture(page);
  await page.getByRole("button", { name: "Send" }).click();

  await expect.poll(() => capture.requests.length).toBe(2);
  expect(capture.getParseError()).toBeNull();

  await expect(page.getByText("Something went wrong")).toHaveCount(2);
  await expect(
    page.locator('[data-testid="comparison-output-error"]'),
  ).toContainText(
    "Unable to compare model outputs due to errors when querying Model 1 (gpt-4.1-mini), Model 2 (gpt-4.1-mini)",
  );

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
  await expect(page.locator(`#${MODEL_SELECT_IDS.model1} option`)).toHaveCount(
    2,
  );
  await getPromptInput(page).fill("Write a greeting");

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

test("keeps long heading and response content contained within output panels", async ({
  page,
}) => {
  const longModelId =
    "model-" + "supercalifragilisticexpialidocious".repeat(10);
  const longResponse =
    "response-" + "supercalifragilisticexpialidocious".repeat(18);

  await mockModelsSuccess(page, [{ id: longModelId }]);
  await mockRespondSuccess(page, longResponse, longModelId);

  await page.goto("/");
  await getModel1Select(page).selectOption(longModelId);
  await getModel2Select(page).selectOption(longModelId);
  await getPromptInput(page).fill("Write a greeting");
  await page.getByRole("button", { name: "Send" }).click();

  const firstPanel = page
    .locator('section[aria-live="polite"] article')
    .first();
  const firstHeading = firstPanel.locator("h2");
  const firstResponse = firstPanel.locator("p.whitespace-pre-wrap");

  await expect(firstPanel).toBeVisible();
  await expect(firstHeading).toContainText(longModelId);
  await expect(firstResponse).toContainText(longResponse);
  await expectContainedWithin(firstHeading, firstPanel);
  await expectContainedWithin(firstResponse, firstPanel);
});

test("keeps expanded long error details contained within the error panel", async ({
  page,
}) => {
  const longDetails =
    "details-" + "supercalifragilisticexpialidocious".repeat(18);

  await mockModelsSuccess(page, [{ id: "gpt-4.1-mini" }]);
  await page.route("**/api/respond", async (route) => {
    await route.fulfill({
      status: 400,
      contentType: "application/json",
      body: JSON.stringify({
        message: "Request to OpenAI failed.",
        details: longDetails,
      }),
    });
  });

  await page.goto("/");
  await getModel1Select(page).selectOption("gpt-4.1-mini");
  await getModel2Select(page).selectOption("gpt-4.1-mini");
  await getPromptInput(page).fill("Write a greeting");
  await page.getByRole("button", { name: "Send" }).click();

  const firstPanel = page
    .locator('section[aria-live="polite"] article')
    .first();
  const firstErrorAlert = firstPanel.locator('[role="alert"]');
  const firstDetails = firstErrorAlert
    .locator('[data-testid="error-details-toggle"]')
    .first();
  await expect(firstErrorAlert).toBeVisible();
  await firstDetails.locator("summary").click();

  const detailValue = firstDetails.locator("dd").last();
  await expect(detailValue).toBeVisible();
  const detailText = await detailValue.evaluate(
    (element) => element.textContent ?? "",
  );
  expect(detailText.startsWith("details-")).toBe(true);
  await expectContainedWithin(firstErrorAlert, firstPanel);
  await expectContainedWithin(detailValue, firstErrorAlert);
});
