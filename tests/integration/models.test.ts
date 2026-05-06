import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { clearModelsResponseCache } from "../../server/utils/models-response-cache";
import {
  buildRuntimeConfig,
  loadModelsHandler,
  mockFetchImplementation,
} from "./helpers/route-harness";

let tempDirectoryPath = "";
let modelsConfigFilePath = "";

async function writeValidConfig(): Promise<void> {
  await writeFile(
    modelsConfigFilePath,
    JSON.stringify(
      {
        "unavailable-models": ["z-model", "legacy-model"],
      },
      null,
      2,
    ),
    "utf8",
  );
}

describe("/api/models route integration", () => {
  beforeEach(async () => {
    tempDirectoryPath = await mkdtemp(
      join(tmpdir(), "compare-openai-models-config-"),
    );
    modelsConfigFilePath = join(tempDirectoryPath, "openai-models.json");
    clearModelsResponseCache();
    await writeValidConfig();
  });

  afterEach(async () => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    await rm(tempDirectoryPath, { recursive: true, force: true });
    tempDirectoryPath = "";
    modelsConfigFilePath = "";
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

    const handler = await loadModelsHandler(
      buildRuntimeConfig({ openaiModelsConfigPath: modelsConfigFilePath }),
    );
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

  it("keeps filtering and logs warning when extra keys are present", async () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    await writeFile(
      modelsConfigFilePath,
      JSON.stringify(
        {
          "unavailable-models": ["z-model"],
          "legacy-key": ["ignored-model"],
        },
        null,
        2,
      ),
      "utf8",
    );

    mockFetchImplementation(
      vi.fn(async () => ({
        ok: true,
        json: async () => ({
          data: [
            { id: "a-model", created: 1, owned_by: "openai" },
            { id: "z-model", created: 2, owned_by: "openai" },
          ],
        }),
      })) as unknown as typeof fetch,
    );

    const handler = await loadModelsHandler(
      buildRuntimeConfig({ openaiModelsConfigPath: modelsConfigFilePath }),
    );
    const response = (await handler()) as {
      data: Array<{ id: string }>;
      usedConfigFilter: boolean;
      showFallbackNote: boolean;
    };

    expect(response.usedConfigFilter).toBe(true);
    expect(response.showFallbackNote).toBe(false);
    expect(response.data.map((item) => item.id)).toEqual(["a-model"]);
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining("legacy-key"));
  });

  it("returns fallback note when unavailable-models key is missing", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    await writeFile(
      modelsConfigFilePath,
      JSON.stringify({ "legacy-only": [] }, null, 2),
      "utf8",
    );

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

    const handler = await loadModelsHandler(
      buildRuntimeConfig({ openaiModelsConfigPath: modelsConfigFilePath }),
    );
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
    expect(errorSpy).toHaveBeenCalledWith(
      expect.stringContaining('missing required key "unavailable-models"'),
    );
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

    const handler = await loadModelsHandler(
      buildRuntimeConfig({ openaiModelsConfigPath: modelsConfigFilePath }),
    );
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
        status: 429,
        statusText: "Too Many Requests",
        text: async () => "Authorization: Bearer sk-secret-12345678",
      })) as unknown as typeof fetch,
    );

    const handler = await loadModelsHandler(
      buildRuntimeConfig({ openaiModelsConfigPath: modelsConfigFilePath }),
    );

    await expect(handler()).rejects.toMatchObject({
      statusCode: 429,
      data: {
        message: "Error: Failed API call, could not get list of OpenAI models",
        statusText: "Too Many Requests",
        details: expect.stringContaining("[REDACTED]"),
      },
    });
  });

  it("extracts typed fields from structured upstream errors", async () => {
    mockFetchImplementation(
      vi.fn(async () => ({
        ok: false,
        status: 400,
        statusText: "Bad Request",
        text: async () =>
          JSON.stringify({
            error: {
              type: "invalid_request_error",
              code: "model_not_found",
              param: "model",
            },
          }),
      })) as unknown as typeof fetch,
    );

    const handler = await loadModelsHandler(
      buildRuntimeConfig({ openaiModelsConfigPath: modelsConfigFilePath }),
    );

    await expect(handler()).rejects.toMatchObject({
      statusCode: 400,
      data: {
        message: "Error: Failed API call, could not get list of OpenAI models",
        statusText: "Bad Request",
        type: "invalid_request_error",
        code: "model_not_found",
        param: "model",
      },
    });
  });
});
