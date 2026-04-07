const API_KEY_PATTERN = /\bsk-[A-Za-z0-9_-]{8,}\b/g;
const BEARER_TOKEN_PATTERN = /Bearer\s+[A-Za-z0-9._~+/=-]+/gi;
const AUTH_HEADER_PATTERN = /Authorization\s*:\s*[^\n\r]+/gi;

export function sanitizeErrorText(value: string): string {
  return value
    .replace(AUTH_HEADER_PATTERN, "Authorization: [REDACTED]")
    .replace(BEARER_TOKEN_PATTERN, "Bearer [REDACTED]")
    .replace(API_KEY_PATTERN, "[REDACTED]");
}

export function sanitizeOptionalErrorText(value?: string): string | undefined {
  if (!value || !value.trim()) {
    return undefined;
  }

  return sanitizeErrorText(value);
}
