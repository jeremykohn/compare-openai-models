# Requirements: Safe Markdown AST Rendering

## Functional Requirements

### FR-1: Define Safe Markdown AST Types
The system must define a TypeScript-based Abstract Syntax Tree (AST) type system that represents supported Markdown features. 

**Specification**:
- Create type definitions for: `TextNode`, `HeadingNode` (levels 1–6), `ParagraphNode`, `UnorderedListNode`, `OrderedListNode`, `ListItemNode`, `CodeBlockNode`, `InlineCodeNode`, `BoldNode`, `ItalicNode`, and `LineBreakNode`.
- Each node type must have a `type` field (literal string) and `children` or `content` fields as appropriate.
- The type system must prevent arbitrary HTML or unsupported Markdown syntax from being represented.

**Acceptance Criteria**:
- AST types compile without errors.
- Type system covers all supported Markdown features listed in the description.
- Attempting to represent HTML or unsupported features produces TypeScript errors.

---

### FR-2: Parse Markdown to Safe AST
The system must convert Markdown strings into safe AST node trees, rejecting or neutralizing unsupported syntax.

**Specification**:
- Implement a `parseMarkdownSafe(input: string): MarkdownNode[]` function.
- Support parsing of: headings, paragraphs, unordered/ordered lists, bold, italic, inline code, code blocks, and line breaks.
- All unsupported Markdown syntax (HTML, links, images, tables, blockquotes) must be silently stripped, escaped, or skipped without throwing errors.
- Text content in all nodes must be sanitized to prevent XSS (e.g., angle brackets, quotes escaped or removed).

**Acceptance Criteria**:
- Function accepts Markdown strings and returns valid AST node arrays.
- Supported features parse correctly (e.g., `# Heading` → HeadingNode with level 1).
- Unsupported features (HTML tags, links, images) do not cause errors or appear in output.
- Text nodes contain no unescaped HTML or script content.

---

### FR-3: Render Safe AST as Vue Components
The system must render safe AST nodes as semantic Vue components and HTML elements.

**Specification**:
- Create a `MarkdownRenderer.vue` component that accepts an array of `MarkdownNode` objects as a prop.
- Render nodes recursively as semantic elements: `<h1>` through `<h6>`, `<p>`, `<ul>`, `<ol>`, `<li>`, `<strong>`, `<em>`, `<code>`, `<pre>`.
- Do not use `v-html`, `innerHTML`, or any dynamic HTML insertion.
- All text content must be rendered as text nodes (via `{{ }}` interpolation or text content).

**Acceptance Criteria**:
- Component accepts a `nodes` prop of type `MarkdownNode[]`.
- Each supported node type renders as the correct semantic element.
- No `v-html` or `innerHTML` usage in the component.
- ESLint rule `vue/no-v-html` is not disabled in this component.

---

### FR-4: Update ComparisonOutputPanel to Use Safe Renderer
The `ComparisonOutputPanel.vue` component must be updated to use the new safe Markdown renderer.

**Specification**:
- Replace the `renderedModel3Html` computed property with a new `renderedModel3Nodes` computed property that calls `parseMarkdownSafe()`.
- Replace the `v-html` binding in the template with the `MarkdownRenderer` component.
- Remove the `renderMarkdown` import and replace it with imports for `parseMarkdownSafe` and `MarkdownRenderer`.
- Remove the ESLint disable comments (`<!-- eslint-disable vue/no-v-html -->` and `<!-- eslint-enable vue/no-v-html -->`).

**Acceptance Criteria**:
- Component imports and uses `parseMarkdownSafe` and `MarkdownRenderer`.
- No `v-html` bindings in the template.
- ESLint disable comments are removed.
- Component passes all existing tests and retains identical visual output.

---

### FR-5: Maintain Visual Consistency
The rendered Markdown output must maintain visual consistency with the current HTML-based approach.

**Specification**:
- Apply existing Tailwind `prose` utility classes to the renderer output.
- Styling should match the current `.prose`, `.prose-sm`, `.prose-headings:break-words`, etc. classes applied to the old `v-html` div.
- Line breaking, text color, and spacing must remain consistent.

**Acceptance Criteria**:
- Rendered output is visually identical to the current implementation (manual visual inspection or screenshot comparison).
- Prose utility classes are applied correctly to semantic elements.

---

## Technical Requirements

### TR-1: AST Type System Location and Structure
- AST types must be defined in `app/types/markdown-ast.ts`.
- Each node type must be a discriminated union with a `type` field for safe pattern matching.
- The type system must support recursive node composition (e.g., bold nodes can contain inline code).

---

### TR-2: Parser Implementation Location and API
- Parser function must be in `app/utils/parse-markdown-safe.ts`.
- Export function signature: `export function parseMarkdownSafe(input: string): MarkdownNode[]`.
- Parser must return an array of top-level nodes (paragraphs, headings, lists, etc.).
- Parser must be pure (no side effects) and synchronous.

---

### TR-3: Renderer Component Structure
- Component file: `app/components/MarkdownRenderer.vue`.
- Component must use `<script setup lang="ts">` Composition API style.
- Props: `nodes?: MarkdownNode[]` (optional, defaults to empty array).
- No external dependencies for rendering (Vue only).

---

### TR-4: Text Sanitization
- All text content must be sanitized to prevent XSS before being inserted into AST nodes.
- Prohibited characters/sequences: unescaped `<`, `>`, `"`, `'`, JavaScript event handlers, and script tags.
- Sanitization approach: escape HTML entities or remove dangerous characters (implementation detail; approach is flexible).

---

### TR-5: Error Handling
- Parser must not throw errors on invalid or unsupported input.
- On parse failure or malformed Markdown, parser must gracefully degrade: create text nodes from unparseable content and continue.
- No `console.error` or `console.warn` logging for normal unsupported syntax (silent graceful degradation).

---

### TR-6: Dependency Management
- The new implementation should avoid adding new dependencies if possible.
- If the existing `marked` library is used, it must be configured to prevent HTML output.
- DOMPurify sanitization can be removed from the old `render-markdown.ts` if it is no longer used elsewhere.

---

### TR-7: Test Coverage
- Unit tests for `parseMarkdownSafe` function must cover:
  - All supported Markdown features (headings, lists, bold, italic, code, etc.)
  - Malformed input and edge cases (empty strings, nested structures)
  - XSS prevention (HTML tags, script tags, event handlers stripped/escaped)
- Unit tests for `MarkdownRenderer` component must cover:
  - Rendering of all supported node types
  - Recursive rendering of nested nodes
  - Absence of `v-html` usage
- Integration tests must verify that `ComparisonOutputPanel` renders Model 3 responses correctly using the new pipeline.
- File: `tests/unit/parse-markdown-safe.test.ts` and `tests/unit/markdown-renderer.test.ts`.

---

### TR-8: Type Safety
- The implementation must use strict TypeScript with no `any` types.
- All rendered content must be type-safe; no untyped DOM manipulation.

---

## Security Requirements

### SR-1: XSS Prevention via Safe AST Representation
The system must prevent Cross-Site Scripting (XSS) attacks by ensuring no arbitrary HTML or JavaScript can be rendered.

**Specification**:
- The AST type system must be a closed set; only supported Markdown features can be represented.
- HTML tags, script tags, event handlers, and Data URIs must not appear in any AST node.
- Text content must be sanitized before insertion into AST nodes to remove or escape dangerous characters.

**Acceptance Criteria**:
- Test vectors containing XSS payloads (e.g., `<img onerror="alert(1)">`, `<script>alert(1)</script>`) produce no JavaScript execution and are rendered as escaped text or omitted.
- Security tests in `tests/unit/parse-markdown-safe.test.ts` verify XSS prevention.

---

### SR-2: Input Validation and Rejection of Unsupported Syntax
The parser must reject or neutralize unsupported Markdown features that could represent security risks.

**Specification**:
- HTML (raw or inline): stripped, not rendered.
- Markdown links: silently removed or converted to plain text.
- JavaScript URLs: rejected.
- Data URIs: rejected.
- Custom HTML attributes: rejected.

**Acceptance Criteria**:
- Parser handles test cases with HTML, links, and data URIs without errors.
- Output contains no HTML, links, or data URIs.
- Tests confirm unsupported features are handled safely.

---

### SR-3: Elimination of HTML Sanitization Attack Surface
By replacing the HTML sanitization approach with safe AST rendering, the system must eliminate the risk of sanitizer bypass vulnerabilities.

**Specification**:
- The old `renderMarkdown` function (using `marked` + DOMPurify) must be replaced in `ComparisonOutputPanel`.
- No `v-html` or `innerHTML` in the new implementation.
- If DOMPurify is no longer used elsewhere, it should be removed from the project.

**Acceptance Criteria**:
- `ComparisonOutputPanel.vue` no longer imports `renderMarkdown`.
- No `v-html` bindings remain in the component.
- ESLint rule `vue/no-v-html` is not disabled anywhere in the component.
- If DOMPurify usage is eliminated, it can be removed from `package.json` (subject to dependency audit).

---

## Accessibility Requirements

### AR-1: Semantic HTML and Heading Hierarchy
The renderer must produce semantic HTML that preserves proper heading hierarchy.

**Specification**:
- Headings must be rendered with correct `<h1>` through `<h6>` tags corresponding to Markdown levels.
- Heading hierarchy must not skip levels (e.g., `<h1>` should not be followed directly by `<h3>`).
- Within a response, there should be only one logical top-level heading if the Markdown follows expected conventions.

**Acceptance Criteria**:
- Rendered heading structure is valid and predictable.
- Screen reader tests confirm headings are announced with correct levels.
- WCAG 2.2 AA: Heading levels are logical and non-skipping.

---

### AR-2: Text Alternative for Code Blocks (Optional Enhancement)
If supported, code blocks with a language identifier should convey the language context.

**Specification**:
- Code blocks with a `language` attribute (e.g., ` ```python `) should render the language name visibly or in an ARIA label.
- Example: `<pre><code class="language-python" aria-label="Python code block">...</code></pre>`.

**Acceptance Criteria**:
- Code blocks with language identifiers are marked with a visible label or ARIA attribute.
- Screen reader users understand the code block's language context.

---

### AR-3: Keyboard Navigation and Focus
The rendered output must not interfere with keyboard navigation or focus management.

**Specification**:
- No elements in the rendered output should capture focus unexpectedly.
- All interactive elements (if any) within rendered content must be keyboard-accessible.
- In the current scope, rendered Markdown is read-only, so no interactive elements are expected.

**Acceptance Criteria**:
- Tab order is predictable and follows document flow.
- Static rendered content does not interfere with keyboard navigation in the parent component.

---

### AR-4: Color and Text Contrast
Rendered text must meet WCAG 2.2 AA color contrast requirements.

**Specification**:
- Text color must have a contrast ratio of at least 4.5:1 against background color (or 3:1 for large text).
- Code blocks and inline code must maintain sufficient contrast.
- Tailwind `prose` classes should already provide correct colors; this requirement ensures they are preserved.

**Acceptance Criteria**:
- Contrast ratios are measured and confirmed compliant.
- No custom color overrides in the renderer degrade contrast.

---

## Out of Scope / Non-Goals

- HTML, links, images, or other inline media rendering.
- Tables, blockquotes, footnotes, or strikethrough.
- Markdown extensions or custom syntax.
- Performance benchmarking or optimization beyond current approach.
- Changes to ModelOutputPanel or other components.
- Rendering of Model 1 or Model 2 responses (not in scope).

---

## Assumptions and Constraints

### Assumptions
- Markdown output from Model 3 contains only supported features in normal operation.
- Unsupported syntax appearing in output can be safely stripped or escaped without loss of critical information.
- Styling via Tailwind `prose` utilities is sufficient.
- Current visual output is acceptable; changes are internal rendering mechanism only.

### Constraints
- Must maintain API compatibility with `ComparisonOutputPanel.vue` props.
- Must pass all existing unit and E2E tests.
- Must maintain WCAG 2.2 AA accessibility compliance.
- No breaking changes to the component contract.
- Must not introduce new external dependencies (ideally).

---

**Next Step**: `.github/prompts/prompt-3-create-technical-design-from-requirements.md` — pass the requirements to create a technical design.
