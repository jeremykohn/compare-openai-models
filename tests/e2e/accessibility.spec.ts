import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("has no critical accessibility violations on initial load", async ({
  page,
}) => {
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
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa"])
    .analyze();
  expect(results.violations).toEqual([]);
});
