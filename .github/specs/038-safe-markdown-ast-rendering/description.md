# Update Description: Safe Markdown AST Rendering

## General Description

Currently, the Markdown output of Model 3 is converted to HTML using the `marked` library and then sanitized using DOMPurify before being inserted into the comparison output panel via `v-html`. This approach requires disabling the ESLint rule `vue/no-v-html` and may pose a security risk from HTML injection vulnerabilities.

Update the app to convert Markdown output not into arbitrary HTML, but rather into safe element structures (headings, lists, bold, italics, code blocks, etc.) that don't pose any security risks. This eliminates the need for `v-html` and removes the security concern entirely.

## Specific Description

### Problem Statement
- **Current Issue**: The comparison output panel uses `v-html` to render dynamically generated HTML from Markdown, which requires disabling a critical ESLint security rule.
- **Security Risk**: Although DOMPurify sanitizes the HTML, the practice of rendering arbitrary HTML introduces potential vulnerabilities and violates Vue best practices.
- **Affected Users**: All users viewing Model 3 comparison responses formatted in Markdown.

### Intended Outcome
- Replace the HTML-based rendering pipeline with a safe Abstract Syntax Tree (AST) rendering approach.
- Convert Markdown input into a tree of safe, predefined node types (headings, paragraphs, lists, bold, italic, inline code, code blocks).
- Render these AST nodes as native Vue components and semantic HTML elements.
- Eliminate the use of `v-html` in the comparison output panel.
- Remove ESLint `vue/no-v-html` disable comments.

### Scope Boundaries
**In Scope**:
- Markdown features: headings (h1–h6), paragraphs, unordered/ordered lists, bold, italic, inline code, code blocks, line breaks
- Text content sanitization to prevent XSS within safe text nodes
- Vue component rendering of safe AST nodes
- Styling consistency with the existing `prose` utility classes
- Update `ComparisonOutputPanel.vue` to use the new renderer
- Update or create tests to verify safe rendering behavior

**Out of Scope**:
- HTML, links, images, or other inline media
- Tables, blockquotes, footnotes, or other complex Markdown features
- Rendering arbitrary Markdown extensions
- Changes to the ModelOutputPanel component (only ComparisonOutputPanel is affected)
- Performance optimization beyond what the new approach provides

### Key Behaviors & Expected Results
1. **New Type System**: Define a TypeScript-based safe Markdown AST in `app/types/markdown-ast.ts` covering all supported node types (Text, Heading, Paragraph, UnorderedList, OrderedList, ListItem, CodeBlock, InlineCode, Bold, Italic, LineBreak).
2. **Parser**: Create `app/utils/parse-markdown-safe.ts` that converts Markdown strings into safe AST nodes; reject, skip, or escape unsupported syntax silently.
3. **Renderer Component**: Create `app/components/MarkdownRenderer.vue` that recursively renders AST nodes as semantic Vue elements (`<h1>` through `<h6>`, `<p>`, `<ul>`, `<ol>`, `<li>`, `<strong>`, `<em>`, `<code>`, `<pre>`).
4. **No v-html**: The renderer produces native Vue elements—no `innerHTML` or `v-html` usage.
5. **Styling**: Apply existing Tailwind `prose` classes for visual consistency.
6. **Accessibility**: Maintain proper heading hierarchy, semantic HTML, and ARIA attributes.
7. **Output**: Model 3 responses render identically in appearance but as safe DOM nodes instead of sanitized HTML.

### Assumptions
- The `marked` library is available and can be configured or replaced with a simple string-based parser.
- Markdown output from Model 3 is expected to contain only supported features (no HTML, links, or images in normal use cases).
- Unsupported Markdown syntax should be silently stripped or escaped, not cause parsing errors.
- Styling via Tailwind `prose` utilities is sufficient; no custom CSS changes needed.

### Constraints
- Must not introduce breaking changes to the API contract of `ComparisonOutputPanel.vue` (prop names and types remain the same).
- Must pass all existing tests and maintain accessibility (WCAG 2.2 AA).
- Must not depend on external HTML sanitization libraries once conversion is complete (DOMPurify can be removed if it is no longer needed elsewhere).

### Explicit Exclusions
- No HTML tags or raw HTML rendering in Markdown.
- No Markdown links (would require URL validation and trust decisions).
- No images or media embeds.
- No tables.
- No blockquotes, footnotes, or strikethrough.
- No support for custom Markdown extensions.

## Non-Goals

- Rendering of HTML or arbitrary inline content from Markdown.
- Full CommonMark or GitHub-flavored Markdown compatibility.
- Performance comparison or benchmarking vs. the previous approach.
- Changes to how Model 1 or Model 2 responses are rendered.
- Refactoring of unrelated components or utilities.

---

**Next Step**: `.github/prompts/prompt-2-create-requirements-from-description.md` — pass this description to create formal requirements.
