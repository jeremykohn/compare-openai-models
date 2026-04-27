import { describe, expect, it, vi } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import { axe } from "vitest-axe";
import App from "../../app/app.vue";

const fetchMock = vi.fn();
vi.stubGlobal("fetch", fetchMock);

describe("app accessibility", () => {
  it("has no obvious accessibility violations", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        object: "list",
        data: [],
        usedConfigFilter: true,
        showFallbackNote: false,
      }),
    });

    const wrapper = mount(App);
    await flushPromises();
    const results = await axe(wrapper.element);
    expect(results.violations).toEqual([]);
  });

  it("renders skip link and main landmark wiring", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        object: "list",
        data: [],
        usedConfigFilter: true,
        showFallbackNote: false,
      }),
    });

    const wrapper = mount(App);
    await flushPromises();

    const skipLink = wrapper.get('a[href="#maincontent"]');
    expect(skipLink.text()).toBe("Skip to main");

    const main = wrapper.find("main#maincontent");
    expect(main.exists()).toBe(true);
  });

  it("renders response region with live semantics", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        object: "list",
        data: [],
        usedConfigFilter: true,
        showFallbackNote: false,
      }),
    });

    const wrapper = mount(App);
    await flushPromises();

    const responseRegion = wrapper.get("section[aria-live='polite']");
    expect(responseRegion.attributes("aria-atomic")).toBe("true");
  });

  it("renders labeled model selectors with both selectors active", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        object: "list",
        data: [
          {
            id: "gpt-4.1-mini",
            object: "model",
            created: 0,
            owned_by: "openai",
          },
        ],
        usedConfigFilter: true,
        showFallbackNote: false,
      }),
    });

    const wrapper = mount(App);
    await flushPromises();

    const model1Select = wrapper.get("#model1-select");
    const model2Select = wrapper.get("#model2-select");

    expect(wrapper.get('label[for="model1-select"]').text()).toContain(
      "Model 1",
    );
    expect(wrapper.get('label[for="model2-select"]').text()).toContain(
      "Model 2",
    );
    expect(model1Select.attributes("aria-describedby")).toContain(
      "models-select-help",
    );
    expect(model2Select.attributes("aria-describedby")).toContain(
      "models-select-help",
    );
    expect(model2Select.attributes("disabled")).toBeUndefined();
  });

  it("renders side-specific loading status semantics during submit", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        object: "list",
        data: [
          {
            id: "gpt-4.1-mini",
            object: "model",
            created: 0,
            owned_by: "openai",
          },
          {
            id: "gpt-4o",
            object: "model",
            created: 0,
            owned_by: "openai",
          },
        ],
        usedConfigFilter: true,
        showFallbackNote: false,
      }),
    });

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

    await wrapper.get("#model1-select").setValue("gpt-4o");
    await wrapper.get("#model2-select").setValue("gpt-4.1-mini");
    await wrapper.get("#prompt-input").setValue("hello");
    await wrapper.get("form").trigger("submit");
    await flushPromises();

    expect(wrapper.text()).toContain("Waiting for Model 1 response...");
    expect(wrapper.text()).toContain("Waiting for Model 2 response...");
    expect(wrapper.findAll('[role="status"]')).toHaveLength(2);

    resolveLeftRespond({
      ok: true,
      json: async () => ({ response: "left", model: "gpt-4o" }),
    });
    resolveRightRespond({
      ok: true,
      json: async () => ({ response: "right", model: "gpt-4.1-mini" }),
    });
    await flushPromises();
  });
});
