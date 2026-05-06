# Technical Design: Safe Markdown AST Rendering

**Source:** `.github/specs/038-safe-markdown-ast-rendering/requirements.md`

**Date:** 2026-05-06

## Overview
This update replaces HTML-string markdown rendering with a closed, typed, safe Markdown AST pipeline to reduce XSS risk and remove dynamic HTML insertion from the UI.

The implementation introduces:
1. A strict discriminated-union AST in `app/types/markdown-ast.ts`.
2. A pure parser `parseMarkdownSafe(input)` in `app/utils/parse-markdown-safe.ts`.
3. A semantic recursive renderer `MarkdownRenderer.vue` in `app/components/MarkdownRenderer.vue`.
4. Integration updates in `ComparisonOutputPanel.vue` to remove `v-html` and route Model 3 output through the AST renderer.
5. New unit/integration tests for parser behavior, renderer correctness, and panel integration.

Non-goals remain aligned with requirements: no support for links/images/tables/HTML/blockquote extensions and no behavior changes outside Model 3 comparison rendering.

## Architecture
### Current State
- `ComparisonOutputPanel.vue` computes HTML using `renderMarkdown(...)` and renders with `v-html`.
- Safety depends on HTML sanitization and on preventing sanitizer bypasses.

### Target State
The rendering pipeline becomes:
1. Raw markdown string (Model 3 output)
2. `parseMarkdownSafe(input)`
3. `MarkdownNode[]` safe AST (closed type set)
4. `MarkdownRenderer` recursive rendering using semantic Vue template nodes only

No `v-html`, `innerHTML`, or dynamic HTML insertion is used.

### Parsing Strategy
The parser uses a line-oriented block parser plus inline token parser:
- Block pass recognizes headings, ordered/unordered lists, fenced code blocks, and paragraph boundaries.
- Inline pass recognizes bold, italic, inline code, and explicit line breaks.
- Unsupported syntax is neutralized by omission or conversion to plain text.

Unsupported feature behavior:
- Raw HTML tags are stripped.
- Markdown links/images are reduced to safe text content.
- Tables/blockquote and other unsupported patterns are treated as plain paragraph text.

### Renderer Strategy
`MarkdownRenderer.vue` renders each node by discriminated `type` with recursive descent:
- Block nodes map to `<h1..h6>`, `<p>`, `<ul>`, `<ol>`, `<li>`, `<pre><code>`.
- Inline nodes map to `<strong>`, `<em>`, `<code>`, text, and `<br>`.

Recursive rendering is implemented by using a self-referencing component pattern and strongly typed props (`nodes?: MarkdownNode[]`).

### Integration Strategy
`ComparisonOutputPanel.vue` changes:
- Replace `renderedModel3Html` with `renderedModel3Nodes` computed value.
- Replace `v-html` container with `<MarkdownRenderer :nodes="renderedModel3Nodes" />`.
- Preserve existing `prose` class stack on the wrapper to maintain typography and spacing.
- Remove `vue/no-v-html` disable comments.

## Interfaces
### AST Type Contracts (`app/types/markdown-ast.ts`)
Discriminated union root type:
- `MarkdownNode`

Node variants:
- `TextNode` (`type: "text"`, `content`)
- `LineBreakNode` (`type: "lineBreak"`)
- `InlineCodeNode` (`type: "inlineCode"`, `content`)
- `BoldNode` (`type: "bold"`, `children`)
- `ItalicNode` (`type: "italic"`, `children`)
- `ParagraphNode` (`type: "paragraph"`, `children`)
- `HeadingNode` (`type: "heading"`, `level`, `children`)
- `ListItemNode` (`type: "listItem"`, `children`)
- `UnorderedListNode` (`type: "unorderedList"`, `children`)
- `OrderedListNode` (`type: "orderedList"`, `start`, `children`)
- `CodeBlockNode` (`type: "codeBlock"`, `content`, optional `language`)

Supporting aliases:
- `MarkdownInlineNode`
- `MarkdownBlockNode`

The union is closed; no HTML node type exists.

### Parser API (`app/utils/parse-markdown-safe.ts`)
```ts
export function parseMarkdownSafe(input: string): MarkdownNode[]
```

Contract details:
- Pure, synchronous, no side effects.
- Never throws for malformed input.
- Returns top-level block nodes only.
- Always sanitizes text before AST insertion.

### Renderer API (`app/components/MarkdownRenderer.vue`)
Props:
- `nodes?: MarkdownNode[]` (default `[]`)

Rendering constraints:
- Vue template interpolation only for text output.
- No dynamic HTML APIs.

### Comparison Panel Contract
`ComparisonOutputPanel.vue` public props remain unchanged; only internal rendering implementation changes.

## Data
No backend or transport schema change is required.

Client-side data flow changes:
- Model 3 output string is transformed into `MarkdownNode[]` before render.
- AST nodes become the intermediate view model for markdown output.

Sanitized text storage model:
- Text content stored in AST as sanitized plain content.
- Dangerous raw HTML fragments are not persisted as renderable structures.

## Validation/Error Handling
Parser resilience rules:
- Empty/whitespace input returns `[]`.
- Invalid markdown constructs degrade to safe text nodes or skipped unsupported constructs.
- Unclosed fences or malformed markers are treated as text/code fallback without exceptions.
- No logging for normal unsupported syntax handling.

Normalization rules:
- Heading levels are clamped to `1..6`.
- To satisfy accessibility heading progression, parsed heading levels are normalized to avoid level skipping within a single rendered response.
- Ordered list `start` values are validated and defaulted when malformed.

Panel behavior:
- If parsing yields no nodes, panel shows empty/safe result area (existing panel state handling remains authoritative).

## Security
### Threat Model Focus
Primary risk is XSS from model-provided markdown content. The design removes HTML rendering primitives and blocks unsupported syntax from entering renderable structures.

### Controls
1. Closed AST type system:
   - Only approved markdown semantics are representable.
   - No AST path for arbitrary HTML/attributes/events.

2. Input neutralization in parser:
   - Strip raw HTML tags and script-like fragments.
   - Neutralize link/image syntax to non-interactive text.
   - Reject javascript/data URI semantics by not producing link/image nodes at all.

3. Safe rendering:
   - Vue interpolation for text output only.
   - No `v-html` and no direct DOM HTML insertion.

4. Dependency surface reduction:
   - Remove `renderMarkdown` usage from comparison panel.
   - If `render-markdown.ts` and DOMPurify are no longer referenced anywhere, remove dead code and dependency in a follow-up in-scope cleanup.

### Security Verification
Security tests include payloads such as:
- `<script>alert(1)</script>`
- `<img src=x onerror=alert(1)>`
- `[x](javascript:alert(1))`
- `[x](data:text/html;base64,...)`

Expected result: no executable content and no interactive unsafe output.

## Accessibility
The renderer outputs semantic elements and preserves prose styling, improving compatibility for people using screen readers and keyboard navigation.

Accessibility-specific design decisions:
1. Semantic block rendering:
   - Headings render with native `<h1..h6>`.
   - Lists and list items render as proper `<ul>/<ol>/<li>` structures.
   - Code uses `<pre><code>` semantics.

2. Heading progression normalization:
   - Renderer input is normalized to prevent heading-level skips in one response stream.

3. Read-only content behavior:
   - No focusable controls introduced.
   - Output remains static text/content flow and does not alter tab order.

4. Code block language context:
   - When fenced language is present, renderer adds `class="language-{lang}"` and `aria-label="{Language} code block"` on `<code>`.

## Testing
### Unit Tests: Parser (`tests/unit/parse-markdown-safe.test.ts`)
Coverage matrix:
- Supported syntax parsing:
  - headings (1-6)
  - paragraphs and line breaks
  - unordered and ordered lists
  - inline bold/italic/code
  - fenced code blocks (with/without language)
- Nested inline composition (bold containing italic/code, etc.)
- Malformed input fallback behavior
- Empty input handling
- Unsupported syntax neutralization (HTML/links/images/tables/blockquote)
- Security payload neutralization and non-throwing guarantees

### Unit Tests: Renderer (`tests/unit/markdown-renderer.test.ts`)
Coverage matrix:
- All node types render expected semantic tags
- Recursive rendering of nested nodes
- Language label semantics on code blocks
- No runtime reliance on HTML injection

### Integration Tests
- Update/add tests validating `ComparisonOutputPanel` uses safe AST pipeline and still renders expected model output content.
- Verify styling wrapper still uses existing `prose` utility classes.

### Regression/Guard Checks
- Search-based guard in tests or lint assertions to ensure `v-html` is absent from `ComparisonOutputPanel.vue`.
- Ensure existing panel tests and relevant a11y tests remain green.

## Traceability
| Requirement ID | Design Section | Notes |
|----------------|----------------|-------|
| FR-1 | Interfaces, Security | Closed discriminated union and explicit node variants enforce safe representable syntax. |
| FR-2 | Architecture, Interfaces, Validation/Error Handling, Security, Testing | Parser API/strategy, unsupported syntax neutralization, sanitization, and parser test matrix. |
| FR-3 | Architecture, Interfaces, Testing, Accessibility | Recursive semantic renderer with no dynamic HTML insertion and node-type mapping tests. |
| FR-4 | Architecture, Interfaces, Testing | `ComparisonOutputPanel` integration plan replacing `renderMarkdown`/`v-html`. |
| FR-5 | Architecture, Data, Testing | Preserve prose class wrapper and verify visual/styling parity in integration tests. |
| TR-1 | Interfaces | AST location, discriminated unions, recursive composition model. |
| TR-2 | Interfaces, Architecture, Validation/Error Handling | Parser location/signature, pure sync behavior, top-level block returns. |
| TR-3 | Interfaces, Architecture | `MarkdownRenderer.vue` script-setup props and dependency-free rendering. |
| TR-4 | Security, Data, Validation/Error Handling, Testing | Parser sanitization boundary and security payload validation. |
| TR-5 | Validation/Error Handling, Testing | Non-throwing behavior and graceful malformed-input fallback tests. |
| TR-6 | Security, Architecture | No new dependencies; deprecate old sanitizer path if unused. |
| TR-7 | Testing | Dedicated parser/renderer tests and panel integration validation. |
| TR-8 | Interfaces, Architecture | Strict typing and no untyped DOM manipulation strategy. |
| SR-1 | Security, Interfaces, Testing | XSS prevention through closed AST and no HTML injection path. |
| SR-2 | Security, Architecture, Testing | Unsupported syntax and risky URI schemes neutralized by parser behavior. |
| SR-3 | Architecture, Security, Testing | Eliminate `v-html` path in panel and verify replacement end-to-end. |
| AR-1 | Accessibility, Validation/Error Handling, Testing | Semantic heading tags with non-skipping normalization and heading behavior tests. |
| AR-2 | Accessibility, Interfaces, Testing | Language-aware code block labeling with visible/ARIA context. |
| AR-3 | Accessibility, Testing | Static content-only rendering preserving predictable keyboard flow. |
| AR-4 | Accessibility, Testing | Preserve prose styling and contrast characteristics; regression verification. |
