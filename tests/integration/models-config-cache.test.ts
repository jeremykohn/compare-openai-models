import { describe, expect, it, vi } from "vitest";

import {
  clearModelValidationCache,
  getValidatedModelSet,
} from "../../server/utils/openai-model-validation";

describe("models config cache integration", () => {
  it("uses cached model set within ttl", async () => {
    clearModelValidationCache();
    const fetchImpl = vi.fn(async () => ({
      ok: true,
      json: async () => ({ data: [{ id: "gpt-4.1-mini" }] }),
    })) as unknown as typeof fetch;

    const now = 1_000_000;
    await getValidatedModelSet(
      "https://api.openai.com/v1",
      "sk-test-12345678",
      fetchImpl,
      now,
    );

    await getValidatedModelSet(
      "https://api.openai.com/v1",
      "sk-test-12345678",
      fetchImpl,
      now + 100,
    );

    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });
});
