type MaybeApiError = {
  message?: unknown;
  details?: unknown;
  error?: {
    message?: unknown;
    details?: unknown;
  };
};

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

  return Boolean(candidate.message || candidate.error?.message);
}
