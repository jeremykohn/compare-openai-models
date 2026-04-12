import { describe, expect, it } from "vitest";

import { useRequestState } from "../../app/composables/use-request-state";

describe("useRequestState", () => {
  it("supports start/succeed/fail/reset transitions", () => {
    const { state, start, succeed, fail, reset } = useRequestState();

    start();
    expect(state.status).toBe("loading");

    succeed("hello");
    expect(state.status).toBe("success");
    expect(state.data).toBe("hello");

    fail("err", "details");
    expect(state.status).toBe("error");
    expect(state.error).toBe("err");
    expect(state.errorDetails).toBe("details");

    reset();
    expect(state.status).toBe("idle");
  });
});
