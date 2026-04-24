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

    const leftSelect = wrapper.get("#models-select");
    expect(leftSelect.attributes("aria-required")).toBe("true");
    expect(leftSelect.attributes("aria-invalid")).toBe("false");
    expect(leftSelect.attributes("aria-describedby")).toBe(
      "models-select-help",
    );

    const rightSelect = wrapper.get("#models-select-right");
    expect(rightSelect.attributes("disabled")).toBeDefined();

    const leftOptions = leftSelect
      .findAll("option")
      .map((option) => option.text());
    const rightOptions = rightSelect
      .findAll("option")
      .map((option) => option.text());
    expect(rightOptions).toEqual(leftOptions);
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

    const leftSelect = wrapper.get("#models-select");
    const rightSelect = wrapper.get("#models-select-right");
    expect(leftSelect.attributes("disabled")).toBeDefined();
    expect(rightSelect.attributes("disabled")).toBeDefined();
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

    const leftSelect = wrapper.get("#models-select");
    const rightSelect = wrapper.get("#models-select-right");
    expect(leftSelect.attributes("disabled")).toBeDefined();
    expect(rightSelect.attributes("disabled")).toBeDefined();
    expect(leftSelect.attributes("aria-invalid")).toBe("true");
    expect(leftSelect.attributes("aria-describedby")).toContain(
      "models-select-error",
    );
    expect(wrapper.text()).toContain("Could not load models");
    expect(wrapper.find('[role="alert"]').exists()).toBe(true);

    const retryButton = wrapper.get('[data-testid="error-retry-button"]');
    await retryButton.trigger("click");
    expect(wrapper.emitted("retry")).toHaveLength(1);
  });

  it("does not emit model updates from disabled right dropdown", async () => {
    const wrapper = mount(ModelsSelector, {
      props: {
        selectedModelId: "",
        status: "success",
        models: [makeModel("gpt-4.1-mini")],
        showFallbackNote: false,
      },
    });

    const rightSelect = wrapper.get("#models-select-right");
    await rightSelect.setValue("gpt-4.1-mini");

    expect(wrapper.emitted("update:selectedModelId")).toBeUndefined();
  });

  it("surfaces malformed success payload normalization as error state", () => {
    const wrapper = mount(ModelsSelector, {
      props: {
        selectedModelId: "",
        status: "error",
        models: null,
        error: {
          category: "unknown",
          message:
            "An unexpected error occurred. Please try again or contact support.",
          details:
            '{"object":"list","data":[{"id":"gpt-4.1-mini"}],"usedConfigFilter":true}',
        },
        showFallbackNote: false,
      },
    });

    expect(wrapper.find('[role="alert"]').exists()).toBe(true);
    expect(wrapper.text()).toContain("Something went wrong");
    expect(wrapper.text()).toContain("Error Details");
    expect(wrapper.text()).toContain('"usedConfigFilter":true');
  });
});
