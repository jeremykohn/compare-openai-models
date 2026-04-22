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
    expect(wrapper.get('[role="status"]').attributes("aria-live")).toBe(
      "polite",
    );
    expect(wrapper.find("select").exists()).toBe(false);
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

    const select = wrapper.get("#models-select");
    expect(select.attributes("aria-required")).toBe("true");
    expect(select.attributes("aria-invalid")).toBe("false");
    expect(select.attributes("aria-describedby")).toBe("models-select-help");
  });

  it("shows disabled no-model state when success has no models", () => {
    const wrapper = mount(ModelsSelector, {
      props: {
        selectedModelId: "",
        status: "success",
        models: [],
        showFallbackNote: false,
      },
    });

    const select = wrapper.get("#models-select");
    expect(select.attributes("disabled")).toBeDefined();
    expect(wrapper.text()).toContain("No models available");
  });

  it("shows error alert, marks select invalid, and emits retry", async () => {
    const wrapper = mount(ModelsSelector, {
      props: {
        selectedModelId: "",
        status: "error",
        models: null,
        error: {
          category: "api",
          message: "Could not load models",
          details: "Request failed",
        },
        showFallbackNote: false,
      },
    });

    const select = wrapper.get("#models-select");
    expect(select.attributes("disabled")).toBeDefined();
    expect(select.attributes("aria-invalid")).toBe("true");
    expect(select.attributes("aria-describedby")).toContain(
      "models-select-error",
    );
    expect(wrapper.text()).toContain("Could not load models");
    expect(wrapper.find('[role="alert"]').exists()).toBe(true);

    const retryButton = wrapper.get('[data-testid="error-retry-button"]');
    await retryButton.trigger("click");
    expect(wrapper.emitted("retry")).toHaveLength(1);
  });
});
