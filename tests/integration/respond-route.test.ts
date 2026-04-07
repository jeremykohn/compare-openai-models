import { afterEach, describe, expect, it, vi } from "vitest";
import { clearModelValidationCache } from "../../server/utils/openai-model-validation";
import {
  buildRuntimeConfig,
  loadRespondHandler,
  mockFetchImplementation,
} from "./helpers/route-harness";

describe("/api/respond route integration", () => {
  afterEach(() => {
    clearModelValidationCache();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("returns default model when request omits model", async () => {
    const fetchSpy = vi.fn(async () => ({
      ok: true,
      json: async () => ({ output_text: "Hello from OpenAI" }),
    })) as unknown as typeof fetch;

    mockFetchImplementation(fetchSpy);

    const handler = await loadRespondHandler(buildRuntimeConfig(), {
      prompt: "  hello  ",
    });

    const response = (await handler({})) as { response: string; model: string };

    expect(response).toEqual({
      response: "Hello from OpenAI",
      model: "gpt-4.1-mini",
    });

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(fetchSpy).toHaveBeenCalledWith(
      "https://api.openai.com/v1/responses",
      expect.objectContaining({
        method: "POST",
      }),
    );
  });

  it("returns 400 for invalid prompt", async () => {
    mockFetchImplementation(
      vi.fn(async () => ({ ok: true })) as unknown as typeof fetch,
    );

    const handler = await loadRespondHandler(buildRuntimeConfig(), {
      prompt: "   ",
    });

    await expect(handler({})).rejects.toMatchObject({
      statusCode: 400,
      data: {
        message: "Please enter a prompt.",
      },
    });
  });

  it("returns 400 when selected model is invalid", async () => {
    const fetchSpy = vi.fn(async (url: string) => {
      if (url.endsWith("/models")) {
        return {
          ok: true,
          json: async () => ({ data: [{ id: "gpt-4.1-mini" }] }),
        };
      }

      return {
        ok: true,
        json: async () => ({ output_text: "should not be used" }),
      };
    }) as unknown as typeof fetch;

    mockFetchImplementation(fetchSpy);

    const handler = await loadRespondHandler(buildRuntimeConfig(), {
      prompt: "hello",
      model: "unknown-model",
    });

    await expect(handler({})).rejects.toMatchObject({
      statusCode: 400,
      data: {
        message: "Model is not valid",
      },
    });
  });

  it("returns 502 when model validation is unavailable", async () => {
    const fetchSpy = vi.fn(async (url: string) => {
      if (url.endsWith("/models")) {
        return {
          ok: false,
        };
      }

      return {
        ok: true,
        json: async () => ({ output_text: "should not be used" }),
      };
    }) as unknown as typeof fetch;

    mockFetchImplementation(fetchSpy);

    const handler = await loadRespondHandler(buildRuntimeConfig(), {
      prompt: "hello",
      model: "gpt-4.1-mini",
    });

    await expect(handler({})).rejects.toMatchObject({
      statusCode: 502,
      data: {
        message: "Unable to validate model right now. Please try again.",
      },
    });
  });

  it("returns upstream status with sanitized details", async () => {
    const fetchSpy = vi.fn(async () => ({
      ok: false,
      status: 429,
      text: async () => "Authorization: Bearer sk-secret-12345678",
    })) as unknown as typeof fetch;

    mockFetchImplementation(fetchSpy);

    const handler = await loadRespondHandler(buildRuntimeConfig(), {
      prompt: "hello",
    });

    await expect(handler({})).rejects.toMatchObject({
      statusCode: 429,
      data: {
        message: "Request to OpenAI failed.",
        details: expect.stringContaining("[REDACTED]"),
      },
    });
  });

  it("returns 500 with sanitized details on thrown upstream error", async () => {
    const fetchSpy = vi.fn(async () => {
      throw new Error("Bearer abc.def sk-secret-12345678");
    }) as unknown as typeof fetch;

    mockFetchImplementation(fetchSpy);

    const handler = await loadRespondHandler(buildRuntimeConfig(), {
      prompt: "hello",
    });

    await expect(handler({})).rejects.toMatchObject({
      statusCode: 500,
      data: {
        message: "Request to OpenAI failed.",
        details: expect.stringContaining("[REDACTED]"),
      },
    });
  });
});
