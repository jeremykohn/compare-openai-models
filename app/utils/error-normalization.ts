import type { ApiErrorResponse } from "../../types/api";
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
  if (isNetworkFetchError(error)) {
    return {
      category: "network",
      message: NETWORK_MESSAGE,
    };
  }

  const apiMessage = coerceApiMessage(error);
  const apiDetails = coerceApiDetails(error);

  if (apiMessage) {
    return {
      category: "api",
      message: sanitizeErrorText(apiMessage),
      details: sanitizeOptionalErrorText(apiDetails),
    };
  }

  if (error instanceof Error) {
    return {
      category: "unknown",
      message: UNKNOWN_MESSAGE,
      details: sanitizeOptionalErrorText(error.message),
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
