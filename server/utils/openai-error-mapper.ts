import { sanitizeOptionalErrorText } from "~~/app/utils/error-sanitization";

const MAX_TYPED_FIELD_LENGTH = 128;
const MAX_DETAILS_LENGTH = 256;

type UpstreamErrorData = {
  code?: string;
  type?: string;
  param?: string;
  details?: string;
};

type UpstreamErrorPayload = {
  error?: {
    code?: unknown;
    type?: unknown;
    param?: unknown;
  };
  code?: unknown;
  type?: unknown;
  param?: unknown;
};

function truncateValue(value: string, maxLength: number): string {
  return value.slice(0, maxLength);
}

function sanitizeAndLimit(
  value: string,
  maxLength: number,
): string | undefined {
  const sanitized = sanitizeOptionalErrorText(value);

  if (!sanitized) {
    return undefined;
  }

  return truncateValue(sanitized, maxLength);
}

function toSafeString(value: unknown, maxLength: number): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  return sanitizeAndLimit(value, maxLength);
}

function extractStructuredFields(
  payload: unknown,
): Omit<UpstreamErrorData, "details"> {
  if (!payload || typeof payload !== "object") {
    return {};
  }

  const upstreamPayload = payload as UpstreamErrorPayload;
  const nested =
    upstreamPayload.error && typeof upstreamPayload.error === "object"
      ? upstreamPayload.error
      : undefined;

  return {
    code: toSafeString(
      upstreamPayload.code ?? nested?.code,
      MAX_TYPED_FIELD_LENGTH,
    ),
    type: toSafeString(
      upstreamPayload.type ?? nested?.type,
      MAX_TYPED_FIELD_LENGTH,
    ),
    param: toSafeString(
      upstreamPayload.param ?? nested?.param,
      MAX_TYPED_FIELD_LENGTH,
    ),
  };
}

function hasStructuredFields(
  data: Omit<UpstreamErrorData, "details">,
): boolean {
  return Boolean(data.code || data.type || data.param);
}

function buildFallbackDetails(
  payload: unknown,
  rawText: string,
): string | undefined {
  if (payload !== undefined) {
    const serializedPayload = JSON.stringify(payload);

    if (serializedPayload) {
      return sanitizeAndLimit(serializedPayload, MAX_DETAILS_LENGTH);
    }
  }

  return sanitizeAndLimit(rawText, MAX_DETAILS_LENGTH);
}

export async function mapOpenAIErrorResponse(
  response: Response,
): Promise<UpstreamErrorData> {
  const rawText = await response.text();
  let payload: unknown;

  try {
    payload = rawText ? JSON.parse(rawText) : undefined;
  } catch {
    payload = undefined;
  }

  const structuredFields = extractStructuredFields(payload);

  if (hasStructuredFields(structuredFields)) {
    return structuredFields;
  }

  return {
    ...structuredFields,
    details: buildFallbackDetails(payload, rawText),
  };
}

export function toSafeStatusText(statusText: string): string | undefined {
  return sanitizeAndLimit(statusText, MAX_TYPED_FIELD_LENGTH);
}
