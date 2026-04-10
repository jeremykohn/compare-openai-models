import type { ModelsApiResponse } from "~~/types/api";

const MODELS_CACHE_TTL_MS = 24 * 60 * 60 * 1000;

type CacheRecord = {
  data: ModelsApiResponse;
  updatedAt: number;
};

const modelsResponseCache = new Map<string, CacheRecord>();

export function getModelsResponseCacheKey(baseUrl: string): string {
  return baseUrl;
}

export function getCachedModelsResponse(
  key: string,
  now: number = Date.now(),
):
  | {
      record: ModelsApiResponse;
      isFresh: boolean;
    }
  | undefined {
  const cached = modelsResponseCache.get(key);
  if (!cached) {
    return undefined;
  }

  return {
    record: cached.data,
    isFresh: now - cached.updatedAt < MODELS_CACHE_TTL_MS,
  };
}

export function setCachedModelsResponse(
  key: string,
  data: ModelsApiResponse,
  now: number = Date.now(),
): void {
  modelsResponseCache.set(key, {
    data,
    updatedAt: now,
  });
}

export function clearModelsResponseCache(): void {
  modelsResponseCache.clear();
}
