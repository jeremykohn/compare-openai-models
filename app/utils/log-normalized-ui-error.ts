import type { NormalizedUiError } from "./error-normalization";

export function logNormalizedUiError(
  source: string,
  error: NormalizedUiError,
): void {
  console.error(`[${source}] ${error.category}: ${error.message}`, {
    details: error.details,
  });
}
