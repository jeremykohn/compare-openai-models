import { fileURLToPath } from "node:url";
import { createError, defineEventHandler } from "h3";
import { useRuntimeConfig } from "#imports";
import { MODELS_ROUTE_ERROR_MESSAGE } from "~~/shared/constants/models";
import type { ModelsApiResponse, OpenAIModel } from "~~/types/api";
import {
  buildExclusionSet,
  loadOpenAIModelsConfig,
} from "../utils/openai-models-config-loader";
import {
  mapOpenAIErrorResponse,
  toSafeStatusText,
} from "../utils/openai-error-mapper";
import {
  clearModelsResponseCache,
  getCachedModelsResponse,
  getModelsResponseCacheKey,
  setCachedModelsResponse,
} from "../utils/models-response-cache";
import {
  filterModelsByExclusionSet,
  sortModelsById,
} from "../utils/models-list";
import {
  parseBooleanConfig,
  validateOpenAIRuntimeConfig,
} from "../utils/openai-security";

const configPath = fileURLToPath(
  new URL("../assets/models/openai-models.json", import.meta.url),
);

type OpenAIModelsPayload = {
  data?: Array<{
    id?: string;
    object?: string;
    created?: number;
    owned_by?: string;
  }>;
};

async function fetchUpstreamModels(
  baseUrl: string,
  apiKey: string,
): Promise<OpenAIModel[]> {
  const response = await fetch(`${baseUrl}/models`, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  });

  if (!response.ok) {
    const mappedError = await mapOpenAIErrorResponse(response);

    throw createError({
      statusCode: response.status,
      data: {
        message: MODELS_ROUTE_ERROR_MESSAGE,
        statusText: toSafeStatusText(response.statusText),
        code: mappedError.code,
        type: mappedError.type,
        param: mappedError.param,
        details: mappedError.details,
      },
    });
  }

  const payload = (await response.json()) as OpenAIModelsPayload;

  return (payload.data ?? [])
    .map((entry) => {
      if (!entry.id || typeof entry.id !== "string") {
        return undefined;
      }

      return {
        id: entry.id,
        object: "model" as const,
        created: typeof entry.created === "number" ? entry.created : 0,
        owned_by:
          typeof entry.owned_by === "string" ? entry.owned_by : "openai",
      };
    })
    .filter((model): model is OpenAIModel => Boolean(model));
}

async function buildModelsResponse(
  baseUrl: string,
  apiKey: string,
): Promise<ModelsApiResponse> {
  const upstreamModels = await fetchUpstreamModels(baseUrl, apiKey);
  const configResult = await loadOpenAIModelsConfig(configPath);

  const models = configResult.isValid
    ? filterModelsByExclusionSet(
        upstreamModels,
        buildExclusionSet(configResult.config),
      )
    : upstreamModels;

  return {
    object: "list",
    data: sortModelsById(models),
    usedConfigFilter: configResult.isValid,
    showFallbackNote: !configResult.isValid,
  };
}

export default defineEventHandler(async () => {
  try {
    const runtimeConfig = useRuntimeConfig() as unknown as {
      openaiApiKey: string;
      openaiBaseUrl: string;
      openaiAllowedHosts: string;
      openaiAllowInsecureHttp: string;
      openaiDisableModelsCache: string;
    };
    const validated = validateOpenAIRuntimeConfig({
      openaiApiKey: runtimeConfig.openaiApiKey,
      openaiBaseUrl: runtimeConfig.openaiBaseUrl,
      openaiAllowedHosts: runtimeConfig.openaiAllowedHosts,
      openaiAllowInsecureHttp: runtimeConfig.openaiAllowInsecureHttp,
    });

    const disableCache = parseBooleanConfig(
      runtimeConfig.openaiDisableModelsCache,
    );
    const cacheKey = getModelsResponseCacheKey(validated.baseUrl);

    if (!disableCache) {
      const cached = getCachedModelsResponse(cacheKey);
      if (cached) {
        if (cached.isFresh) {
          return cached.record;
        }

        void buildModelsResponse(validated.baseUrl, validated.apiKey)
          .then((freshValue) => {
            setCachedModelsResponse(cacheKey, freshValue);
          })
          .catch(() => undefined);

        return cached.record;
      }
    } else {
      clearModelsResponseCache();
    }

    const response = await buildModelsResponse(
      validated.baseUrl,
      validated.apiKey,
    );

    if (!disableCache) {
      setCachedModelsResponse(cacheKey, response);
    }

    return response;
  } catch (error) {
    if (error && typeof error === "object" && "statusCode" in error) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      data: {
        message: MODELS_ROUTE_ERROR_MESSAGE,
      },
    });
  }
});
