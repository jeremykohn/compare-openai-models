import type { ApiErrorResponse } from "~~/types/api";
import {
  sanitizeOptionalErrorText,
  sanitizeErrorText,
} from "./error-sanitization";
import { isApiError, isNetworkFetchError } from "./type-guards";

export type UiErrorCategory = "network" | "api" | "unknown";

export type NormalizedUiError = {
  category: UiErrorCategory;
  message: string;
  details?: string;
};

const NETWORK_MESSAGE =
  "Network error: Unable to reach OpenAI. Please check your internet connection and try again.";
const UNKNOWN_MESSAGE =
  "An unexpected error occurred. Please try again or contact support.";

function normalizeErrorType(
  type: string | undefined,
  category: UiErrorCategory,
): string {
  if (type && type.trim()) {
    return sanitizeErrorText(type.trim());
  }

  if (category === "api") {
    return "API error";
  }

  if (category === "network") {
    return "Network error";
  }

  return "Unknown error";
}

function coerceStatusCode(error: unknown): number | undefined {
  if (!error || typeof error !== "object") {
    return undefined;
  }

  const candidate = error as {
    statusCode?: unknown;
    status?: unknown;
    error?: {
      statusCode?: unknown;
      status?: unknown;
    };
  };

  const value =
    typeof candidate.statusCode === "number"
      ? candidate.statusCode
      : typeof candidate.status === "number"
        ? candidate.status
        : typeof candidate.error?.statusCode === "number"
          ? candidate.error.statusCode
          : typeof candidate.error?.status === "number"
            ? candidate.error.status
            : undefined;

  if (!value || !Number.isInteger(value) || value < 100 || value > 599) {
    return undefined;
  }

  return value;
}

function coerceErrorType(error: unknown): string | undefined {
  if (error instanceof Error) {
    return error.name;
  }

  if (!error || typeof error !== "object") {
    return undefined;
  }

  const candidate = error as {
    type?: unknown;
    error?: {
      type?: unknown;
    };
  };

  if (typeof candidate.type === "string") {
    return candidate.type;
  }

  if (typeof candidate.error?.type === "string") {
    return candidate.error.type;
  }

  return undefined;
}

function buildSafeDetails(
  category: UiErrorCategory,
  options: {
    statusCode?: number;
    errorType?: string;
    details?: string;
  },
): string {
  const lines = [
    `Error type: ${normalizeErrorType(options.errorType, category)}`,
  ];

  if (options.statusCode) {
    lines.push(`Status code: ${options.statusCode}`);
  }

  if (options.details) {
    lines.push(`Detail: ${options.details}`);
  }

  return lines.join("\n");
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

export function normalizeUiError(error: unknown): NormalizedUiError {
  const statusCode = coerceStatusCode(error);
  const errorType = coerceErrorType(error);

  if (isNetworkFetchError(error)) {
    return {
      category: "network",
      message: NETWORK_MESSAGE,
      details: buildSafeDetails("network", {
        statusCode,
        errorType,
      }),
    };
  }

  const apiMessage = coerceApiMessage(error);
  const apiDetails = coerceApiDetails(error);

  if (apiMessage) {
    return {
      category: "api",
      message: sanitizeErrorText(apiMessage),
      details: buildSafeDetails("api", {
        statusCode,
        errorType,
        details: sanitizeOptionalErrorText(apiDetails),
      }),
    };
  }

  if (error instanceof Error) {
    return {
      category: "unknown",
      message: UNKNOWN_MESSAGE,
      details: buildSafeDetails("unknown", {
        statusCode,
        errorType,
      }),
    };
  }

  return {
    category: "unknown",
    message: UNKNOWN_MESSAGE,
    details: buildSafeDetails("unknown", {
      statusCode,
      errorType,
    }),
  };
}

export function normalizeApiErrorResponse(
  status: number,
  body: ApiErrorResponse,
): NormalizedUiError {
  if (status >= 500) {
    return {
      category: "api",
      message: sanitizeErrorText(body.message),
      details: sanitizeOptionalErrorText(body.details),
    };
  }

  return {
    category: "api",
    message: sanitizeErrorText(body.message),
    details: sanitizeOptionalErrorText(body.details),
  };
}
