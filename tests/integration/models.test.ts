import { describe, expect, it } from "vitest";
import { buildExclusionSet } from "../../server/utils/openai-models-config-loader";
import {
  filterModelsByExclusionSet,
  sortModelsById,
} from "../../server/utils/models-list";

const model = (id: string) => ({
  id,
  object: "model" as const,
  created: 0,
  owned_by: "openai",
});

describe("models route integration primitives", () => {
  it("applies exclusion then alphabetical sort", () => {
    const exclusion = buildExclusionSet({
      "available-models": [],
      "models-with-error": ["z-model"],
      "models-with-no-response": ["m-model"],
      "other-models": ["a-model"],
    });

    const filtered = filterModelsByExclusionSet(
      [model("z-model"), model("a-model"), model("m-model"), model("b-model")],
      exclusion,
    );

    const sorted = sortModelsById(filtered);
    expect(sorted.map((entry) => entry.id)).toEqual(["a-model", "b-model"]);
  });
});
