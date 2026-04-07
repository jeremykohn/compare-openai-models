import { reactive } from "vue";
import type {
  ModelsApiResponse,
  RequestStatus,
  OpenAIModel,
} from "../../types/api";
import { normalizeUiError } from "../utils/error-normalization";
import { logNormalizedUiError } from "../utils/log-normalized-ui-error";

type ModelsState = {
  status: RequestStatus;
  data: ReadonlyArray<OpenAIModel> | null;
  usedConfigFilter: boolean;
  showFallbackNote: boolean;
  error: string | null;
  errorDetails: string | null;
};

export function useModelsState() {
  const state = reactive<ModelsState>({
    status: typeof window === "undefined" ? "idle" : "loading",
    data: null,
    usedConfigFilter: false,
    showFallbackNote: false,
    error: null,
    errorDetails: null,
  });

  let latestRequestId = 0;
  let controller: AbortController | null = null;

  async function fetchModels(): Promise<void> {
    latestRequestId += 1;
    const currentRequestId = latestRequestId;

    if (controller) {
      controller.abort();
    }

    controller = new AbortController();

    state.status = "loading";
    state.error = null;
    state.errorDetails = null;

    try {
      const response = await fetch("/api/models", {
        signal: controller.signal,
      });

      let payload:
        | ModelsApiResponse
        | { message: string; details?: string }
        | undefined;
      try {
        payload = (await response.json()) as
          | ModelsApiResponse
          | { message: string; details?: string };
      } catch {
        payload = undefined;
      }

      if (currentRequestId !== latestRequestId) {
        return;
      }

      if (!response.ok) {
        throw {
          message:
            payload && "message" in payload
              ? payload.message
              : "Request failed",
          details:
            payload && "details" in payload ? payload.details : undefined,
        };
      }

      const data = payload as ModelsApiResponse;
      state.status = "success";
      state.data = data.data;
      state.usedConfigFilter = data.usedConfigFilter;
      state.showFallbackNote = data.showFallbackNote;
      state.error = null;
      state.errorDetails = null;
    } catch (error) {
      if (currentRequestId !== latestRequestId) {
        return;
      }

      const normalized = normalizeUiError(error);
      logNormalizedUiError("useModelsState", normalized);
      state.status = "error";
      state.error = normalized.message;
      state.errorDetails = normalized.details ?? null;
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
