# Requirements

## Functional Requirements

### FR-1: Render Model 3 success response as HTML from Markdown
When Model 3 query succeeds, the comparison output panel shall render the response text as HTML converted from Markdown, rather than as a plain-text string.

**Acceptance Criteria**
- Markdown headings in the response render as visible heading elements (`<h1>`–`<h6>` or equivalent HTML).
- Ordered and unordered lists render as `<ol>`/`<ul>` with `<li>` items.
- Emphasis (`*text*` / `_text_`) and strong (`**text**`) render as `<em>` / `<strong>`.
- Paragraphs are separated as distinct `<p>` elements.
- Code spans and fenced code blocks render as `<code>` / `<pre><code>` elements.
- The raw Markdown source is not shown directly as escaped characters or plain text in the rendered output.

### FR-2: Keep Model 3 loading and error states unchanged
Loading spinners and error panels for Model 3 shall be visually and functionally identical to current behavior after this change.

**Acceptance Criteria**
- `Waiting for Model 3 response...` loading state is unaffected.
- Error panel with `<details>` toggle behaves identically to current behavior.

### FR-3: Keep Model 1 and Model 2 output rendering unchanged
Model 1 and Model 2 success panels shall continue to render plain text with `whitespace-pre-wrap`, as they do today.

**Acceptance Criteria**
- `ModelOutputPanel` component and its rendering logic are not modified by this spec.
- No Markdown-to-HTML transformation is introduced for Model 1 or Model 2 panels.

## Technical Requirements

### TR-1: Add a Markdown-to-HTML rendering utility
A utility function or composable shall encapsulate the Markdown-to-HTML conversion, keeping the conversion logic out of the component template.

**Acceptance Criteria**
- A new utility (for example `app/utils/render-markdown.ts`) wraps the conversion call.
- `ComparisonOutputPanel.vue` calls this utility for the Model 3 success path.
- The utility is unit-testable in isolation.

### TR-2: Use an established Markdown library
A well-maintained Markdown parsing/rendering library shall be added as a production dependency.

**Acceptance Criteria**
- A library capable of converting Markdown to HTML is installed via `npm install`.
- The library chosen has an appropriate security record or exposes a sanitization mechanism.
- No custom Markdown parser is written from scratch.

### TR-3: Sanitize rendered HTML before injecting into the DOM
HTML produced by the Markdown renderer shall be sanitized to remove potential XSS vectors before being bound with `v-html`.

**Acceptance Criteria**
- A sanitization step (either via the chosen library's safe-mode or an additional sanitizer) is applied before any HTML string is placed into the DOM via `v-html`.
- Script tags and event-handler attributes in model output are stripped.
- Implementation matches or exceeds OWASP guidance for untrusted HTML injection.

### TR-4: Scope rendering change to the Model 3 success element only
Only the existing `comparison-model3-response` element shall change from plain text binding to HTML rendering.

**Acceptance Criteria**
- No other component or panel element is altered for Markdown rendering.
- `generatedPromptText` (toggle region) remains rendered as plain text via `<pre>`.

### TR-5: Update automated tests to assert HTML structure
Tests that currently assert plain-text content for the Model 3 response panel shall be updated or extended to assert the presence of rendered HTML elements.

**Acceptance Criteria**
- Unit tests confirm that Markdown in the response produces expected HTML elements inside `comparison-model3-response`.
- Tests confirm plain-text-only responses still render without errors.
- E2E tests confirm response is visible and readable; no DOM assertion breaks on tag boundaries.

### TR-6: Pass quality gates
All in-scope changes shall pass repository checks.

**Acceptance Criteria**
- `npm run typecheck` passes.
- `npm test` passes.
- `npm run lint` passes.

## Security Requirements

### SR-1: Prevent XSS from untrusted model output
Rendered HTML shall be sanitized so that scripts, inline event handlers, and dangerous protocols cannot execute in the user's browser.

**Acceptance Criteria**
- `<script>` tags in model output are stripped before DOM injection.
- `onerror`, `onclick`, and similar event attributes are stripped.
- `javascript:` URLs in rendered links are stripped or blocked.
- Implementation is traceable to TR-3 sanitization step.

## Accessibility Requirements

### AR-1: Rendered HTML shall preserve readable, structured semantics
Heading and list structures produced by Markdown rendering shall remain accessible to assistive technologies.

**Acceptance Criteria**
- Rendered headings are real heading elements, reachable by screen reader heading navigation.
- Rendered lists are real list elements.
- `data-testid="comparison-model3-response"` region retains a stable role boundary to keep it locatable by tests and assistive technology.

### AR-2: Prose styling shall maintain sufficient color contrast
Any Tailwind typography styles applied to the rendered HTML region shall meet WCAG 2.2 AA contrast ratios.

**Acceptance Criteria**
- Default text color in rendered region maintains at least 4.5:1 contrast against its background.

## Performance Requirements

### PR-1: No synchronous blocking of the render path
Markdown conversion shall complete synchronously (or be fast enough to complete within normal Vue reactivity cycle without perceptible delay for typical model response sizes).

**Acceptance Criteria**
- Markdown rendering is performed in a computed property or equivalent reactive context.
- No additional async wait is introduced into the component lifecycle for Markdown conversion.

## Out of Scope / Non-Goals

- Markdown rendering for Model 1 or Model 2 response panels.
- Syntax highlighting for code blocks.
- Supporting raw HTML passthrough from model output beyond what an approved sanitized library provides.
- Changes to the prompt-preview toggle content or its rendering.
