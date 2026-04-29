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

const longToken = "supercalifragilisticexpialidocious".repeat(12);

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

    const model1Select = wrapper.get("#model1-select");
    const model2Select = wrapper.get("#model2-select");
    const model3Select = wrapper.get("#model-comparison-select");

    expect(model1Select.attributes("disabled")).toBeUndefined();
    expect(model2Select.attributes("disabled")).toBeUndefined();
    expect(model3Select.attributes("disabled")).toBeUndefined();
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

    await wrapper.get("#model1-select").setValue("gpt-4.1-mini");
    await wrapper.get("#model2-select").setValue("gpt-4o");

    expect(
      (wrapper.get("#model1-select").element as HTMLSelectElement).value,
    ).toBe("gpt-4.1-mini");
    expect(
      (wrapper.get("#model2-select").element as HTMLSelectElement).value,
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

    let resolveLeftRespond: (value: unknown) => void = () => undefined;
    const leftRespondPromise = new Promise((resolve) => {
      resolveLeftRespond = resolve;
    });

    let resolveRightRespond: (value: unknown) => void = () => undefined;
    const rightRespondPromise = new Promise((resolve) => {
      resolveRightRespond = resolve;
    });

    fetchMock.mockImplementationOnce(
      async () => (await leftRespondPromise) as never,
    );
    fetchMock.mockImplementationOnce(
      async () => (await rightRespondPromise) as never,
    );

    const wrapper = mount(App);
    await flushPromises();

    await wrapper.get("#prompt-input").setValue("hello");
    await wrapper.get("form").trigger("submit");
    await flushPromises();

    expect(wrapper.text()).toContain("Waiting for Model 1 response...");
    expect(wrapper.text()).toContain("Waiting for Model 2 response...");
    expect(wrapper.text()).toContain(
      "Waiting for Model 1 and Model 2 responses...",
    );
    const sendButton = wrapper.get('button[type="submit"]');
    expect(sendButton.attributes("disabled")).toBeDefined();
    expect(sendButton.attributes("aria-busy")).toBe("true");

    resolveLeftRespond({
      ok: true,
      json: async () => ({ response: "ok", model: "gpt-4.1-mini" }),
    });
    resolveRightRespond({
      ok: true,
      json: async () => ({ response: "ok-2", model: "gpt-4.1-mini" }),
    });
    await flushPromises();
  });

  it("shows left success while right side remains loading", async () => {
    fetchMock.mockResolvedValueOnce(
      modelsResponse([
        { id: "gpt-4.1-mini", object: "model", created: 0, owned_by: "openai" },
        { id: "gpt-4o", object: "model", created: 0, owned_by: "openai" },
      ]),
    );

    let resolveRightRespond: (value: unknown) => void = () => undefined;
    const rightRespondPromise = new Promise((resolve) => {
      resolveRightRespond = resolve;
    });

    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ response: "Left response", model: "gpt-4o" }),
    });
    fetchMock.mockImplementationOnce(
      async () => (await rightRespondPromise) as never,
    );

    const wrapper = mount(App);
    await flushPromises();

    await wrapper.get("#model1-select").setValue("gpt-4o");
    await wrapper.get("#model2-select").setValue("gpt-4.1-mini");
    await wrapper.get("#prompt-input").setValue("hello");
    await wrapper.get("form").trigger("submit");
    await flushPromises();

    expect(wrapper.text()).toContain("Left response");
    expect(wrapper.text()).toContain("Waiting for Model 2 response...");

    resolveRightRespond({
      ok: true,
      json: async () => ({ response: "Right response", model: "gpt-4.1-mini" }),
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

    await wrapper.get("#model1-select").setValue("gpt-4o");
    await wrapper.get("#model2-select").setValue("gpt-4.1-mini");
    await wrapper.get("#model-comparison-select").setValue("gpt-4o");
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
    expect(leftParsedBody).not.toHaveProperty("comparisonModel");
    expect(rightParsedBody).not.toHaveProperty("comparisonModel");
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

    await wrapper.get("#model1-select").setValue("gpt-4o");
    await wrapper.get("#model2-select").setValue("gpt-4.1-mini");
    await wrapper.get("#model-comparison-select").setValue("gpt-4o");
    await wrapper.get("#prompt-input").setValue("hello");
    await wrapper.get("form").trigger("submit");
    await flushPromises();

    expect(wrapper.text()).toContain("Response from Model 1 (gpt-4.1-mini)");
    expect(wrapper.text()).toContain("Response from Model 2 (gpt-4.1-mini)");

    const responseParagraphs = wrapper.findAll("article p.whitespace-pre-wrap");
    expect(responseParagraphs).toHaveLength(2);
    expect(responseParagraphs[0]?.text()).toBe("Left response");
    expect(responseParagraphs[1]?.text()).toBe("Right response");
    expect(wrapper.text()).toContain(
      "Comparison of responses from Model 1 and Model 2",
    );
    const comparisonPanel = wrapper.get(
      '[data-testid="comparison-output-panel"]',
    );
    const placeholderText = comparisonPanel.get(
      '[data-testid="comparison-output-placeholder"]',
    );
    expect(placeholderText.text()).toBe(
      "New feature coming soon: Using gpt-4o to compare responses from gpt-4.1-mini and gpt-4.1-mini",
    );
    expect(placeholderText.classes()).toContain("italic");
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

    await wrapper.get("#model1-select").setValue("gpt-4o");
    await wrapper.get("#model2-select").setValue("gpt-4.1-mini");
    await wrapper.get("#prompt-input").setValue("hello");
    await wrapper.get("form").trigger("submit");
    await flushPromises();

    expect(wrapper.text()).toContain("Response from Model 1 (gpt-4o)");
    expect(wrapper.text()).toContain("Response from Model 2 (gpt-4.1-mini)");
    expect(wrapper.text()).toContain("Something went wrong");
    expect(wrapper.text()).toContain("Right success");
    expect(wrapper.get('[data-testid="comparison-output-error"]').text()).toBe(
      "Unable to compare model outputs due to errors when querying Model 1 (gpt-4o)",
    );
    expect(
      wrapper.get('[data-testid="comparison-output-heading"]').text(),
    ).toBe("Error: Cannot produce comparison");

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

    await wrapper.get("#model1-select").setValue("gpt-4o");
    await wrapper.get("#model2-select").setValue("gpt-4.1-mini");
    await wrapper.get("#prompt-input").setValue("hello");
    await wrapper.get("form").trigger("submit");
    await flushPromises();

    expect(wrapper.text()).toContain("Response from Model 1 (gpt-4.1-mini)");
    expect(wrapper.text()).toContain("Response from Model 2 (gpt-4.1-mini)");
    expect(wrapper.text()).toContain("Left success");
    expect(wrapper.text()).toContain("Something went wrong");
    expect(wrapper.get('[data-testid="comparison-output-error"]').text()).toBe(
      "Unable to compare model outputs due to errors when querying Model 2 (gpt-4.1-mini)",
    );
    expect(
      wrapper.get('[data-testid="comparison-output-heading"]').text(),
    ).toBe("Error: Cannot produce comparison");
    expect(
      wrapper.findAll('[data-testid="error-details-toggle"]'),
    ).toHaveLength(1);
  });

  it("renders deterministic comparison error order when both outer requests fail", async () => {
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
      json: async () => ({ message: "left failed" }),
    });
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: "Internal Server Error",
      json: async () => ({ message: "right failed" }),
    });

    const wrapper = mount(App);
    await flushPromises();

    await wrapper.get("#model1-select").setValue("gpt-4o");
    await wrapper.get("#model2-select").setValue("gpt-4.1-mini");
    await wrapper.get("#prompt-input").setValue("hello");
    await wrapper.get("form").trigger("submit");
    await flushPromises();

    expect(wrapper.get('[data-testid="comparison-output-error"]').text()).toBe(
      "Unable to compare model outputs due to errors when querying Model 1 (gpt-4o), Model 2 (gpt-4.1-mini)",
    );
    expect(
      wrapper.get('[data-testid="comparison-output-heading"]').text(),
    ).toBe("Error: Cannot produce comparison");
  });

  it("applies overflow-safe classes to long headings and response text", async () => {
    fetchMock.mockResolvedValueOnce(
      modelsResponse([
        { id: longToken, object: "model", created: 0, owned_by: "openai" },
      ]),
    );
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ response: longToken, model: longToken }),
    });
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ response: longToken, model: longToken }),
    });

    const wrapper = mount(App);
    await flushPromises();

    await wrapper.get("#prompt-input").setValue("hello");
    await wrapper.get("form").trigger("submit");
    await flushPromises();

    const outputPanels = wrapper.findAll(
      '[data-testid="model-output-panels-grid"] article',
    );
    expect(outputPanels).toHaveLength(2);
    expect(outputPanels[0]?.classes()).toContain("min-w-0");
    expect(outputPanels[0]?.classes()).toContain("max-w-full");

    const heading = outputPanels[0]?.get("h2");
    expect(heading?.classes()).toContain("min-w-0");
    expect(heading?.classes()).toContain("break-words");
    expect(heading?.text()).toContain(longToken);

    const responseText = outputPanels[0]?.get("p.whitespace-pre-wrap");
    expect(responseText?.classes()).toContain("min-w-0");
    expect(responseText?.classes()).toContain("break-words");
    expect(responseText?.text()).toBe(longToken);
  });

  it("applies overflow-safe classes to nested long error details", async () => {
    fetchMock.mockResolvedValueOnce(modelsResponse());
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 400,
      statusText: "Bad Request",
      json: async () => ({
        message: longToken,
        type: longToken,
        code: longToken,
        param: longToken,
        details: longToken,
      }),
    });
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 400,
      statusText: "Bad Request",
      json: async () => ({
        message: longToken,
        type: longToken,
        code: longToken,
        param: longToken,
        details: longToken,
      }),
    });

    const wrapper = mount(App);
    await flushPromises();

    await wrapper.get("#prompt-input").setValue("hello");
    await wrapper.get("form").trigger("submit");
    await flushPromises();

    const errorAlert = wrapper.find('[role="alert"]');
    expect(errorAlert.classes()).toContain("min-w-0");
    expect(errorAlert.classes()).toContain("max-w-full");

    const summary = wrapper.get("summary");
    expect(summary.classes()).toContain("max-w-full");
    expect(summary.classes()).toContain("break-words");
    expect(summary.classes()).toContain("whitespace-normal");

    const detailValues = wrapper.findAll("dd");
    expect(detailValues.length).toBeGreaterThan(0);
    for (const detailValue of detailValues) {
      expect(detailValue.classes()).toContain("min-w-0");
      expect(detailValue.classes()).toContain("break-words");
      expect(detailValue.classes()).toContain("whitespace-pre-wrap");
    }
  });

  it("treats successful payload missing model as normalized error", async () => {
    fetchMock.mockResolvedValueOnce(
      modelsResponse([
        { id: "gpt-4.1-mini", object: "model", created: 0, owned_by: "openai" },
      ]),
    );
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ response: "missing model field" }),
    });
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ response: "right ok", model: "gpt-4.1-mini" }),
    });

    const wrapper = mount(App);
    await flushPromises();

    await wrapper.get("#prompt-input").setValue("hello");
    await wrapper.get("form").trigger("submit");
    await flushPromises();

    expect(wrapper.text()).toContain("Something went wrong");
    expect(wrapper.text()).toContain("right ok");
  });

  it("treats successful payload with non-string model as normalized error", async () => {
    fetchMock.mockResolvedValueOnce(
      modelsResponse([
        { id: "gpt-4.1-mini", object: "model", created: 0, owned_by: "openai" },
      ]),
    );
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ response: "bad model type", model: 42 }),
    });
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ response: "right ok", model: "gpt-4.1-mini" }),
    });

    const wrapper = mount(App);
    await flushPromises();

    await wrapper.get("#prompt-input").setValue("hello");
    await wrapper.get("form").trigger("submit");
    await flushPromises();

    expect(wrapper.text()).toContain("Something went wrong");
    expect(wrapper.text()).toContain("right ok");
  });
});
