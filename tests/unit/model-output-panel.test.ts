import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import ModelOutputPanel from "../../app/components/ModelOutputPanel.vue";

describe("ModelOutputPanel", () => {
  it("shows loading spinner with label-specific text", () => {
    const wrapper = mount(ModelOutputPanel, {
      props: {
        label: "Model 1",
        heading: "Response from Model 1 (gpt-4.1-mini)",
        status: "loading",
        data: null,
        error: null,
      },
    });

    expect(wrapper.text()).toContain("Waiting for Model 1 response...");
    expect(wrapper.get('[role="status"]').attributes("aria-live")).toBe(
      "polite",
    );
  });

  it("shows heading text from prop", () => {
    const wrapper = mount(ModelOutputPanel, {
      props: {
        label: "Model 2",
        heading: "Response from Model 2 (gpt-4o)",
        status: "loading",
        data: null,
        error: null,
      },
    });

    expect(wrapper.find("h2").text()).toBe("Response from Model 2 (gpt-4o)");
    expect(wrapper.text()).toContain("Waiting for Model 2 response...");
  });

  it("renders response text on success", () => {
    const wrapper = mount(ModelOutputPanel, {
      props: {
        label: "Model 1",
        heading: "Response from Model 1 (gpt-4.1-mini)",
        status: "success",
        data: "Hello from the model!",
        error: null,
      },
    });

    expect(wrapper.find("p.whitespace-pre-wrap").text()).toBe(
      "Hello from the model!",
    );
    expect(wrapper.find('[role="status"]').exists()).toBe(false);
  });

  it("renders error alert on error status", () => {
    const wrapper = mount(ModelOutputPanel, {
      props: {
        label: "Model 1",
        heading: "Response from Model 1 (gpt-4.1-mini)",
        status: "error",
        data: null,
        error: {
          category: "api",
          message: "Something went wrong",
        },
      },
    });

    expect(wrapper.find('[role="alert"]').exists()).toBe(true);
    expect(wrapper.text()).toContain("Something went wrong");
    expect(wrapper.find("p.whitespace-pre-wrap").exists()).toBe(false);
  });

  it("applies error styling class on error status", () => {
    const wrapper = mount(ModelOutputPanel, {
      props: {
        label: "Model 1",
        heading: "Response from Model 1 (gpt-4.1-mini)",
        status: "error",
        data: null,
        error: { category: "api", message: "Error" },
      },
    });

    expect(wrapper.get("article").classes()).toContain("bg-red-50");
  });

  it("applies success styling class on success status", () => {
    const wrapper = mount(ModelOutputPanel, {
      props: {
        label: "Model 1",
        heading: "Response from Model 1 (gpt-4.1-mini)",
        status: "success",
        data: "OK",
        error: null,
      },
    });

    expect(wrapper.get("article").classes()).toContain("bg-emerald-50");
  });

  it("shows nothing when status is idle", () => {
    const wrapper = mount(ModelOutputPanel, {
      props: {
        label: "Model 1",
        heading: "Response from Model 1 (gpt-4.1-mini)",
        status: "idle",
        data: null,
        error: null,
      },
    });

    expect(wrapper.find('[role="status"]').exists()).toBe(false);
    expect(wrapper.find('[role="alert"]').exists()).toBe(false);
    expect(wrapper.find("p.whitespace-pre-wrap").exists()).toBe(false);
  });
});
