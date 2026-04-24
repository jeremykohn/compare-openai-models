import { createError, defineEventHandler, readBody } from "h3";
import { useRuntimeConfig } from "#imports";
import {
  RESPOND_ROUTE_ERROR_MESSAGE,
  DEFAULT_MODEL,
} from "~~/shared/constants/models";
import type {
  ApiErrorResponse,
  RespondRequest,
  RespondSuccessResponse,
} from "~~/types/api";
import { sanitizeOptionalErrorText } from "~~/app/utils/error-sanitization";
import { validatePrompt } from "~~/app/utils/prompt-validation";
import { validateOpenAIRuntimeConfig } from "../utils/openai-security";
import {
  mapOpenAIErrorResponse,
  toSafeStatusText,
} from "../utils/openai-error-mapper";
import { extractResponseText } from "../utils/openai-response-parser";
import { validateSelectedModel } from "../utils/openai-model-validation";

function buildError(statusCode: number, body: ApiErrorResponse) {
  return createError({
    statusCode,
    data: body,
  });
}

export default defineEventHandler(
  async (event): Promise<RespondSuccessResponse> => {
    const runtimeConfig = useRuntimeConfig() as unknown as {
      openaiApiKey: string;
      openaiBaseUrl: string;
      openaiAllowedHosts: string;
      openaiAllowInsecureHttp: string;
    };
    let validatedConfig;

    try {
      validatedConfig = validateOpenAIRuntimeConfig({
        openaiApiKey: runtimeConfig.openaiApiKey,
        openaiBaseUrl: runtimeConfig.openaiBaseUrl,
        openaiAllowedHosts: runtimeConfig.openaiAllowedHosts,
        openaiAllowInsecureHttp: runtimeConfig.openaiAllowInsecureHttp,
      });
    } catch {
      throw buildError(500, { message: "Internal Server Error" });
    }

    const body = await readBody<RespondRequest>(event);
    const promptValidation = validatePrompt(body?.prompt ?? "");

    if (!promptValidation.isValid) {
      throw buildError(400, { message: promptValidation.message });
    }

    const selectedModel = body?.model?.trim();
    const resolvedModel = selectedModel || DEFAULT_MODEL;

    if (selectedModel) {
      const modelValidation = await validateSelectedModel(
        selectedModel,
        validatedConfig.baseUrl,
        validatedConfig.apiKey,
        fetch,
      );

      if (modelValidation === "invalid") {
        throw buildError(400, { message: "Model is not valid" });
      }

      if (modelValidation === "unavailable") {
        throw buildError(502, {
          message: "Unable to validate model right now. Please try again.",
        });
      }
    }

    try {
      const upstreamResponse = await fetch(
        `${validatedConfig.baseUrl}/responses`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${validatedConfig.apiKey}`,
          },
          body: JSON.stringify({
            model: resolvedModel,
            input: promptValidation.trimmedPrompt,
          }),
        },
      );

      if (!upstreamResponse.ok) {
        const mappedError = await mapOpenAIErrorResponse(upstreamResponse);

        throw buildError(upstreamResponse.status, {
          message: RESPOND_ROUTE_ERROR_MESSAGE,
          statusText: toSafeStatusText(upstreamResponse.statusText),
          code: mappedError.code,
          type: mappedError.type,
          param: mappedError.param,
          details: mappedError.details,
        });
      }

      const responsePayload = await upstreamResponse.json();
      return {
        response: extractResponseText(responsePayload),
        model: resolvedModel,
      };
    } catch (error) {
      if (error && typeof error === "object" && "statusCode" in error) {
        throw error;
      }

      throw buildError(500, {
        message: RESPOND_ROUTE_ERROR_MESSAGE,
        details: sanitizeOptionalErrorText(
          error instanceof Error ? error.message : undefined,
        ),
      });
    }
  },
);
