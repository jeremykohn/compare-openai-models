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

    const leftSelect = wrapper.get("#models-select");
    const rightSelect = wrapper.get("#models-select-right");

    expect(wrapper.get('label[for="models-select"]').text()).toContain(
      "Model 1",
    );
    expect(wrapper.get('label[for="models-select-right"]').text()).toContain(
      "Model 2",
    );
    expect(leftSelect.attributes("aria-describedby")).toContain(
      "models-select-help",
    );
    expect(rightSelect.attributes("aria-describedby")).toContain(
      "models-select-help",
    );
    expect(rightSelect.attributes("disabled")).toBeUndefined();
  });
});
