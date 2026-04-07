import { readFile } from "node:fs/promises";

export type OpenAIModelsConfig = {
  "available-models": string[];
  "models-with-error": string[];
  "models-with-no-response": string[];
  "other-models": string[];
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

function isStringArray(value: unknown): value is string[] {
  return (
    Array.isArray(value) && value.every((entry) => typeof entry === "string")
  );
}

export async function loadOpenAIModelsConfig(
  filePath: string,
): Promise<OpenAIModelsConfigResult> {
  try {
    const raw = await readFile(filePath, "utf8");
    const parsed = JSON.parse(raw) as Record<string, unknown>;

    if (
      !isStringArray(parsed["available-models"]) ||
      !isStringArray(parsed["models-with-error"]) ||
      !isStringArray(parsed["models-with-no-response"]) ||
      !isStringArray(parsed["other-models"])
    ) {
      return {
        isValid: false,
        reason: "Invalid schema",
      };
    }

    return {
      isValid: true,
      config: {
        "available-models": parsed["available-models"],
        "models-with-error": parsed["models-with-error"],
        "models-with-no-response": parsed["models-with-no-response"],
        "other-models": parsed["other-models"],
      },
    };
  } catch (error) {
    return {
      isValid: false,
      reason:
        error instanceof Error ? error.message : "Unknown config load error",
    };
  }
}

export function buildExclusionSet(config: OpenAIModelsConfig): Set<string> {
  return new Set([
    ...config["models-with-error"],
    ...config["models-with-no-response"],
  ]);
}
