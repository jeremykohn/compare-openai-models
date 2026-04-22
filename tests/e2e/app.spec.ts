import { test, expect } from "@playwright/test";
import { mockModelsSuccess, mockRespondSuccess } from "./helpers/mock-api";

test("runs happy path from load to rendered response", async ({ page }) => {
  await mockModelsSuccess(page, [{ id: "gpt-4.1-mini" }, { id: "gpt-4o" }]);
  await mockRespondSuccess(page, "Hello from ChatGPT", "gpt-4.1-mini");

  await page.goto("/");

  await expect(
    page.getByRole("heading", { name: "ChatGPT prompt tester" }),
  ).toBeVisible();
  const modelSelect = page.getByLabel("Model *");
  await expect(modelSelect).toBeVisible();
  await expect(page.locator("#models-select option")).toHaveCount(3);
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

  await expect(page.getByRole("heading", { name: "Response" })).toBeVisible();
  await expect(page.getByText("Hello from ChatGPT")).toBeVisible();
});
