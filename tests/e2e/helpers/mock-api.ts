import type { Page, Route } from "@playwright/test";

type ModelEntry = {
  id: string;
  object?: string;
  created?: number;
  owned_by?: string;
};

type ModelsPayloadOptions = {
  usedConfigFilter?: boolean;
  showFallbackNote?: boolean;
};

function normalizeModels(models: ModelEntry[]): Required<ModelEntry>[] {
  return models.map((model) => ({
    id: model.id,
    object: model.object ?? "model",
    created: model.created ?? 0,
    owned_by: model.owned_by ?? "openai",
  }));
}

export async function mockModelsSuccess(
  page: Page,
  models: ModelEntry[],
  options: ModelsPayloadOptions = {},
): Promise<void> {
  await page.route("**/api/models", async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        object: "list",
        data: normalizeModels(models),
        usedConfigFilter: options.usedConfigFilter ?? true,
        showFallbackNote: options.showFallbackNote ?? false,
      }),
    });
  });
}

export async function mockModelsError(
  page: Page,
  message = "Error: Failed API call, could not get list of OpenAI models",
  details?: string,
): Promise<void> {
  await page.route("**/api/models", async (route: Route) => {
    await route.fulfill({
      status: 500,
      contentType: "application/json",
      body: JSON.stringify({
        message,
        details,
      }),
    });
  });
}

export async function mockModelsWithDelay(
  page: Page,
  models: ModelEntry[],
  delayMs: number,
): Promise<void> {
  await page.route("**/api/models", async (route: Route) => {
    await new Promise((resolve) => setTimeout(resolve, delayMs));
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        object: "list",
        data: normalizeModels(models),
        usedConfigFilter: true,
        showFallbackNote: false,
      }),
    });
  });
}

export async function mockRespondSuccess(
  page: Page,
  responseText: string,
  model = "gpt-4.1-mini",
): Promise<void> {
  await page.route("**/api/respond", async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        response: responseText,
        model,
      }),
    });
  });
}

export async function mockRespondError(
  page: Page,
  status: number,
  message: string,
  details?: string,
): Promise<void> {
  await page.route("**/api/respond", async (route: Route) => {
    await route.fulfill({
      status,
      contentType: "application/json",
      body: JSON.stringify({
        message,
        details,
      }),
    });
  });
}
