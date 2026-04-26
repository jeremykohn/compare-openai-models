type MaybeApiError = {
  message?: unknown;
  details?: unknown;
  type?: unknown;
  code?: unknown;
  param?: unknown;
  status?: unknown;
  statusCode?: unknown;
  error?: {
    message?: unknown;
    details?: unknown;
    type?: unknown;
    code?: unknown;
    param?: unknown;
  };
};

function hasValidHttpStatus(value: unknown): boolean {
  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    value >= 100 &&
    value <= 599
  );
}

export function isRespondSuccessPayload(
  payload: Record<string, unknown>,
): payload is { response: string; model: string } {
  return (
    typeof payload.response === "string" && typeof payload.model === "string"
  );
}

export function isNetworkFetchError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }

  return (
    error.name === "AbortError" ||
    /network|failed to fetch|timeout|fetch/i.test(error.message)
  );
}

export function isApiError(error: unknown): error is MaybeApiError {
  if (!error || typeof error !== "object") {
    return false;
  }

  const candidate = error as MaybeApiError;

  return Boolean(
    candidate.message ||
    candidate.error?.message ||
    candidate.type ||
    candidate.code ||
    candidate.param ||
    candidate.error?.type ||
    candidate.error?.code ||
    candidate.error?.param ||
    hasValidHttpStatus(candidate.statusCode) ||
    hasValidHttpStatus(candidate.status),
  );
}
