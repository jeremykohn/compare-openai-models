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

  it("includes statusCode from API error object", () => {
    const normalized = normalizeUiError({
      message: "Bad request",
      statusCode: 400,
    });
    expect(normalized.statusCode).toBe(400);
  });

  it("omits statusCode for network errors", () => {
    const error = new Error("Failed to fetch");
    const normalized = normalizeUiError(error);
    expect(normalized.statusCode).toBeUndefined();
  });

  it("omits statusCode when value is out of range", () => {
    const normalized = normalizeUiError({ message: "err", statusCode: 99 });
    expect(normalized.statusCode).toBeUndefined();
  });
});
