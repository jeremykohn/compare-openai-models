import type { ModelsApiResponse, OpenAIModel } from "../../types/api";

export function makeModel(id: string): OpenAIModel {
  return {
    id,
    object: "model",
    created: 1,
    owned_by: "openai",
  };
}

export function makeModelsResponse(ids: string[]): ModelsApiResponse {
  return {
    object: "list",
    data: ids.map(makeModel),
    usedConfigFilter: true,
    showFallbackNote: false,
  };
}
