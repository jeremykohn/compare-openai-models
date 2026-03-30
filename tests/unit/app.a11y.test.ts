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
});
