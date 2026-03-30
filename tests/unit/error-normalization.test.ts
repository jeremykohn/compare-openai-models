import { describe, expect, it } from "vitest";
import { normalizeUiError } from "../../app/utils/error-normalization";

describe("normalizeUiError", () => {
  it("normalizes network errors", () => {
    const error = new Error("Failed to fetch");
    const normalized = normalizeUiError(error);
    expect(normalized.category).toBe("network");
  });

  it("normalizes api errors with details", () => {
    const normalized = normalizeUiError({
      message: "Bad request",
      details: "Authorization: Bearer abc",
    });

    expect(normalized.category).toBe("api");
    expect(normalized.message).toBe("Bad request");
    expect(normalized.details).toContain("[REDACTED]");
  });

  it("normalizes unknown errors", () => {
    const normalized = normalizeUiError(123);
    expect(normalized.category).toBe("unknown");
  });
});
