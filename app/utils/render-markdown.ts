import DOMPurify from "dompurify";
import { marked } from "marked";

export function renderMarkdown(input: string): string {
  const parsed = marked.parse(input, { async: false });
  const html = typeof parsed === "string" ? parsed : "";

  return DOMPurify.sanitize(html);
}
