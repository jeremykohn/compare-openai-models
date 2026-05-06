import { UNAVAILABLE_MODELS } from "~~/shared/constants/unavailable-models";

export type OpenAIModelsConfig = {
  "unavailable-models": string[];
};

export type OpenAIModelsConfigResult =
  | {
      isValid: true;
      config: OpenAIModelsConfig;
    }
  | {
      isValid: false;
      reason: string;
    };

export async function loadOpenAIModelsConfig(
  _filePath?: string,
): Promise<OpenAIModelsConfigResult> {
  return {
    isValid: true,
    config: {
      "unavailable-models": [...UNAVAILABLE_MODELS],
    },
  };
}

export function buildExclusionSet(config: OpenAIModelsConfig): Set<string> {
  return new Set(config["unavailable-models"]);
}
