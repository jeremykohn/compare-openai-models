import { ref } from "vue";
import { DEFAULT_MODEL } from "~~/shared/constants/models";
import { normalizeUiError } from "../utils/error-normalization";
import type { NormalizedUiError } from "../utils/error-normalization";
import { logNormalizedUiError } from "../utils/log-normalized-ui-error";
import { isRespondSuccessPayload } from "../utils/type-guards";
import { useRequestState } from "./use-request-state";

async function fetchModelResponse(
  promptText: string,
  modelId: string,
  role: string,
): Promise<
  | { ok: true; response: string; model: string }
  | { ok: false; error: NormalizedUiError }
> {
  const body: { prompt: string; model?: string } = { prompt: promptText };

  if (modelId.trim()) {
    body.model = modelId.trim();
  }

  try {
    const response = await fetch("/api/respond", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    let payload: unknown;

    try {
      payload = await response.json();
    } catch {
      payload = {
        statusCode: response.status,
        statusText: response.statusText,
      };
    }

    const payloadObject =
      payload !== null && typeof payload === "object" && !Array.isArray(payload)
        ? (payload as Record<string, unknown>)
        : {};

    const normalizedInput = {
      ...payloadObject,
      statusCode: response.status,
      statusText: response.statusText,
    };

    if (!response.ok || !isRespondSuccessPayload(normalizedInput)) {
      const error = normalizeUiError(normalizedInput);
      logNormalizedUiError(`useModelQuery.${role}`, error);
      return { ok: false, error };
    }

    return {
      ok: true,
      response: normalizedInput.response,
      model: normalizedInput.model,
    };
  } catch (error) {
    const normalized = normalizeUiError(error);
    logNormalizedUiError(`useModelQuery.${role}`, normalized);
    return { ok: false, error: normalized };
  }
}

export function useModelQuery(role: "model1" | "model2") {
  const submittedModelId = ref(DEFAULT_MODEL);
  const { state, start, succeed, fail } = useRequestState();

  async function query(promptText: string, modelId: string): Promise<void> {
    start();
    submittedModelId.value = modelId.trim() || DEFAULT_MODEL;

    const result = await fetchModelResponse(promptText, modelId, role);

    if (result.ok) {
      submittedModelId.value = result.model;
      succeed(result.response);
    } else {
      fail(result.error);
    }
  }

  return { state, submittedModelId, query };
}
