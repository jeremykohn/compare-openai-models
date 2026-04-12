import { flushPromises, mount } from "@vue/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";

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

  it("shows success response card with heading and pre-wrap text class", async () => {
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

    expect(wrapper.text()).toContain("Response");
    const responseParagraph = wrapper.find("article p.whitespace-pre-wrap");
    expect(responseParagraph.exists()).toBe(true);
    expect(responseParagraph.text()).toContain("Hello");
  });

  it("shows response error with details toggle labels", async () => {
    fetchMock.mockResolvedValueOnce(modelsResponse());
    fetchMock.mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        message: "Request to OpenAI failed.",
        details: "Authorization: Bearer abc",
      }),
    });

    const wrapper = mount(App);
    await flushPromises();

    await wrapper.get("#prompt-input").setValue("hello");
    await wrapper.get("form").trigger("submit");
    await flushPromises();

    expect(wrapper.text()).toContain("Something went wrong");
    expect(wrapper.text()).toContain("Show details");

    const toggle = wrapper.get('[data-testid="error-details-toggle"]');
    await toggle.trigger("click");
    expect(wrapper.text()).toContain("Hide details");
  });
});
