import { describe, expect, it } from "vitest";
import {
  clearModelsResponseCache,
  getCachedModelsResponse,
  setCachedModelsResponse,
} from "../../server/utils/models-response-cache";
import { makeModelsResponse } from "../helpers/fixtures";

describe("models-response-cache", () => {
  it("returns fresh records and stale records based on timestamp", () => {
    clearModelsResponseCache();
    const now = 1_000_000;
    setCachedModelsResponse("k", makeModelsResponse(["a"]), now);

    const fresh = getCachedModelsResponse("k", now + 10);
    expect(fresh?.isFresh).toBe(true);

    const stale = getCachedModelsResponse("k", now + 24 * 60 * 60 * 1000 + 1);
    expect(stale?.isFresh).toBe(false);
  });
});
