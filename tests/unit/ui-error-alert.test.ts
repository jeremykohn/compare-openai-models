import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import UiErrorAlert from "../../app/components/UiErrorAlert.vue";

describe("UiErrorAlert", () => {
  it("renders error message and title", () => {
    const wrapper = mount(UiErrorAlert, {
      props: {
        error: {
          category: "api",
          message: "Oops",
          statusCode: 400,
          details: "Technical details",
        },
      },
    });

    expect(wrapper.text()).toContain("Something went wrong");
    expect(wrapper.text()).toContain("Oops");
  });

  it("renders details element collapsed by default", () => {
    const wrapper = mount(UiErrorAlert, {
      props: {
        error: {
          category: "api",
          type: "invalid_request_error",
          message: "Oops",
          statusCode: 400,
        },
      },
    });

    const details = wrapper.get("details");
    expect(details.attributes("open")).toBeUndefined();
    expect(wrapper.text()).toContain("Error Details");
    expect(wrapper.text()).toContain("Type");
    expect(wrapper.text()).toContain("invalid_request_error");
    expect(wrapper.text()).toContain("Status Code");
    expect(wrapper.text()).toContain("400");
    const labels = wrapper.findAll("dt").map((entry) => entry.text().trim());
    expect(labels).not.toContain("Details");
  });

  it("shows details row only when details is present", () => {
    const wrapper = mount(UiErrorAlert, {
      props: {
        error: {
          category: "unknown",
          message: "Oops",
          details: "Technical details",
        },
      },
    });

    expect(wrapper.text()).toContain("Details");
    expect(wrapper.text()).toContain("Technical details");
    expect(wrapper.text()).not.toContain("Status Code");
    expect(wrapper.text()).not.toContain("Type");
  });

  it("shows code and param rows when present", () => {
    const wrapper = mount(UiErrorAlert, {
      props: {
        error: {
          category: "api",
          message: "Oops",
          code: "model_not_found",
          param: "model",
        },
      },
    });

    expect(wrapper.text()).toContain("Error Code");
    expect(wrapper.text()).toContain("model_not_found");
    expect(wrapper.text()).toContain("Param");
    expect(wrapper.text()).toContain("model");
  });

  it("hides retry by default and emits retry when shown", async () => {
    const wrapper = mount(UiErrorAlert, {
      props: {
        error: {
          category: "unknown",
          message: "Oops",
        },
      },
    });

    expect(wrapper.find('[data-testid="error-retry-button"]').exists()).toBe(
      false,
    );

    await wrapper.setProps({ showRetry: true });
    await wrapper.get('[data-testid="error-retry-button"]').trigger("click");
    expect(wrapper.emitted("retry")).toHaveLength(1);
  });
});
