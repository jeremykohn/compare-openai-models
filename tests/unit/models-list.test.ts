import { describe, expect, it } from "vitest";

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

describe("models-list utils", () => {
  it("sorts with localeCompare", () => {
    const sorted = sortModelsById([model("z"), model("a"), model("m")]);
    expect(sorted.map((entry) => entry.id)).toEqual(["a", "m", "z"]);
  });

  it("filters by exclusion set", () => {
    const filtered = filterModelsByExclusionSet(
      [model("a"), model("b"), model("c")],
      new Set(["b"]),
    );

    expect(filtered.map((entry) => entry.id)).toEqual(["a", "c"]);
  });
});
