import { describe, expect, it } from "vitest";
import { UNAVAILABLE_MODELS } from "../../shared/constants/unavailable-models";
import {
  buildExclusionSet,
  loadOpenAIModelsConfig,
} from "../../server/utils/openai-models-config-loader";

describe("openai-models-config-loader", () => {
  it("loads unavailable models from constants", async () => {
    const result = await loadOpenAIModelsConfig();

    expect(result.isValid).toBe(true);

    if (result.isValid) {
      expect(result.config["unavailable-models"]).toEqual(UNAVAILABLE_MODELS);
      expect(result.config["unavailable-models"]).toContain("babbage-002");
    }
  });

  it("ignores file path argument and returns constants", async () => {
    const result = await loadOpenAIModelsConfig("/does/not/matter.json");

    expect(result.isValid).toBe(true);

    if (result.isValid) {
      expect(result.config["unavailable-models"].length).toBeGreaterThan(0);
    }
  });

  it("builds a de-duplicated exclusion set", () => {
    const exclusionSet = buildExclusionSet({
      "unavailable-models": ["legacy-model", "legacy-model", "new-model"],
    });

    expect(exclusionSet.size).toBe(2);
    expect(exclusionSet.has("legacy-model")).toBe(true);
    expect(exclusionSet.has("new-model")).toBe(true);
  });
});
