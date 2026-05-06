export type MarkdownInlineNode =
  | TextNode
  | InlineCodeNode
  | BoldNode
  | ItalicNode
  | LineBreakNode;

export type MarkdownBlockNode =
  | HeadingNode
  | ParagraphNode
  | UnorderedListNode
  | OrderedListNode
  | CodeBlockNode;

export type MarkdownNode = MarkdownBlockNode | MarkdownInlineNode;

export interface TextNode {
  type: "text";
  content: string;
}

export interface HeadingNode {
  type: "heading";
  level: 1 | 2 | 3 | 4 | 5 | 6;
  children: MarkdownInlineNode[];
}

export interface ParagraphNode {
  type: "paragraph";
  children: MarkdownInlineNode[];
}

export interface UnorderedListNode {
  type: "unorderedList";
  children: ListItemNode[];
}

export interface OrderedListNode {
  type: "orderedList";
  children: ListItemNode[];
  start: number;
}

export interface ListItemNode {
  type: "listItem";
  children: MarkdownInlineNode[];
}

export interface CodeBlockNode {
  type: "codeBlock";
  language?: string;
  content: string;
}

export interface InlineCodeNode {
  type: "inlineCode";
  content: string;
}

export interface BoldNode {
  type: "bold";
  children: MarkdownInlineNode[];
}

export interface ItalicNode {
  type: "italic";
  children: MarkdownInlineNode[];
}

export interface LineBreakNode {
  type: "lineBreak";
}
