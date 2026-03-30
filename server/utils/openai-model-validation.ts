import { parseBooleanConfig } from "./openai-security";

const MODEL_VALIDATION_CACHE_TTL_MS = 5 * 60 * 1000;

type ValidationCacheRecord = {
  models: string[];
  updatedAt: number;
};

const validationCache = new Map<string, ValidationCacheRecord>();

function isCacheDisabled(): boolean {
  return parseBooleanConfig(process.env.OPENAI_DISABLE_MODEL_VALIDATION_CACHE);
}

export function clearModelValidationCache(): void {
  validationCache.clear();
}

export async function getValidatedModelSet(
  baseUrl: string,
  apiKey: string,
  fetchImpl: typeof fetch,
  now: number = Date.now(),
): Promise<Set<string>> {
  const cacheKey = baseUrl;
  const cached = validationCache.get(cacheKey);

  if (
    !isCacheDisabled() &&
    cached &&
    now - cached.updatedAt < MODEL_VALIDATION_CACHE_TTL_MS
  ) {
    return new Set(cached.models);
  }

  const response = await fetchImpl(`${baseUrl}/models`, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  });

  if (!response.ok) {
    throw new Error("Model validation upstream failed");
  }

  const payload = (await response.json()) as {
    data?: Array<{ id?: string }>;
  };

  const models = (payload.data ?? [])
    .map((entry) => entry.id)
    .filter((id): id is string => typeof id === "string");

  if (!isCacheDisabled()) {
    validationCache.set(cacheKey, {
      models,
      updatedAt: now,
    });
  }

  return new Set(models);
}

export async function validateSelectedModel(
  model: string,
  baseUrl: string,
  apiKey: string,
  fetchImpl: typeof fetch,
): Promise<"valid" | "invalid" | "unavailable"> {
  try {
    const models = await getValidatedModelSet(baseUrl, apiKey, fetchImpl);
    return models.has(model) ? "valid" : "invalid";
  } catch {
    return "unavailable";
  }
}
