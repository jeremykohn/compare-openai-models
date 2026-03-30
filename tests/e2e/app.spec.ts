import { test, expect } from "@playwright/test";

test("renders main shell and submit button", async ({ page }) => {
  await page.route("**/api/models", async (route) => {
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
    page.getByRole("heading", { name: "ChatGPT prompt tester" }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Send" })).toBeVisible();
});
