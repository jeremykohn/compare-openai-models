import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  buildExclusionSet,
  loadOpenAIModelsConfig,
} from "../../server/utils/openai-models-config-loader";

describe("openai-models-config-loader", () => {
  it("loads valid schema", async () => {
    const dir = await mkdtemp(join(tmpdir(), "models-config-"));
    const file = join(dir, "openai-models.json");

    await writeFile(
      file,
      JSON.stringify({
        "available-models": ["gpt-4.1-mini"],
        "models-with-error": ["bad-model"],
        "models-with-no-response": ["legacy-model"],
        "other-models": ["other-model"],
      }),
      "utf8",
    );

    const result = await loadOpenAIModelsConfig(file);
    expect(result.isValid).toBe(true);

    if (result.isValid) {
      const exclusion = buildExclusionSet(result.config);
      expect(exclusion.has("bad-model")).toBe(true);
      expect(exclusion.has("legacy-model")).toBe(true);
      expect(exclusion.has("other-model")).toBe(false);
    }
  });
});
