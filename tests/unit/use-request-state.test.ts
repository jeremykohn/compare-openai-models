import { describe, expect, it } from "vitest";
import { useRequestState } from "../../app/composables/use-request-state";
import type { NormalizedUiError } from "../../app/utils/error-normalization";

describe("useRequestState", () => {
  it("supports start/succeed/fail/reset transitions", () => {
    const { state, start, succeed, fail, reset } = useRequestState();

    start();
    expect(state.status).toBe("loading");

    succeed("hello");
    expect(state.status).toBe("success");
    expect(state.data).toBe("hello");

    const error: NormalizedUiError = {
      category: "unknown",
      message: "err",
      details: "details",
    };
    fail(error);
    expect(state.status).toBe("error");
    expect(state.error?.message).toBe("err");
    expect(state.error?.details).toBe("details");

    reset();
    expect(state.status).toBe("idle");
  });
});
