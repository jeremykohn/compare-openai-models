import { describe, expect, it, vi } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import App from "../../app/app.vue";

const fetchMock = vi.fn();
vi.stubGlobal("fetch", fetchMock);

describe("app ui", () => {
  it("renders title and send button", async () => {
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
        ],
        usedConfigFilter: true,
        showFallbackNote: false,
      }),
    });

    const wrapper = mount(App);
    await flushPromises();

    expect(wrapper.text()).toContain("ChatGPT prompt tester");
    expect(wrapper.text()).toContain("Send");
  });

  it("validates empty prompt", async () => {
    fetchMock.mockResolvedValueOnce({
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
    await wrapper.get("form").trigger("submit");

    expect(wrapper.text()).toContain("Please enter a prompt.");
  });
});
