import type { Page, Request, Route } from "@playwright/test";

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

type RespondRequestPayload = {
  prompt: string;
  model?: string;
};

type RespondRequestCapture = {
  requests: RespondRequestPayload[];
  getParseError: () => Error | null;
  stop: () => void;
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

export function startRespondRequestCapture(page: Page): RespondRequestCapture {
  const requests: RespondRequestPayload[] = [];
  let parseError: Error | null = null;

  const onRequest = (request: Request) => {
    if (
      !request.url().includes("/api/respond") ||
      request.method() !== "POST"
    ) {
      return;
    }

    const rawPostData = request.postData();
    if (!rawPostData) {
      parseError =
        parseError ?? new Error("Expected POST body for /api/respond request.");
      return;
    }

    let parsedPayload: unknown;
    try {
      parsedPayload = JSON.parse(rawPostData);
    } catch {
      parseError =
        parseError ??
        new Error("Failed to parse /api/respond request body as JSON.");
      return;
    }

    if (
      !parsedPayload ||
      typeof parsedPayload !== "object" ||
      Array.isArray(parsedPayload)
    ) {
      parseError =
        parseError ??
        new Error("Expected /api/respond request payload to be a JSON object.");
      return;
    }

    const candidate = parsedPayload as {
      prompt?: unknown;
      model?: unknown;
    };

    if (typeof candidate.prompt !== "string") {
      parseError =
        parseError ??
        new Error(
          "Expected /api/respond request payload to contain a string prompt.",
        );
      return;
    }

    requests.push({
      prompt: candidate.prompt,
      model: typeof candidate.model === "string" ? candidate.model : undefined,
    });
  };

  page.on("request", onRequest);

  return {
    requests,
    getParseError: () => parseError,
    stop: () => page.off("request", onRequest),
  };
}
