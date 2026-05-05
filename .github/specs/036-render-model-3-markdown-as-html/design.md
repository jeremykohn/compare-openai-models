# Design

## Overview

Model 3 response text contains Markdown. Today it is displayed as a plain-text string in a `<p>` with `whitespace-pre-wrap`. This spec replaces that binding with HTML produced by a Markdown-to-HTML library, sanitized before DOM injection via `v-html`. Model 1/Model 2 panels and all other output paths are unchanged.

---

## Architecture

### Affected Files

| File | Change |
|---|---|
| `package.json` | Add production dependency for Markdown rendering (e.g. `marked`) |
| `app/utils/render-markdown.ts` | New utility — wraps library call + sanitization; returns safe HTML string |
| `app/components/ComparisonOutputPanel.vue` | Replace `{{ model3Data }}` plain-text binding with `v-html="renderedModel3Html"` computed value; swap container from `<p>` to `<div>` |
| `tailwind.config.ts` | Enable `@tailwindcss/typography` plugin (or scope prose styles manually) so rendered HTML headings/lists are legible |
| `tests/unit/app.ui.test.ts` | Update assertions that check `.text()` equality on `comparison-model3-response` to account for HTML structure |
| `tests/e2e/app.spec.ts` | Update/extend assertions on `comparison-model3-response` to confirm rendered elements |

---

## Library Choice

**`marked`** (npm: `marked`) is chosen because:
- Actively maintained, well-documented, widely used.
- Synchronous conversion API — no async needed for typical response sizes.
- Exposes configurable renderer options.

For sanitization, **`DOMPurify`** (npm: `dompurify`, types: `@types/dompurify`) is chosen because:
- Purpose-built for DOM sanitization; strips scripts, event handlers, and dangerous protocols.
- Client-only (DOM-based), which is appropriate since rendering occurs in the browser.
- Established OWASP recommendation for `v-html` guard patterns.

If a single-package option is preferred, **`marked` + DOMPurify** remains the recommended pairing. Both are small and production-safe.

> **Note:** During implementation, run `npm audit` after install to verify no known vulnerabilities in selected versions.

---

## Rendering Flow

```
model3Data (raw Markdown string from API)
  → renderMarkdown(model3Data)         ← new utility in app/utils/render-markdown.ts
    → marked.parse(input)              ← produces HTML string
    → DOMPurify.sanitize(html)         ← strips XSS vectors
    → returns safe HTML string
  → renderedModel3Html computed ref    ← in ComparisonOutputPanel.vue
  → <div v-html="renderedModel3Html">  ← binds to DOM
```

---

## Component Change

### Before (ComparisonOutputPanel.vue, success branch)

```html
<p
  v-else-if="model3Status === 'success' && model3Data"
  data-testid="comparison-model3-response"
  class="min-w-0 break-words whitespace-pre-wrap text-sm text-slate-900"
>
  {{ model3Data }}
</p>
```

### After

```html
<div
  v-else-if="model3Status === 'success' && model3Data"
  data-testid="comparison-model3-response"
  class="prose prose-sm max-w-none min-w-0 break-words text-slate-900"
  v-html="renderedModel3Html"
/>
```

The `prose` / `prose-sm` classes come from `@tailwindcss/typography`. They apply readable body and heading styles to arbitrary HTML content inside the container.

The computed property in `<script setup>`:

```typescript
import { computed } from "vue";
import { renderMarkdown } from "../utils/render-markdown";

const renderedModel3Html = computed(() =>
  props.model3Status === "success" && props.model3Data
    ? renderMarkdown(props.model3Data)
    : "",
);
```

---

## Utility: `app/utils/render-markdown.ts`

```typescript
import { marked } from "marked";
import DOMPurify from "dompurify";

export function renderMarkdown(input: string): string {
  const html = marked.parse(input) as string;
  return DOMPurify.sanitize(html);
}
```

The `as string` cast is safe: `marked.parse` returns a `string` when called synchronously with default options. TypeScript's overload resolution may infer a union; the cast makes the return type explicit.

---

## Tailwind Typography

Add `@tailwindcss/typography` as a dev dependency and register it in `tailwind.config.ts`:

```typescript
import typography from "@tailwindcss/typography";

export default {
  // ...
  plugins: [typography],
} satisfies Config;
```

`prose-sm` keeps font sizes consistent with the rest of the panel UI. `max-w-none` overrides the plugin's default max-width cap so the rendered content fills the panel container.

---

## Accessibility

- Rendered `<h1>`–`<h6>` elements are real heading elements and are reachable via screen reader heading navigation.
- Rendered lists are real `<ul>`/`<ol>` elements.
- The `data-testid="comparison-model3-response"` attribute stays on the wrapping `<div>`, maintaining stable locator targets for tests.
- `DOMPurify` removes any `aria-*` spoofing attributes injected by model output.

---

## Security

- `DOMPurify.sanitize` is applied after every `marked.parse` call; raw HTML from model output never reaches the DOM.
- `javascript:` protocol in links is stripped by DOMPurify defaults.
- `<script>` and event-handler attributes (`onerror`, `onclick`, etc.) are stripped.
- The `renderMarkdown` utility is the single gateway — no other `v-html` binding is added in this spec.

---

## Testing Strategy

### Unit (`tests/unit/app.ui.test.ts`)

- Existing assertion `.text()` equality on `comparison-model3-response` continues to work for plain-text assertions because `wrapper.text()` strips HTML tags.
- Add a focused test that mounts `ComparisonOutputPanel` directly with Markdown content and asserts specific HTML elements are present (e.g., `wrapper.find('h2')`, `wrapper.find('ul')`).
- The DOM in Vitest/happy-dom does not have `DOMPurify` window globals; DOMPurify falls back to no-op sanitization in non-browser environments. Verify and document this in the test setup.

### E2E (`tests/e2e/app.spec.ts`)

- Existing `.toContainText()` assertions on `comparison-model3-response` continue to work; Playwright's `toContainText` matches visible text content regardless of HTML structure.
- Add (or extend) an assertion that a Markdown heading from mock response text is rendered as a visible heading element in the panel.

---

## Traceability

| Requirement | Design Element |
|---|---|
| FR-1 | `marked` + `renderMarkdown` utility + `v-html` binding |
| FR-2 | Loading/error branches in `ComparisonOutputPanel.vue` untouched |
| FR-3 | `ModelOutputPanel.vue` not modified |
| TR-1 | `app/utils/render-markdown.ts` |
| TR-2 | `marked` library added to `dependencies` |
| TR-3 / SR-1 | `DOMPurify.sanitize` in `renderMarkdown` |
| TR-4 | Only `comparison-model3-response` binding changed |
| TR-5 / AR-1 | Unit test for HTML elements; E2E text assertions remain valid |
| AR-2 | `prose prose-sm` via `@tailwindcss/typography` |
| PR-1 | Synchronous `marked.parse` inside a computed property |
