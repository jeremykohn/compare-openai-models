import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import MarkdownRenderer from "../../app/components/MarkdownRenderer.vue";
import type { MarkdownNode } from "../../app/types/markdown-ast";

describe("MarkdownRenderer", () => {
  it("renders semantic block elements", () => {
    const nodes: MarkdownNode[] = [
      {
        type: "heading",
        level: 2,
        children: [{ type: "text", content: "Summary" }],
      },
      {
        type: "paragraph",
        children: [{ type: "text", content: "Body text" }],
      },
      {
        type: "unorderedList",
        children: [
          { type: "listItem", children: [{ type: "text", content: "One" }] },
          { type: "listItem", children: [{ type: "text", content: "Two" }] },
        ],
      },
      {
        type: "orderedList",
        start: 3,
        children: [
          {
            type: "listItem",
            children: [{ type: "text", content: "Third" }],
          },
        ],
      },
      {
        type: "codeBlock",
        language: "python",
        content: "print('hello')",
      },
    ];

    const wrapper = mount(MarkdownRenderer, { props: { nodes } });

    expect(wrapper.find("h2").text()).toBe("Summary");
    expect(wrapper.find("p").text()).toBe("Body text");
    expect(wrapper.findAll("ul li")).toHaveLength(2);
    expect(wrapper.find("ol").attributes("start")).toBe("3");
    expect(wrapper.find("pre code").attributes("class")).toContain(
      "language-python",
    );
  });

  it("renders recursive inline content and line breaks", () => {
    const nodes: MarkdownNode[] = [
      {
        type: "paragraph",
        children: [
          { type: "text", content: "Hello " },
          {
            type: "bold",
            children: [
              { type: "text", content: "bold " },
              {
                type: "italic",
                children: [{ type: "text", content: "italic" }],
              },
            ],
          },
          { type: "text", content: " and " },
          { type: "inlineCode", content: "code" },
          { type: "lineBreak" },
          { type: "text", content: "next" },
        ],
      },
    ];

    const wrapper = mount(MarkdownRenderer, { props: { nodes } });

    expect(wrapper.find("strong").exists()).toBe(true);
    expect(wrapper.find("em").exists()).toBe(true);
    expect(wrapper.find("code").text()).toContain("code");
    expect(wrapper.find("br").exists()).toBe(true);
    expect(wrapper.text()).toContain("Hello bold italic and codenext");
  });

  it("provides code block language context for assistive technology", () => {
    const wrapper = mount(MarkdownRenderer, {
      props: {
        nodes: [
          {
            type: "codeBlock",
            language: "ts",
            content: "const value = 1;",
          },
        ],
      },
    });

    const code = wrapper.get("pre code");
    expect(code.attributes("aria-label")).toBe("Ts code block");
  });

  it("defaults to rendering no output when nodes prop is omitted", () => {
    const wrapper = mount(MarkdownRenderer);
    expect(wrapper.text()).toBe("");
  });

  it("does not contain v-html usage", () => {
    const text = readFileSync(
      resolve(process.cwd(), "app/components/MarkdownRenderer.vue"),
      "utf8",
    );

    expect(text).not.toContain("v-html");
    expect(text).not.toContain("innerHTML");
  });
});
