import { afterEach, describe, expect, it, vi } from "vitest";
import { flushPromises } from "@vue/test-utils";
import { useModelQuery } from "../../app/composables/use-model-query";

const fetchMock = vi.fn();
vi.stubGlobal("fetch", fetchMock);

afterEach(() => {
  fetchMock.mockReset();
});

describe("useModelQuery", () => {
  it("starts in idle state", () => {
    const { state } = useModelQuery("model1");
    expect(state.status).toBe("idle");
    expect(state.data).toBeNull();
    expect(state.error).toBeNull();
  });

  it("sets loading state while request is in flight", async () => {
    let resolveRequest: (value: unknown) => void = () => undefined;
    const pendingRequest = new Promise((resolve) => {
      resolveRequest = resolve;
    });

    fetchMock.mockImplementationOnce(
      async () => (await pendingRequest) as never,
    );

    const { state, query } = useModelQuery("model1");
    const queryPromise = query("hello", "gpt-4.1-mini");

    expect(state.status).toBe("loading");

    resolveRequest({
      ok: true,
      status: 200,
      statusText: "OK",
      json: async () => ({ response: "done", model: "gpt-4.1-mini" }),
    });
    await queryPromise;
  });

  it("transitions to success state on valid response", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      statusText: "OK",
      json: async () => ({ response: "Hello!", model: "gpt-4.1-mini" }),
    });

    const { state, submittedModelId, query } = useModelQuery("model1");
    await query("hello", "gpt-4.1-mini");
    await flushPromises();

    expect(state.status).toBe("success");
    expect(state.data).toBe("Hello!");
    expect(submittedModelId.value).toBe("gpt-4.1-mini");
  });

  it("transitions to error state on HTTP error response", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 503,
      statusText: "Service Unavailable",
      json: async () => ({ message: "Unavailable", details: "Overloaded" }),
    });

    const { state, query } = useModelQuery("model2");
    await query("hello", "gpt-4.1-mini");
    await flushPromises();

    expect(state.status).toBe("error");
    expect(state.error).not.toBeNull();
    expect(state.data).toBeNull();
  });

  it("transitions to error state on network failure", async () => {
    fetchMock.mockRejectedValueOnce(new Error("Failed to fetch"));

    const { state, query } = useModelQuery("model1");
    await query("hello", "gpt-4.1-mini");
    await flushPromises();

    expect(state.status).toBe("error");
    expect(state.error).not.toBeNull();
  });

  it("uses default model when empty modelId is provided", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      statusText: "OK",
      json: async () => ({ response: "Response", model: "gpt-4.1-mini" }),
    });

    const { submittedModelId, query } = useModelQuery("model1");
    await query("hello", "");
    await flushPromises();

    expect(submittedModelId.value).toBe("gpt-4.1-mini");

    const requestBody = JSON.parse(
      String((fetchMock.mock.calls[0]?.[1] as RequestInit).body),
    ) as { prompt: string; model?: string };
    expect(requestBody.model).toBeUndefined();
  });

  it("sends the specified model in the request body", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      statusText: "OK",
      json: async () => ({ response: "Response", model: "gpt-4o" }),
    });

    const { query } = useModelQuery("model1");
    await query("hello", "gpt-4o");

    const requestBody = JSON.parse(
      String((fetchMock.mock.calls[0]?.[1] as RequestInit).body),
    ) as { prompt: string; model?: string };
    expect(requestBody.prompt).toBe("hello");
    expect(requestBody.model).toBe("gpt-4o");
  });

  it("updates submittedModelId from the server response model field", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      statusText: "OK",
      json: async () => ({ response: "ok", model: "gpt-4o-resolved" }),
    });

    const { submittedModelId, query } = useModelQuery("model1");
    await query("hello", "gpt-4o");
    await flushPromises();

    expect(submittedModelId.value).toBe("gpt-4o-resolved");
  });
});
