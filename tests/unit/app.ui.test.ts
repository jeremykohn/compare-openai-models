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

  it("shows left model selector active and right selector disabled", async () => {
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
    expect(rightSelect.attributes("disabled")).toBeDefined();
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

  it("submits prompt with left selected model only", async () => {
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

    const wrapper = mount(App);
    await flushPromises();

    await wrapper.get("#models-select").setValue("gpt-4o");
    await wrapper.get("#prompt-input").setValue(" hello ");
    await wrapper.get("form").trigger("submit");
    await flushPromises();

    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "/api/respond",
      expect.objectContaining({ method: "POST" }),
    );

    const requestInit = fetchMock.mock.calls[1]?.[1] as RequestInit;
    const parsedBody = JSON.parse(String(requestInit.body)) as {
      prompt: string;
      model?: string;
      rightModel?: string;
    };

    expect(parsedBody.prompt).toBe("hello");
    expect(parsedBody.model).toBe("gpt-4o");
    expect(parsedBody.rightModel).toBeUndefined();
  });

  it("shows mirrored success output panels with identical response text", async () => {
    fetchMock.mockResolvedValueOnce(modelsResponse());
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ response: "Hello\nWorld", model: "gpt-4.1-mini" }),
    });

    const wrapper = mount(App);
    await flushPromises();

    await wrapper.get("#prompt-input").setValue("hello");
    await wrapper.get("form").trigger("submit");
    await flushPromises();

    expect(wrapper.text()).toContain("Output 1");
    expect(wrapper.text()).toContain("Output 2");

    const responseParagraphs = wrapper.findAll("article p.whitespace-pre-wrap");
    expect(responseParagraphs).toHaveLength(2);
    expect(responseParagraphs[0]?.text()).toBe("Hello\nWorld");
    expect(responseParagraphs[1]?.text()).toBe("Hello\nWorld");
  });

  it("shows mirrored response error panels with details toggle labels", async () => {
    fetchMock.mockResolvedValueOnce(modelsResponse());
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

    const wrapper = mount(App);
    await flushPromises();

    await wrapper.get("#prompt-input").setValue("hello");
    await wrapper.get("form").trigger("submit");
    await flushPromises();

    expect(wrapper.text()).toContain("Something went wrong");
    expect(wrapper.text()).toContain("Error Details");
    const errorToggles = wrapper.findAll(
      '[data-testid="error-details-toggle"]',
    );
    expect(errorToggles).toHaveLength(2);
    expect(wrapper.text()).toContain("Type");
    expect(wrapper.text()).toContain("invalid_request_error");
    expect(wrapper.text()).toContain("Status Code");
    expect(wrapper.text()).toContain("400");
    expect(wrapper.text()).toContain("Error Code");
    expect(wrapper.text()).toContain("model_not_found");
  });

  it("treats malformed successful payload as normalized error", async () => {
    fetchMock.mockResolvedValueOnce(modelsResponse());
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      statusText: "OK",
      json: async () => ({ model: "gpt-4.1-mini" }),
    });

    const wrapper = mount(App);
    await flushPromises();

    await wrapper.get("#prompt-input").setValue("hello");
    await wrapper.get("form").trigger("submit");
    await flushPromises();

    expect(wrapper.text()).toContain("Something went wrong");
    expect(wrapper.text()).not.toContain("Response");
    expect(
      wrapper.findAll('[data-testid="error-details-toggle"]'),
    ).toHaveLength(2);
  });
});
