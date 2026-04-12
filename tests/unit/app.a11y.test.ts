import { flushPromises, mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
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
});
