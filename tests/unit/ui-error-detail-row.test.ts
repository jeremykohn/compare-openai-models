import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import UiErrorDetailRow from "../../app/components/UiErrorDetailRow.vue";

describe("UiErrorDetailRow", () => {
  it("renders label and string value", () => {
    const wrapper = mount(UiErrorDetailRow, {
      props: {
        label: "Error Code",
        value: "model_not_found",
      },
    });

    expect(wrapper.text()).toContain("Error Code");
    expect(wrapper.text()).toContain("model_not_found");
  });

  it("renders numeric value", () => {
    const wrapper = mount(UiErrorDetailRow, {
      props: {
        label: "Status Code",
        value: 400,
      },
    });

    expect(wrapper.text()).toContain("Status Code");
    expect(wrapper.text()).toContain("400");
  });

  it("applies row wrapper and value containment classes", () => {
    const wrapper = mount(UiErrorDetailRow, {
      props: {
        label: "Details",
        value: "Long details",
      },
    });

    const row = wrapper.get("div");
    expect(row.classes()).toContain("grid");
    expect(row.classes()).toContain("min-w-0");

    const value = wrapper.get("dd");
    expect(value.classes()).toContain("min-w-0");
    expect(value.classes()).toContain("break-words");
    expect(value.classes()).toContain("whitespace-pre-wrap");
  });
});
