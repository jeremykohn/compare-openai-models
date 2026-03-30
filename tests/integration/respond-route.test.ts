import { describe, expect, it, vi } from "vitest";
import {
  clearModelValidationCache,
  validateSelectedModel,
} from "../../server/utils/openai-model-validation";

describe("respond route integration primitives", () => {
  it("returns invalid for model absent in upstream set", async () => {
    clearModelValidationCache();
    const fetchImpl = vi.fn(async () => ({
      ok: true,
      json: async () => ({ data: [{ id: "gpt-4.1-mini" }] }),
    })) as unknown as typeof fetch;

    const result = await validateSelectedModel(
      "unknown-model",
      "https://api.openai.com/v1",
      "sk-test-12345678",
      fetchImpl,
    );

    expect(result).toBe("invalid");
  });

  it("returns unavailable when upstream call fails", async () => {
    clearModelValidationCache();
    const fetchImpl = vi.fn(async () => ({
      ok: false,
    })) as unknown as typeof fetch;
    const result = await validateSelectedModel(
      "gpt-4.1-mini",
      "https://api.openai.com/v1",
      "sk-test-12345678",
      fetchImpl,
    );

    expect(result).toBe("unavailable");
  });
});
