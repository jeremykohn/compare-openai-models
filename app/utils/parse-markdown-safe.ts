import type {
  BoldNode,
  HeadingNode,
  InlineCodeNode,
  ItalicNode,
  LineBreakNode,
  ListItemNode,
  MarkdownInlineNode,
  MarkdownNode,
  OrderedListNode,
  ParagraphNode,
  TextNode,
  UnorderedListNode,
} from "../types/markdown-ast";

const HEADING_PATTERN = /^(#{1,6})\s+(.+)$/;
const ORDERED_LIST_PATTERN = /^\s*(\d+)\.\s+(.+)$/;
const UNORDERED_LIST_PATTERN = /^\s*[-*]\s+(.+)$/;
const CODE_FENCE_PATTERN = /^```\s*([a-zA-Z0-9_-]+)?\s*$/;

export function parseMarkdownSafe(input: string): MarkdownNode[] {
  if (!input.trim()) {
    return [];
  }

  const lines = input.replace(/\r\n?/g, "\n").split("\n");
  const nodes: MarkdownNode[] = [];
  let index = 0;
  let previousHeadingLevel: 1 | 2 | 3 | 4 | 5 | 6 | undefined;

  while (index < lines.length) {
    const line = lines[index] ?? "";

    if (!line.trim()) {
      index += 1;
      continue;
    }

    const codeFenceMatch = line.match(CODE_FENCE_PATTERN);
    if (codeFenceMatch) {
      const codeBlock = parseCodeBlock(lines, index, codeFenceMatch[1]);
      if (codeBlock.node) {
        nodes.push(codeBlock.node);
      }
      index = codeBlock.nextIndex;
      continue;
    }

    const headingMatch = line.match(HEADING_PATTERN);
    if (headingMatch) {
      const nextLevel = normalizeHeadingLevel(
        (headingMatch[1] ?? "").length,
        previousHeadingLevel,
      );
      previousHeadingLevel = nextLevel;

      const heading: HeadingNode = {
        type: "heading",
        level: nextLevel,
        children: parseInline(headingMatch[2] ?? ""),
      };

      if (heading.children.length > 0) {
        nodes.push(heading);
      }

      index += 1;
      continue;
    }

    if (line.match(ORDERED_LIST_PATTERN)) {
      const orderedList = parseOrderedList(lines, index);
      if (orderedList.node) {
        nodes.push(orderedList.node);
      }
      index = orderedList.nextIndex;
      continue;
    }

    if (line.match(UNORDERED_LIST_PATTERN)) {
      const unorderedList = parseUnorderedList(lines, index);
      if (unorderedList.node) {
        nodes.push(unorderedList.node);
      }
      index = unorderedList.nextIndex;
      continue;
    }

    const paragraph = parseParagraph(lines, index);
    if (paragraph.node) {
      nodes.push(paragraph.node);
    }
    index = paragraph.nextIndex;
  }

  return nodes;
}

function parseCodeBlock(
  lines: string[],
  startIndex: number,
  languageRaw: string | undefined,
): { node: MarkdownNode | undefined; nextIndex: number } {
  const language = sanitizeCodeLanguage(languageRaw);
  const contentLines: string[] = [];
  let index = startIndex + 1;

  while (index < lines.length) {
    const line = lines[index] ?? "";
    if (line.match(CODE_FENCE_PATTERN)) {
      const content = sanitizeText(contentLines.join("\n")).trimEnd();
      if (!content) {
        return { node: undefined, nextIndex: index + 1 };
      }

      return {
        node: {
          type: "codeBlock",
          language,
          content,
        },
        nextIndex: index + 1,
      };
    }

    contentLines.push(line);
    index += 1;
  }

  const fallbackText = sanitizeText(lines.slice(startIndex).join("\n")).trim();
  if (!fallbackText) {
    return { node: undefined, nextIndex: lines.length };
  }

  return {
    node: {
      type: "paragraph",
      children: [{ type: "text", content: fallbackText }],
    },
    nextIndex: lines.length,
  };
}

function parseOrderedList(
  lines: string[],
  startIndex: number,
): { node: OrderedListNode | undefined; nextIndex: number } {
  const items: ListItemNode[] = [];
  let index = startIndex;
  let start = 1;

  while (index < lines.length) {
    const line = lines[index] ?? "";
    const match = line.match(ORDERED_LIST_PATTERN);
    if (!match) {
      break;
    }

    if (items.length === 0) {
      const parsedStart = Number.parseInt(match[1] ?? "1", 10);
      start = Number.isFinite(parsedStart) && parsedStart > 0 ? parsedStart : 1;
    }

    const children = parseInline(match[2] ?? "");
    if (children.length > 0) {
      items.push({ type: "listItem", children });
    }

    index += 1;
  }

  if (items.length === 0) {
    return { node: undefined, nextIndex: index };
  }

  return {
    node: {
      type: "orderedList",
      start,
      children: items,
    },
    nextIndex: index,
  };
}

function parseUnorderedList(
  lines: string[],
  startIndex: number,
): { node: UnorderedListNode | undefined; nextIndex: number } {
  const items: ListItemNode[] = [];
  let index = startIndex;

  while (index < lines.length) {
    const line = lines[index] ?? "";
    const match = line.match(UNORDERED_LIST_PATTERN);
    if (!match) {
      break;
    }

    const children = parseInline(match[1] ?? "");
    if (children.length > 0) {
      items.push({ type: "listItem", children });
    }

    index += 1;
  }

  if (items.length === 0) {
    return { node: undefined, nextIndex: index };
  }

  return {
    node: {
      type: "unorderedList",
      children: items,
    },
    nextIndex: index,
  };
}

function parseParagraph(
  lines: string[],
  startIndex: number,
): { node: ParagraphNode | undefined; nextIndex: number } {
  const paragraphLines: string[] = [];
  let index = startIndex;

  while (index < lines.length) {
    const line = lines[index] ?? "";
    if (!line.trim()) {
      break;
    }

    if (
      line.match(CODE_FENCE_PATTERN) ||
      line.match(HEADING_PATTERN) ||
      line.match(ORDERED_LIST_PATTERN) ||
      line.match(UNORDERED_LIST_PATTERN)
    ) {
      break;
    }

    paragraphLines.push(line);
    index += 1;
  }

  const paragraphText = paragraphLines.join("\n");
  const children = parseInline(paragraphText);

  if (children.length === 0) {
    return { node: undefined, nextIndex: index + 1 };
  }

  return {
    node: {
      type: "paragraph",
      children,
    },
    nextIndex: index,
  };
}

function parseInline(value: string): MarkdownInlineNode[] {
  const normalized = neutralizeUnsupportedMarkdown(value);
  return parseInlineTokens(normalized);
}

function parseInlineTokens(value: string): MarkdownInlineNode[] {
  const nodes: MarkdownInlineNode[] = [];
  let index = 0;

  while (index < value.length) {
    const char = value[index];

    if (char === "\n") {
      const lineBreak: LineBreakNode = { type: "lineBreak" };
      nodes.push(lineBreak);
      index += 1;
      continue;
    }

    if (value.startsWith("`", index)) {
      const endIndex = value.indexOf("`", index + 1);
      if (endIndex > index + 1) {
        const codeNode: InlineCodeNode = {
          type: "inlineCode",
          content: sanitizeText(value.slice(index + 1, endIndex)),
        };
        if (codeNode.content) {
          nodes.push(codeNode);
        }
        index = endIndex + 1;
        continue;
      }
    }

    if (value.startsWith("**", index)) {
      const endIndex = value.indexOf("**", index + 2);
      if (endIndex > index + 2) {
        const children = parseInlineTokens(value.slice(index + 2, endIndex));
        if (children.length > 0) {
          const boldNode: BoldNode = { type: "bold", children };
          nodes.push(boldNode);
          index = endIndex + 2;
          continue;
        }
      }
    }

    if (char === "*" || char === "_") {
      const endIndex = value.indexOf(char, index + 1);
      if (endIndex > index + 1) {
        const children = parseInlineTokens(value.slice(index + 1, endIndex));
        if (children.length > 0) {
          const italicNode: ItalicNode = { type: "italic", children };
          nodes.push(italicNode);
          index = endIndex + 1;
          continue;
        }
      }
    }

    const nextTokenIndex = findNextTokenIndex(value, index + 1);
    const textContent = sanitizeText(value.slice(index, nextTokenIndex));
    if (textContent) {
      const textNode: TextNode = { type: "text", content: textContent };
      nodes.push(textNode);
    }
    index = nextTokenIndex;
  }

  return nodes;
}

function findNextTokenIndex(value: string, from: number): number {
  const indexes = [
    value.indexOf("\n", from),
    value.indexOf("`", from),
    value.indexOf("**", from),
    value.indexOf("*", from),
    value.indexOf("_", from),
  ].filter((index) => index >= 0);

  return indexes.length > 0 ? Math.min(...indexes) : value.length;
}

function neutralizeUnsupportedMarkdown(value: string): string {
  return sanitizeText(
    value
      .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
      .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
      .replace(/(^|\n)\s*>\s?/g, "$1")
      .replace(/(^|\n)\|.*\|\s*$/gm, "")
      .replace(/`{3,}[\s\S]*?`{3,}/g, ""),
  );
}

function sanitizeCodeLanguage(value: string | undefined): string | undefined {
  if (!value) {
    return undefined;
  }

  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "");
  return normalized || undefined;
}

function normalizeHeadingLevel(
  rawLevel: number,
  previousLevel: HeadingNode["level"] | undefined,
): HeadingNode["level"] {
  const clamped = clampHeadingLevel(rawLevel);
  if (!previousLevel) {
    return clamped;
  }

  if (clamped > previousLevel + 1) {
    return clampHeadingLevel(previousLevel + 1);
  }

  return clamped;
}

function clampHeadingLevel(level: number): HeadingNode["level"] {
  if (level <= 1) {
    return 1;
  }

  if (level >= 6) {
    return 6;
  }

  return level as HeadingNode["level"];
}

function sanitizeText(value: string): string {
  return value
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<\/?[a-zA-Z][^>]*>/g, "")
    .replace(/javascript\s*:/gi, "")
    .replace(/data\s*:/gi, "")
    .replace(/on[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s]+)/gi, "")
    .replace(/[<>"']/g, "");
}
