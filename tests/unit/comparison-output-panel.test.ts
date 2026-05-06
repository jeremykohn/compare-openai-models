import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import ComparisonOutputPanel from "../../app/components/ComparisonOutputPanel.vue";

describe("ComparisonOutputPanel", () => {
  it("renders model 3 markdown using safe AST renderer", () => {
    const wrapper = mount(ComparisonOutputPanel, {
      props: {
        isWaiting: false,
        heading:
          "Response from Model 3 (gpt-4o) comparing responses from Model 1 and Model 2",
        hasOuterError: false,
        errorText: "",
        generatedPromptText: "Prompt text",
        promptResetKey: 0,
        model3Status: "success",
        model3Data: "## Summary\n\n- one\n- two\n\n<script>alert(1)</script>",
        model3Error: null,
        isModel3Loading: false,
      },
    });

    const response = wrapper.get('[data-testid="comparison-model3-response"]');
    expect(response.find("h2").text()).toBe("Summary");
    expect(response.findAll("li")).toHaveLength(2);
    expect(response.html()).not.toContain("<script");
  });

  it("keeps prose styling classes on rendered markdown container", () => {
    const wrapper = mount(ComparisonOutputPanel, {
      props: {
        isWaiting: false,
        heading:
          "Response from Model 3 (gpt-4o) comparing responses from Model 1 and Model 2",
        hasOuterError: false,
        errorText: "",
        generatedPromptText: "Prompt text",
        promptResetKey: 0,
        model3Status: "success",
        model3Data: "Paragraph",
        model3Error: null,
        isModel3Loading: false,
      },
    });

    const response = wrapper.get('[data-testid="comparison-model3-response"]');

    expect(response.classes()).toContain("prose");
    expect(response.classes()).toContain("prose-sm");
    expect(response.classes()).toContain("prose-headings:break-words");
  });

  it("does not include v-html in source", () => {
    const text = readFileSync(
      resolve(process.cwd(), "app/components/ComparisonOutputPanel.vue"),
      "utf8",
    );

    expect(text).not.toContain("v-html");
    expect(text).not.toContain("eslint-disable vue/no-v-html");
  });
});
