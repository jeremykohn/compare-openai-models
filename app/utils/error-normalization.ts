import type { ApiErrorResponse } from "~~/types/api";
import {
  sanitizeOptionalErrorText,
  sanitizeErrorText,
} from "./error-sanitization";
import { isApiError, isNetworkFetchError } from "./type-guards";

export type UiErrorCategory = "network" | "api" | "unknown";

export type NormalizedUiError = {
  category: UiErrorCategory;
  statusCode?: number;
  message: string;
  details?: string;
  code?: string;
  type?: string;
  param?: string;
};

const NETWORK_MESSAGE =
  "Network error: Unable to reach OpenAI. Please check your internet connection and try again.";
const UNKNOWN_MESSAGE =
  "An unexpected error occurred. Please try again or contact support.";
const DETAILS_MAX_LENGTH = 256;

function truncateDetails(value: string): string {
  if (value.length <= DETAILS_MAX_LENGTH) {
    return value;
  }

  return value.slice(0, DETAILS_MAX_LENGTH - 1) + "…";
}

function sanitizeAndTruncateDetails(
  value: string | undefined,
): string | undefined {
  const sanitized = sanitizeOptionalErrorText(value);

  if (!sanitized) {
    return undefined;
  }

  return truncateDetails(sanitized);
}

function coerceFallbackDetails(error: unknown): string | undefined {
  if (error === null || error === undefined) {
    return undefined;
  }

  let raw = "";

  if (error instanceof Error) {
    raw = `${error.name}: ${error.message}`;
  } else if (typeof error === "string") {
    raw = error;
  } else if (typeof error === "number" || typeof error === "boolean") {
    raw = String(error);
  } else {
    try {
      raw = JSON.stringify(error);
    } catch {
      raw = String(error);
    }
  }

  const sanitized = sanitizeOptionalErrorText(raw);
  if (!sanitized) {
    return undefined;
  }

  return truncateDetails(sanitized);
}

function coerceApiMessage(error: unknown): string | undefined {
  if (!isApiError(error)) {
    return undefined;
  }

  if (typeof error.message === "string" && error.message.trim()) {
    return error.message;
  }

  if (typeof error.error?.message === "string" && error.error.message.trim()) {
    return error.error.message;
  }

  return undefined;
}

function coerceApiDetails(error: unknown): string | undefined {
  if (!isApiError(error)) {
    return undefined;
  }

  if (typeof error.details === "string" && error.details.trim()) {
    return error.details;
  }

  if (typeof error.error?.details === "string" && error.error.details.trim()) {
    return error.error.details;
  }

  return undefined;
}

function coerceApiType(error: unknown): string | undefined {
  if (!isApiError(error)) {
    return undefined;
  }

  if (typeof error.type === "string" && error.type.trim()) {
    return error.type;
  }

  if (typeof error.error?.type === "string" && error.error.type.trim()) {
    return error.error.type;
  }

  return undefined;
}

function coerceApiCode(error: unknown): string | undefined {
  if (!isApiError(error)) {
    return undefined;
  }

  if (typeof error.code === "string" && error.code.trim()) {
    return error.code;
  }

  if (typeof error.error?.code === "string" && error.error.code.trim()) {
    return error.error.code;
  }

  return undefined;
}

function coerceApiParam(error: unknown): string | undefined {
  if (!isApiError(error)) {
    return undefined;
  }

  if (typeof error.param === "string" && error.param.trim()) {
    return error.param;
  }

  if (typeof error.error?.param === "string" && error.error.param.trim()) {
    return error.error.param;
  }

  return undefined;
}

function coerceStatusCode(error: unknown): number | undefined {
  if (!error || typeof error !== "object") return undefined;
  const candidate = error as Record<string, unknown>;
  const code = candidate.statusCode ?? candidate.status;
  if (
    typeof code === "number" &&
    Number.isFinite(code) &&
    code >= 100 &&
    code <= 599
  ) {
    return code;
  }
  return undefined;
}

export function normalizeUiError(error: unknown): NormalizedUiError {
  if (isNetworkFetchError(error)) {
    return {
      category: "network",
      message: NETWORK_MESSAGE,
    };
  }

  const apiMessage = coerceApiMessage(error);
  const apiDetails = coerceApiDetails(error);
  const apiType = coerceApiType(error);
  const apiCode = coerceApiCode(error);
  const apiParam = coerceApiParam(error);
  const statusCode = coerceStatusCode(error);
  const fallbackDetails = coerceFallbackDetails(error);

  if (apiMessage) {
    return {
      category: "api",
      statusCode,
      message: sanitizeErrorText(apiMessage),
      details: sanitizeAndTruncateDetails(apiDetails),
      type: sanitizeOptionalErrorText(apiType),
      code: sanitizeOptionalErrorText(apiCode),
      param: sanitizeOptionalErrorText(apiParam),
    };
  }

  const sanitizedApiType = sanitizeOptionalErrorText(apiType);
  const sanitizedApiCode = sanitizeOptionalErrorText(apiCode);
  const sanitizedApiParam = sanitizeOptionalErrorText(apiParam);

  if (
    isApiError(error) &&
    (sanitizedApiType ||
      sanitizedApiCode ||
      sanitizedApiParam ||
      typeof statusCode === "number")
  ) {
    return {
      category: "api",
      statusCode,
      message: UNKNOWN_MESSAGE,
      details: fallbackDetails,
      type: sanitizedApiType,
      code: sanitizedApiCode,
      param: sanitizedApiParam,
    };
  }

  if (error instanceof Error) {
    return {
      category: "unknown",
      message: UNKNOWN_MESSAGE,
      details: fallbackDetails,
    };
  }

  if (fallbackDetails) {
    return {
      category: typeof statusCode === "number" ? "api" : "unknown",
      statusCode,
      message: UNKNOWN_MESSAGE,
      details: fallbackDetails,
    };
  }

  return {
    category: "unknown",
    message: UNKNOWN_MESSAGE,
  };
}

export function normalizeApiErrorResponse(
  status: number,
  body: ApiErrorResponse,
): NormalizedUiError {
  return {
    category: "api",
    statusCode: status >= 100 && status <= 599 ? status : undefined,
    message: sanitizeErrorText(body.message),
    details: sanitizeAndTruncateDetails(body.details),
    code: sanitizeOptionalErrorText(body.code),
    type: sanitizeOptionalErrorText(body.type),
    param: sanitizeOptionalErrorText(body.param),
  };
}
