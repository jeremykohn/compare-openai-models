import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import ModelsSelector from "../../app/components/ModelsSelector.vue";
import { makeModel } from "../helpers/fixtures";

describe("ModelsSelector", () => {
  it("shows loading indicator", () => {
    const wrapper = mount(ModelsSelector, {
      props: {
        selectedModelId: "",
        status: "loading",
        models: null,
        showFallbackNote: false,
      },
    });

    expect(wrapper.text()).toContain("Loading models...");
  });

  it("shows models and helper text", () => {
    const wrapper = mount(ModelsSelector, {
      props: {
        selectedModelId: "",
        status: "success",
        models: [makeModel("gpt-4.1-mini")],
        showFallbackNote: true,
      },
    });

    expect(wrapper.text()).toContain("Select a model");
    expect(wrapper.text()).toContain(
      "Uses gpt-4.1-mini by default if none is selected.",
    );
    expect(wrapper.text()).toContain("Note: List of OpenAI models");
  });
});
