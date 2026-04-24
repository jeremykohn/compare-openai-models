import { reactive } from "vue";
import type {
  ModelsApiResponse,
  RequestStatus,
  OpenAIModel,
} from "~~/types/api";
import { normalizeUiError } from "../utils/error-normalization";
import type { NormalizedUiError } from "../utils/error-normalization";
import { logNormalizedUiError } from "../utils/log-normalized-ui-error";

type ModelsState = {
  status: RequestStatus;
  data: ReadonlyArray<OpenAIModel> | null;
  usedConfigFilter: boolean;
  showFallbackNote: boolean;
  error: NormalizedUiError | null;
};

function isOpenAIModelPayload(value: unknown): value is OpenAIModel {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.id === "string" &&
    typeof candidate.object === "string" &&
    typeof candidate.created === "number" &&
    typeof candidate.owned_by === "string"
  );
}

function isModelsApiResponsePayload(
  value: unknown,
): value is ModelsApiResponse {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    candidate.object === "list" &&
    Array.isArray(candidate.data) &&
    candidate.data.every(isOpenAIModelPayload) &&
    typeof candidate.usedConfigFilter === "boolean" &&
    typeof candidate.showFallbackNote === "boolean"
  );
}

export function useModelsState() {
  const state = reactive<ModelsState>({
    status: typeof window === "undefined" ? "idle" : "loading",
    data: null,
    usedConfigFilter: false,
    showFallbackNote: false,
    error: null,
  });

  let latestRequestId = 0;
  let controller: AbortController | null = null;

  function setErrorState(
    payload: unknown,
    httpStatus: number,
    httpStatusText: string,
  ): void {
    const payloadObject =
      payload !== null &&
      typeof payload === "object" &&
      !Array.isArray(payload)
        ? (payload as Record<string, unknown>)
        : {};

    const normalized = normalizeUiError({
      ...payloadObject,
      statusCode: httpStatus,
      statusText: httpStatusText,
    });

    logNormalizedUiError("useModelsState", normalized);
    state.status = "error";
    state.error = normalized;
    state.data = null;
  }

  async function fetchModels(): Promise<void> {
    latestRequestId += 1;
    const currentRequestId = latestRequestId;

    if (controller) {
      controller.abort();
    }

    controller = new AbortController();

    state.status = "loading";
    state.error = null;

    try {
      const response = await fetch("/api/models", {
        signal: controller.signal,
      });

      let payload:
        | ModelsApiResponse
        | {
            message: string;
            details?: string;
            code?: string;
            type?: string;
            param?: string;
          }
        | undefined;
      try {
        payload = (await response.json()) as
          | ModelsApiResponse
          | {
              message: string;
              details?: string;
              code?: string;
              type?: string;
              param?: string;
            };
      } catch {
        payload = {
          message: "Request failed",
        };
      }

      if (currentRequestId !== latestRequestId) {
        return;
      }

      if (!response.ok) {
        setErrorState(payload, response.status, response.statusText);
        return;
      }

      if (!isModelsApiResponsePayload(payload)) {
        setErrorState(payload, response.status, response.statusText);
        return;
      }

      state.status = "success";
      state.data = payload.data;
      state.usedConfigFilter = payload.usedConfigFilter;
      state.showFallbackNote = payload.showFallbackNote;
      state.error = null;
    } catch (error) {
      if (currentRequestId !== latestRequestId) {
        return;
      }

      const normalized = normalizeUiError(error);
      logNormalizedUiError("useModelsState", normalized);
      state.status = "error";
      state.error = normalized;
      state.data = null;
    }
  }

  if (typeof window !== "undefined") {
    void fetchModels();
  }

  return {
    state,
    fetchModels,
  };
}
