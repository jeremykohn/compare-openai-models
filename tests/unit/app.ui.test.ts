import { afterEach, describe, expect, it, vi } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import App from "../../app/app.vue";

const fetchMock = vi.fn();
vi.stubGlobal("fetch", fetchMock);

function modelsResponse(
  models = [
    { id: "gpt-4.1-mini", object: "model", created: 0, owned_by: "openai" },
  ],
) {
  return {
    ok: true,
    json: async () => ({
      object: "list",
      data: models,
      usedConfigFilter: true,
      showFallbackNote: false,
    }),
  };
}

afterEach(() => {
  fetchMock.mockReset();
});

describe("app ui", () => {
  it("renders title and send button", async () => {
    fetchMock.mockResolvedValueOnce(modelsResponse());

    const wrapper = mount(App);
    await flushPromises();

    expect(wrapper.text()).toContain("ChatGPT prompt tester");
    expect(wrapper.text()).toContain("Send");
  });

  it("shows both model selectors active", async () => {
    fetchMock.mockResolvedValueOnce(
      modelsResponse([
        { id: "gpt-4.1-mini", object: "model", created: 0, owned_by: "openai" },
      ]),
    );

    const wrapper = mount(App);
    await flushPromises();

    const leftSelect = wrapper.get("#models-select");
    const rightSelect = wrapper.get("#models-select-right");

    expect(leftSelect.attributes("disabled")).toBeUndefined();
    expect(rightSelect.attributes("disabled")).toBeUndefined();
  });

  it("tracks left and right model selections independently", async () => {
    fetchMock.mockResolvedValueOnce(
      modelsResponse([
        { id: "gpt-4.1-mini", object: "model", created: 0, owned_by: "openai" },
        { id: "gpt-4o", object: "model", created: 0, owned_by: "openai" },
      ]),
    );

    const wrapper = mount(App);
    await flushPromises();

    await wrapper.get("#models-select").setValue("gpt-4.1-mini");
    await wrapper.get("#models-select-right").setValue("gpt-4o");

    expect(
      (wrapper.get("#models-select").element as HTMLSelectElement).value,
    ).toBe("gpt-4.1-mini");
    expect(
      (wrapper.get("#models-select-right").element as HTMLSelectElement).value,
    ).toBe("gpt-4o");
  });

  it("handles malformed successful models payload as error state", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      statusText: "OK",
      json: async () => ({
        object: "list",
        data: [{ id: "gpt-4.1-mini" }],
        usedConfigFilter: true,
      }),
    });

    const wrapper = mount(App);
    await flushPromises();

    expect(wrapper.text()).toContain("Something went wrong");
    expect(wrapper.find('[data-testid="error-retry-button"]').exists()).toBe(
      true,
    );
  });

  it("renders prompt field semantic attributes", async () => {
    fetchMock.mockResolvedValueOnce(modelsResponse());

    const wrapper = mount(App);
    await flushPromises();

    const prompt = wrapper.get("#prompt-input");
    expect(prompt.attributes("maxlength")).toBe("4000");
    expect(prompt.attributes("aria-required")).toBe("true");
    expect(prompt.attributes("aria-describedby")).toBe("prompt-help");
  });

  it("validates empty prompt and updates aria-invalid/alert", async () => {
    fetchMock.mockResolvedValueOnce(modelsResponse());

    const wrapper = mount(App);
    await flushPromises();
    await wrapper.get("form").trigger("submit");

    expect(wrapper.text()).toContain("Please enter a prompt.");

    const prompt = wrapper.get("#prompt-input");
    expect(prompt.attributes("aria-invalid")).toBe("true");
    expect(prompt.attributes("aria-describedby")).toContain("prompt-error");
    expect(wrapper.get("#prompt-error").attributes("role")).toBe("alert");

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("shows loading state while /api/respond is pending", async () => {
    fetchMock.mockResolvedValueOnce(modelsResponse());

    let resolveRespond: (value: unknown) => void = () => undefined;
    const respondPromise = new Promise((resolve) => {
      resolveRespond = resolve;
    });

    fetchMock.mockImplementationOnce(
      async () => (await respondPromise) as never,
    );

    const wrapper = mount(App);
    await flushPromises();

    await wrapper.get("#prompt-input").setValue("hello");
    await wrapper.get("form").trigger("submit");
    await flushPromises();

    expect(wrapper.text()).toContain("Waiting for response from ChatGPT...");
    const sendButton = wrapper.get('button[type="submit"]');
    expect(sendButton.attributes("disabled")).toBeDefined();
    expect(sendButton.attributes("aria-busy")).toBe("true");

    resolveRespond({
      ok: true,
      json: async () => ({ response: "ok", model: "gpt-4.1-mini" }),
    });
    await flushPromises();
  });

  it("submits two model-targeted requests from a single send action", async () => {
    fetchMock.mockResolvedValueOnce(
      modelsResponse([
        { id: "gpt-4.1-mini", object: "model", created: 0, owned_by: "openai" },
        { id: "gpt-4o", object: "model", created: 0, owned_by: "openai" },
      ]),
    );
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ response: "ok", model: "gpt-4o" }),
    });
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ response: "ok-2", model: "gpt-4.1-mini" }),
    });

    const wrapper = mount(App);
    await flushPromises();

    await wrapper.get("#models-select").setValue("gpt-4o");
    await wrapper.get("#models-select-right").setValue("gpt-4.1-mini");
    await wrapper.get("#prompt-input").setValue(" hello ");
    await wrapper.get("form").trigger("submit");
    await flushPromises();

    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "/api/respond",
      expect.objectContaining({ method: "POST" }),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      3,
      "/api/respond",
      expect.objectContaining({ method: "POST" }),
    );

    const leftRequestInit = fetchMock.mock.calls[1]?.[1] as RequestInit;
    const leftParsedBody = JSON.parse(String(leftRequestInit.body)) as {
      prompt: string;
      model?: string;
    };
    const rightRequestInit = fetchMock.mock.calls[2]?.[1] as RequestInit;
    const rightParsedBody = JSON.parse(String(rightRequestInit.body)) as {
      prompt: string;
      model?: string;
    };

    expect(leftParsedBody.prompt).toBe("hello");
    expect(leftParsedBody.model).toBe("gpt-4o");
    expect(rightParsedBody.prompt).toBe("hello");
    expect(rightParsedBody.model).toBe("gpt-4.1-mini");
  });

  it("renders independent success output for left and right responses", async () => {
    fetchMock.mockResolvedValueOnce(
      modelsResponse([
        { id: "gpt-4.1-mini", object: "model", created: 0, owned_by: "openai" },
        { id: "gpt-4o", object: "model", created: 0, owned_by: "openai" },
      ]),
    );
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ response: "Left response", model: "gpt-4.1-mini" }),
    });
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ response: "Right response", model: "gpt-4.1-mini" }),
    });

    const wrapper = mount(App);
    await flushPromises();

    await wrapper.get("#models-select").setValue("gpt-4o");
    await wrapper.get("#models-select-right").setValue("gpt-4.1-mini");
    await wrapper.get("#prompt-input").setValue("hello");
    await wrapper.get("form").trigger("submit");
    await flushPromises();

    expect(wrapper.text()).toContain("Response from Model 1 (gpt-4o)");
    expect(wrapper.text()).toContain("Response from Model 2 (gpt-4.1-mini)");

    const responseParagraphs = wrapper.findAll("article p.whitespace-pre-wrap");
    expect(responseParagraphs).toHaveLength(2);
    expect(responseParagraphs[0]?.text()).toBe("Left response");
    expect(responseParagraphs[1]?.text()).toBe("Right response");
  });

  it("renders left error and right success independently", async () => {
    fetchMock.mockResolvedValueOnce(
      modelsResponse([
        { id: "gpt-4.1-mini", object: "model", created: 0, owned_by: "openai" },
        { id: "gpt-4o", object: "model", created: 0, owned_by: "openai" },
      ]),
    );
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 400,
      statusText: "Bad Request",
      json: async () => ({
        message: "Request to OpenAI failed.",
        type: "invalid_request_error",
        code: "model_not_found",
        param: "model",
        details: "Authorization: Bearer abc",
      }),
    });
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ response: "Right success", model: "gpt-4.1-mini" }),
    });

    const wrapper = mount(App);
    await flushPromises();

    await wrapper.get("#models-select").setValue("gpt-4o");
    await wrapper.get("#models-select-right").setValue("gpt-4.1-mini");
    await wrapper.get("#prompt-input").setValue("hello");
    await wrapper.get("form").trigger("submit");
    await flushPromises();

    expect(wrapper.text()).toContain("Response from Model 1 (gpt-4o)");
    expect(wrapper.text()).toContain("Response from Model 2 (gpt-4.1-mini)");
    expect(wrapper.text()).toContain("Something went wrong");
    expect(wrapper.text()).toContain("Right success");

    const errorToggles = wrapper.findAll(
      '[data-testid="error-details-toggle"]',
    );
    expect(errorToggles).toHaveLength(1);
    expect(wrapper.text()).toContain("Type");
    expect(wrapper.text()).toContain("invalid_request_error");
    expect(wrapper.text()).toContain("Status Code");
    expect(wrapper.text()).toContain("400");
    expect(wrapper.text()).toContain("Error Code");
    expect(wrapper.text()).toContain("model_not_found");
  });

  it("renders left success and right error independently", async () => {
    fetchMock.mockResolvedValueOnce(
      modelsResponse([
        { id: "gpt-4.1-mini", object: "model", created: 0, owned_by: "openai" },
        { id: "gpt-4o", object: "model", created: 0, owned_by: "openai" },
      ]),
    );
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ response: "Left success", model: "gpt-4.1-mini" }),
    });
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 503,
      statusText: "Service Unavailable",
      json: async () => ({
        message: "Request to OpenAI failed.",
        details: "Temporary outage",
      }),
    });

    const wrapper = mount(App);
    await flushPromises();

    await wrapper.get("#models-select").setValue("gpt-4o");
    await wrapper.get("#models-select-right").setValue("gpt-4.1-mini");
    await wrapper.get("#prompt-input").setValue("hello");
    await wrapper.get("form").trigger("submit");
    await flushPromises();

    expect(wrapper.text()).toContain("Response from Model 1 (gpt-4o)");
    expect(wrapper.text()).toContain("Response from Model 2 (gpt-4.1-mini)");
    expect(wrapper.text()).toContain("Left success");
    expect(wrapper.text()).toContain("Something went wrong");
    expect(
      wrapper.findAll('[data-testid="error-details-toggle"]'),
    ).toHaveLength(1);
  });
});
