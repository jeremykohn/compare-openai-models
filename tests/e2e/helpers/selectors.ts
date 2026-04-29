import type { Page } from "@playwright/test";
import { MODEL_SELECT_IDS } from "../../../shared/constants/model-selectors";

export function getModel1Select(page: Page) {
  return page.locator(`#${MODEL_SELECT_IDS.model1}`);
}

export function getModel2Select(page: Page) {
  return page.locator(`#${MODEL_SELECT_IDS.model2}`);
}

export function getModel3Select(page: Page) {
  return page.locator(`#${MODEL_SELECT_IDS.model3}`);
}

export function getPromptInput(page: Page) {
  return page.locator("#prompt-input");
}
