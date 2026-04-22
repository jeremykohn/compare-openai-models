import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import UiErrorAlert from "../../app/components/UiErrorAlert.vue";

describe("UiErrorAlert", () => {
  it("renders message and toggles details", async () => {
    const wrapper = mount(UiErrorAlert, {
      props: {
        message: "Oops",
        details: "Technical details",
      },
    });

    expect(wrapper.text()).toContain("Oops");
    expect(wrapper.text()).toContain("Show error details");
    expect(wrapper.find("details").exists()).toBe(true);

    const details = wrapper.get("details");
    (details.element as HTMLDetailsElement).open = true;
    await details.trigger("toggle");
    expect(wrapper.text()).toContain("Technical details");
  });
});
