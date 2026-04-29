import type { Page } from "@playwright/test";

export function getModel1Select(page: Page) {
  return page.locator("#model1-select");
}

export function getModel2Select(page: Page) {
  return page.locator("#model2-select");
}

export function getModel3Select(page: Page) {
  return page.getByLabel(/Model 3 for comparing responses/);
}

export const getModelComparisonSelect = getModel3Select;

export function getPromptInput(page: Page) {
  return page.locator("#prompt-input");
}
