import { writeFile } from "node:fs/promises";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { clearModelsResponseCache } from "../../server/utils/models-response-cache";
import {
  buildRuntimeConfig,
  loadModelsHandler,
  mockFetchImplementation,
} from "./helpers/route-harness";

const modelsConfigFilePath =
  "/workspaces/compare-openai-models/server/assets/models/openai-models.json";

async function writeValidConfig(): Promise<void> {
  await writeFile(
    modelsConfigFilePath,
    JSON.stringify(
      {
        "available-models": [],
        "models-with-error": ["z-model"],
        "models-with-no-response": ["legacy-model"],
        "other-models": ["other-model"],
      },
      null,
      2,
    ),
    "utf8",
  );
}

describe("/api/models route integration", () => {
  beforeEach(async () => {
    clearModelsResponseCache();
    await writeValidConfig();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("returns strict model shape, sorted list, and metadata on valid config", async () => {
    mockFetchImplementation(
      vi.fn(async () => ({
        ok: true,
        json: async () => ({
          data: [
            {
              id: "b-model",
              object: "model",
              created: 2,
              owned_by: "openai",
            },
            {
              id: "a-model",
              object: "model",
              created: 1,
              owned_by: "openai",
            },
            {
              id: "z-model",
              object: "model",
              created: 3,
              owned_by: "openai",
            },
          ],
        }),
      })) as unknown as typeof fetch,
    );

    const handler = await loadModelsHandler(buildRuntimeConfig());
    const response = (await handler()) as {
      object: string;
      data: Array<{ id: string; object: string }>;
      usedConfigFilter: boolean;
      showFallbackNote: boolean;
    };

    expect(response.object).toBe("list");
    expect(response.usedConfigFilter).toBe(true);
    expect(response.showFallbackNote).toBe(false);
    expect(response.data.map((item) => item.id)).toEqual([
      "a-model",
      "b-model",
    ]);
    expect(response.data.every((item) => item.object === "model")).toBe(true);
  });

  it("returns fallback flags when config is invalid", async () => {
    await writeFile(modelsConfigFilePath, "{invalid-json", "utf8");

    mockFetchImplementation(
      vi.fn(async () => ({
        ok: true,
        json: async () => ({
          data: [
            { id: "b-model", created: 2, owned_by: "openai" },
            { id: "a-model", created: 1, owned_by: "openai" },
          ],
        }),
      })) as unknown as typeof fetch,
    );

    const handler = await loadModelsHandler(buildRuntimeConfig());
    const response = (await handler()) as {
      data: Array<{ id: string }>;
      usedConfigFilter: boolean;
      showFallbackNote: boolean;
    };

    expect(response.usedConfigFilter).toBe(false);
    expect(response.showFallbackNote).toBe(true);
    expect(response.data.map((item) => item.id)).toEqual([
      "a-model",
      "b-model",
    ]);
  });

  it("returns sanitized details on upstream error", async () => {
    mockFetchImplementation(
      vi.fn(async () => ({
        ok: false,
        text: async () => "Authorization: Bearer sk-secret-12345678",
      })) as unknown as typeof fetch,
    );

    const handler = await loadModelsHandler(buildRuntimeConfig());

    await expect(handler()).rejects.toMatchObject({
      statusCode: 500,
      data: {
        message: "Error: Failed API call, could not get list of OpenAI models",
        details: expect.stringContaining("[REDACTED]"),
      },
    });
  });
});
