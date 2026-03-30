import { test, expect } from "@playwright/test";

test("shows model select options", async ({ page }) => {
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
          { id: "gpt-4o", object: "model", created: 0, owned_by: "openai" },
        ],
        usedConfigFilter: true,
        showFallbackNote: false,
      }),
    });
  });

  await page.goto("/");
  await expect(page.getByLabel("Model *")).toBeVisible();
  await expect(
    page.getByRole("option", { name: "gpt-4.1-mini" }),
  ).toBeVisible();
});
