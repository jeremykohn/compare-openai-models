import { describe, expect, it } from "vitest";
import type { MarkdownNode } from "../../app/types/markdown-ast";

describe("markdown-ast type contracts", () => {
  it("accepts supported node variants", () => {
    const nodes: MarkdownNode[] = [
      {
        type: "heading",
        level: 1,
        children: [{ type: "text", content: "Heading" }],
      },
      {
        type: "paragraph",
        children: [{ type: "inlineCode", content: "const x = 1" }],
      },
      {
        type: "unorderedList",
        children: [
          {
            type: "listItem",
            children: [{ type: "text", content: "Item" }],
          },
        ],
      },
      {
        type: "codeBlock",
        content: "console.log('safe')",
      },
      {
        type: "lineBreak",
      },
    ];

    expect(nodes).toHaveLength(5);
  });

  it("prevents unsupported HTML-like AST variants", () => {
    const unsupportedNode = {
      type: "html",
      content: "<script>alert(1)</script>",
    };

    // @ts-expect-error html nodes are outside the safe MarkdownNode union.
    const _invalidNode: MarkdownNode = unsupportedNode;

    expect(unsupportedNode.type).toBe("html");
  });
});
