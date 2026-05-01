import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import ModelsSelector from "../../app/components/ModelsSelector.vue";
import { MODEL_SELECT_IDS } from "../../shared/constants/model-selectors";
import { makeModel } from "../helpers/fixtures";

describe("ModelsSelector", () => {
  it("exposes stable literal selector ID contract values", () => {
    const wrapper = mount(ModelsSelector, {
      props: {
        selectedModelIdModel1: "",
        selectedModelIdModel2: "",
        selectedModelIdModel3: "",
        status: "success",
        models: [makeModel("gpt-4.1-mini")],
        showFallbackNote: false,
      },
    });

    expect(wrapper.get("#model1-select").attributes("id")).toBe(
      "model1-select",
    );
    expect(wrapper.get("#model2-select").attributes("id")).toBe(
      "model2-select",
    );
    expect(wrapper.get("#model3-select").attributes("id")).toBe(
      "model3-select",
    );
  });

  it("shows loading indicator", () => {
    const wrapper = mount(ModelsSelector, {
      props: {
        selectedModelIdModel1: "",
        selectedModelIdModel2: "",
        selectedModelIdModel3: "",
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
        selectedModelIdModel1: "",
        selectedModelIdModel2: "",
        selectedModelIdModel3: "",
        status: "success",
        models: [makeModel("gpt-4.1-mini")],
        showFallbackNote: true,
      },
    });

    expect(wrapper.text()).toContain("Select a model");
    expect(wrapper.text()).toContain(
      "Each model is gpt-4.1-mini by default if not otherwise selected.",
    );
    expect(wrapper.text()).toContain("Note: List of OpenAI models");

    const leftSelect = wrapper.get(`#${MODEL_SELECT_IDS.model1}`);
    expect(leftSelect.attributes("aria-required")).toBe("true");
    expect(leftSelect.attributes("aria-invalid")).toBe("false");
    expect(leftSelect.attributes("aria-describedby")).toBe(
      "models-select-help",
    );

    const rightSelect = wrapper.get(`#${MODEL_SELECT_IDS.model2}`);
    expect(rightSelect.attributes("disabled")).toBeUndefined();

    const model3Select = wrapper.get(`#${MODEL_SELECT_IDS.model3}`);
    expect(model3Select.attributes("disabled")).toBeUndefined();

    const leftOptions = leftSelect
      .findAll("option")
      .map((option) => option.text());
    const rightOptions = rightSelect
      .findAll("option")
      .map((option) => option.text());
    const model3Options = model3Select
      .findAll("option")
      .map((option) => option.text());
    expect(rightOptions).toEqual(leftOptions);
    expect(model3Options).toEqual(leftOptions);
  });

  it("shows disabled no-model state when success has no models", () => {
    const wrapper = mount(ModelsSelector, {
      props: {
        selectedModelIdModel1: "",
        selectedModelIdModel2: "",
        selectedModelIdModel3: "",
        status: "success",
        models: [],
        showFallbackNote: false,
      },
    });

    const leftSelect = wrapper.get(`#${MODEL_SELECT_IDS.model1}`);
    const rightSelect = wrapper.get(`#${MODEL_SELECT_IDS.model2}`);
    const model3Select = wrapper.get(`#${MODEL_SELECT_IDS.model3}`);
    expect(leftSelect.attributes("disabled")).toBeDefined();
    expect(rightSelect.attributes("disabled")).toBeDefined();
    expect(model3Select.attributes("disabled")).toBeDefined();
    expect(wrapper.text()).toContain("No models available");
  });

  it("shows error alert, marks select invalid, and emits retry", async () => {
    const wrapper = mount(ModelsSelector, {
      props: {
        selectedModelIdModel1: "",
        selectedModelIdModel2: "",
        selectedModelIdModel3: "",
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

    const leftSelect = wrapper.get(`#${MODEL_SELECT_IDS.model1}`);
    const rightSelect = wrapper.get(`#${MODEL_SELECT_IDS.model2}`);
    const model3Select = wrapper.get(`#${MODEL_SELECT_IDS.model3}`);
    expect(leftSelect.attributes("disabled")).toBeDefined();
    expect(rightSelect.attributes("disabled")).toBeDefined();
    expect(model3Select.attributes("disabled")).toBeDefined();
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

  it("emits independent model updates from left and right dropdowns", async () => {
    const wrapper = mount(ModelsSelector, {
      props: {
        selectedModelIdModel1: "",
        selectedModelIdModel2: "",
        selectedModelIdModel3: "",
        status: "success",
        models: [makeModel("gpt-4.1-mini"), makeModel("gpt-4o")],
        showFallbackNote: false,
      },
    });

    const leftSelect = wrapper.get(`#${MODEL_SELECT_IDS.model1}`);
    const rightSelect = wrapper.get(`#${MODEL_SELECT_IDS.model2}`);
    await leftSelect.setValue("gpt-4.1-mini");
    await rightSelect.setValue("gpt-4.1-mini");

    expect(wrapper.emitted("update:selectedModelIdModel1")).toEqual([
      ["gpt-4.1-mini"],
    ]);
    expect(wrapper.emitted("update:selectedModelIdModel2")).toEqual([
      ["gpt-4.1-mini"],
    ]);
  });

  it("surfaces malformed success payload normalization as error state", () => {
    const wrapper = mount(ModelsSelector, {
      props: {
        selectedModelIdModel1: "",
        selectedModelIdModel2: "",
        selectedModelIdModel3: "",
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

  it("renders model labels with proper associations", () => {
    const wrapper = mount(ModelsSelector, {
      props: {
        selectedModelIdModel1: "",
        selectedModelIdModel2: "",
        selectedModelIdModel3: "",
        status: "success",
        models: [makeModel("gpt-4.1-mini")],
        showFallbackNote: false,
      },
    });

    expect(wrapper.get(`label[for="${MODEL_SELECT_IDS.model1}"]`).text()).toBe(
      "Model 1 *",
    );
    expect(wrapper.get(`label[for="${MODEL_SELECT_IDS.model2}"]`).text()).toBe(
      "Model 2 *",
    );
    expect(wrapper.get(`label[for="${MODEL_SELECT_IDS.model3}"]`).text()).toBe(
      "Model 3 for comparing responses *",
    );
    expect(
      wrapper.get(`#${MODEL_SELECT_IDS.model3}`).attributes("disabled"),
    ).toBeUndefined();
  });

  it("emits model 3 updates", async () => {
    const wrapper = mount(ModelsSelector, {
      props: {
        selectedModelIdModel1: "",
        selectedModelIdModel2: "",
        selectedModelIdModel3: "",
        status: "success",
        models: [makeModel("gpt-4.1-mini"), makeModel("gpt-4o")],
        showFallbackNote: false,
      },
    });

    await wrapper.get(`#${MODEL_SELECT_IDS.model3}`).setValue("gpt-4o");

    expect(wrapper.emitted("update:selectedModelIdModel3")).toEqual([
      ["gpt-4o"],
    ]);
  });
});
