import { describe, expect, it } from "vitest";
import { renderMarkdown } from "../../app/utils/render-markdown";

describe("renderMarkdown", () => {
  it("converts markdown into HTML elements", () => {
    const html = renderMarkdown("## Heading\n\n- item one\n- item two");

    expect(html).toContain("<h2>Heading</h2>");
    expect(html).toContain("<ul>");
    expect(html).toContain("<li>item one</li>");
    expect(html).toContain("<li>item two</li>");
  });

  it("sanitizes dangerous HTML and protocols", () => {
    const html = renderMarkdown(
      "[Unsafe](javascript:alert('x'))\n\n<script>alert('x')</script>",
    );

    expect(html).not.toContain("javascript:alert");
    expect(html).not.toContain("<script");
  });
});
