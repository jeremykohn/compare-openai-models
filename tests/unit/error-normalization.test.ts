import { describe, expect, it } from "vitest";
import {
  normalizeApiErrorResponse,
  normalizeUiError,
} from "../../app/utils/error-normalization";

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

  it("extracts typed fields from top-level API error payload", () => {
    const normalized = normalizeUiError({
      message: "Bad request",
      type: "invalid_request_error",
      code: "model_not_found",
      param: "model",
    });

    expect(normalized.category).toBe("api");
    expect(normalized.type).toBe("invalid_request_error");
    expect(normalized.code).toBe("model_not_found");
    expect(normalized.param).toBe("model");
  });

  it("extracts typed fields from nested API error payload", () => {
    const normalized = normalizeUiError({
      error: {
        message: "Bad request",
        type: "invalid_request_error",
        code: "model_not_found",
        param: "model",
      },
    });

    expect(normalized.category).toBe("api");
    expect(normalized.type).toBe("invalid_request_error");
    expect(normalized.code).toBe("model_not_found");
    expect(normalized.param).toBe("model");
  });

  it("classifies typed metadata without message as api", () => {
    const normalized = normalizeUiError({
      statusCode: 400,
      type: "invalid_request_error",
      code: "model_not_found",
    });

    expect(normalized.category).toBe("api");
    expect(normalized.type).toBe("invalid_request_error");
    expect(normalized.code).toBe("model_not_found");
  });

  it("normalizes unknown errors", () => {
    const normalized = normalizeUiError(123);
    expect(normalized.category).toBe("unknown");
  });

  it("falls back to sanitized stringified details for unsupported payloads", () => {
    const normalized = normalizeUiError({
      statusCode: 422,
      detail: "Authorization: Bearer abc.def",
    });

    expect(normalized.category).toBe("api");
    expect(normalized.details).toBeDefined();
    expect(normalized.details).toContain("[REDACTED]");
  });

  it("truncates fallback details to 256 characters", () => {
    const normalized = normalizeUiError({
      statusCode: 500,
      detail: "a".repeat(400),
    });

    expect(normalized.details).toBeDefined();
    expect(normalized.details?.length).toBeLessThanOrEqual(256);
  });

  it("normalizes parse-fallback style objects with statusCode", () => {
    const normalized = normalizeUiError({ statusCode: 503 });

    expect(normalized.category).toBe("api");
    expect(normalized.statusCode).toBe(503);
    expect(normalized.details).toContain("statusCode");
  });

  it("normalizes api error responses with typed fields", () => {
    const normalized = normalizeApiErrorResponse(400, {
      message: "Request to OpenAI failed.",
      details: "Authorization: Bearer abc.def",
      type: "invalid_request_error",
      code: "model_not_found",
      param: "model",
      statusText: "Bad Request",
    });

    expect(normalized.category).toBe("api");
    expect(normalized.statusCode).toBe(400);
    expect(normalized.type).toBe("invalid_request_error");
    expect(normalized.code).toBe("model_not_found");
    expect(normalized.param).toBe("model");
    expect(normalized.details).toContain("[REDACTED]");
  });

  it("truncates API details to 256 characters", () => {
    const normalized = normalizeUiError({
      message: "Bad request",
      details: "x".repeat(500),
    });

    expect(normalized.category).toBe("api");
    expect(normalized.details?.length).toBeLessThanOrEqual(256);
  });

  it("truncates normalized API response details to 256 characters", () => {
    const normalized = normalizeApiErrorResponse(400, {
      message: "Request to OpenAI failed.",
      details: "x".repeat(500),
    });

    expect(normalized.details?.length).toBeLessThanOrEqual(256);
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
