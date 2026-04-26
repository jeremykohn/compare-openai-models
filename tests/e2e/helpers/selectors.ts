import type { Page } from "@playwright/test";

export function getLeftModelSelect(page: Page) {
  return page.locator("#models-select");
}

export function getRightModelSelect(page: Page) {
  return page.locator("#models-select-right");
}

export function getPromptInput(page: Page) {
  return page.locator("#prompt-input");
}
