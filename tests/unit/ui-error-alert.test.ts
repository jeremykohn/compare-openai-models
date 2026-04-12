import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";

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
    expect(wrapper.text()).toContain("Show details");

    await wrapper.get("button").trigger("click");
    expect(wrapper.text()).toContain("Hide details");
    expect(wrapper.text()).toContain("Technical details");
  });
});
