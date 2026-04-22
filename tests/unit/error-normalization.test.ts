import { describe, expect, it } from "vitest";
import { normalizeUiError } from "../../app/utils/error-normalization";

describe("normalizeUiError", () => {
  it("normalizes network errors", () => {
    const error = new Error("Failed to fetch");
    const normalized = normalizeUiError(error);
    expect(normalized.category).toBe("network");
    expect(normalized.details).toContain("Error type:");
  });

  it("normalizes api errors with details", () => {
    const normalized = normalizeUiError({
      message: "Bad request",
      statusCode: 400,
      details: "Authorization: Bearer abc",
    });

    expect(normalized.category).toBe("api");
    expect(normalized.message).toBe("Bad request");
    expect(normalized.details).toContain("Error type: API error");
    expect(normalized.details).toContain("Status code: 400");
    expect(normalized.details).toContain("[REDACTED]");
  });

  it("normalizes unknown errors", () => {
    const normalized = normalizeUiError(123);
    expect(normalized.category).toBe("unknown");
    expect(normalized.details).toContain("Error type: Unknown error");
  });
});
