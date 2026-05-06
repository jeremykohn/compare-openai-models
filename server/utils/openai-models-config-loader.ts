import { readFile } from "node:fs/promises";

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

function isStringArray(value: unknown): value is string[] {
  return (
    Array.isArray(value) && value.every((entry) => typeof entry === "string")
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

const VALID_FILTER_KEY = "unavailable-models";

export async function loadOpenAIModelsConfig(
  filePath: string,
): Promise<OpenAIModelsConfigResult> {
  try {
    const raw = await readFile(filePath, "utf8");
    const parsedUnknown = JSON.parse(raw) as unknown;

    if (!isRecord(parsedUnknown)) {
      return {
        isValid: false,
        reason: "Invalid config shape: expected object",
      };
    }

    const parsed = parsedUnknown;
    const extraKeys = Object.keys(parsed).filter(
      (key) => key !== VALID_FILTER_KEY,
    );

    if (extraKeys.length > 0) {
      console.warn(
        `OpenAI models config has extra keys: ${extraKeys.join(", ")}. Only "${VALID_FILTER_KEY}" is a valid key in this file.`,
      );
    }

    if (!isStringArray(parsed[VALID_FILTER_KEY])) {
      console.error(
        `OpenAI models config is missing required key "${VALID_FILTER_KEY}" as a string array. Falling back to unfiltered models list.`,
      );

      return {
        isValid: false,
        reason: `Missing or invalid "${VALID_FILTER_KEY}" key`,
      };
    }

    return {
      isValid: true,
      config: {
        "unavailable-models": parsed[VALID_FILTER_KEY],
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
  return new Set(config["unavailable-models"]);
}
