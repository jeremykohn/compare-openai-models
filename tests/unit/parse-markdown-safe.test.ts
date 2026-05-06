import { describe, expect, it } from "vitest";
import { parseMarkdownSafe } from "../../app/utils/parse-markdown-safe";

describe("parseMarkdownSafe", () => {
  it("parses headings, paragraphs, and unordered lists", () => {
    const nodes = parseMarkdownSafe(
      "# Title\n\nHello world\n\n- item one\n- item two",
    );

    expect(nodes).toHaveLength(3);
    expect(nodes[0]).toMatchObject({ type: "heading", level: 1 });
    expect(nodes[1]).toMatchObject({ type: "paragraph" });
    expect(nodes[2]).toMatchObject({ type: "unorderedList" });

    const list = nodes[2]!;
    if (list.type !== "unorderedList") {
      throw new Error("expected unorderedList");
    }

    expect(list.children).toHaveLength(2);
  });

  it("parses ordered lists and start value", () => {
    const nodes = parseMarkdownSafe("3. third\n4. fourth");

    expect(nodes).toHaveLength(1);
    expect(nodes[0]).toMatchObject({ type: "orderedList", start: 3 });
  });

  it("parses bold, italic, inline code, and line breaks", () => {
    const nodes = parseMarkdownSafe(
      "Hello **bold _italic_** and `code`\nnext line",
    );

    expect(nodes).toHaveLength(1);

    const paragraph = nodes[0]!;
    if (paragraph.type !== "paragraph") {
      throw new Error("expected paragraph");
    }

    expect(paragraph.children.some((node) => node.type === "bold")).toBe(true);
    expect(paragraph.children.some((node) => node.type === "inlineCode")).toBe(
      true,
    );
    expect(paragraph.children.some((node) => node.type === "lineBreak")).toBe(
      true,
    );
  });

  it("parses fenced code blocks and optional language", () => {
    const nodes = parseMarkdownSafe("```ts\nconst x = 1;\n```\n");

    expect(nodes).toHaveLength(1);
    expect(nodes[0]).toMatchObject({
      type: "codeBlock",
      language: "ts",
      content: "const x = 1;",
    });
  });

  it("neutralizes unsupported markdown links and images", () => {
    const nodes = parseMarkdownSafe(
      "[Unsafe](javascript:alert(1))\n\n![alt text](https://example.com/a.png)",
    );

    expect(nodes).toHaveLength(2);

    const first = nodes[0]!;
    const second = nodes[1]!;
    if (first.type !== "paragraph" || second.type !== "paragraph") {
      throw new Error("expected paragraphs");
    }

    const firstText = first.children
      .filter((node) => node.type === "text")
      .map((node) => node.content)
      .join(" ");
    const secondText = second.children
      .filter((node) => node.type === "text")
      .map((node) => node.content)
      .join(" ");

    expect(firstText).toContain("Unsafe");
    expect(firstText).not.toContain("javascript:");
    expect(secondText).toContain("alt text");
  });

  it("strips html/script content and dangerous sequences", () => {
    const nodes = parseMarkdownSafe(
      "<script>alert('x')</script>\n\n<img src=x onerror=alert(1)>",
    );

    expect(nodes).toHaveLength(0);
  });

  it("removes encoded script tag payloads", () => {
    const nodes = parseMarkdownSafe("&lt;script&gt;alert(1)&lt;/script&gt;");

    expect(nodes).toHaveLength(0);
  });

  it("removes malformed and mixed-case script tag payloads", () => {
    const nodes = parseMarkdownSafe("<ScRiPt type='text/javascript'>x()</sCriPt>");

    expect(nodes).toHaveLength(0);
  });

  it("preserves normal text and comparison symbols", () => {
    const nodes = parseMarkdownSafe('Use 2 < 3 and "quoted" text.');

    expect(nodes).toHaveLength(1);

    const paragraph = nodes[0];
    if (!paragraph || paragraph.type !== "paragraph") {
      throw new Error("expected paragraph");
    }

    const text = paragraph.children
      .filter((node) => node.type === "text")
      .map((node) => node.content)
      .join(" ");

    expect(text).toContain('Use 2 < 3 and "quoted" text.');
  });

  it("does not throw on malformed markdown", () => {
    expect(() =>
      parseMarkdownSafe("**unterminated\n```js\nconst x = 1"),
    ).not.toThrow();
  });

  it("returns empty array for empty input", () => {
    expect(parseMarkdownSafe("")).toEqual([]);
    expect(parseMarkdownSafe("   \n\n")).toEqual([]);
  });

  it("normalizes heading levels to avoid skipping", () => {
    const nodes = parseMarkdownSafe("# One\n### Three\n###### Six");

    const headings = nodes.filter((node) => node.type === "heading");

    expect(headings).toHaveLength(3);
    expect(headings[0]).toMatchObject({ level: 1 });
    expect(headings[1]).toMatchObject({ level: 2 });
    expect(headings[2]).toMatchObject({ level: 3 });
  });
});
