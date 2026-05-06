# Description

## General Description

When displaying a successful response from Model 3, which is currently in Markdown and rendered as plain text, render the Markdown as HTML with headings and other elements. This may require adding a library to render Markdown or convert to HTML, if such a library is not already installed.

## Specific Description

### Problem Statement

Model 3 success output is currently shown as plain text, even when the response contains Markdown structure (for example headings, lists, emphasis, and code blocks). This makes comparison output harder to scan and reduces readability because users cannot benefit from semantic formatting.

### Intended Outcome

After this update:
- Model 3 successful response content is rendered from Markdown into HTML in the comparison output panel.
- Common Markdown elements (such as headings, paragraphs, lists, emphasis, links, and code blocks) display with expected structure.
- Existing loading and error states for Model 3 remain unchanged.

### Scope Boundaries

In scope:
- Updating Model 3 success-state rendering path to transform Markdown response text into HTML for display.
- Introducing and wiring a Markdown rendering/conversion utility or library if needed.
- Applying safe HTML sanitization/escaping safeguards appropriate for untrusted model output before rendering.
- Updating tests that currently assert plain-text-only behavior for the Model 3 success panel.

Out of scope:
- Any changes to Model 1 or Model 2 response rendering behavior.
- Changes to model query orchestration, request payloads, or API contracts.
- Visual redesign of the surrounding panel layout unrelated to Markdown rendering.

### Key Behaviors and Expected User-Visible Results

- After a successful Model 3 response, users see formatted content (for example visible headings and lists) rather than a single plain-text block.
- Markdown links, if rendered, appear as links in the output.
- Code blocks, if present, render as code sections with preserved line breaks.
- Comparison panel heading, toggle behavior, and status indicators continue to behave as they do today.

### Assumptions, Constraints, and Explicit Exclusions

Assumptions:
- Model 3 responses may include valid Markdown frequently enough to justify structured rendering.
- The current success panel has a single rendering point where Markdown-to-HTML integration can be localized.

Constraints:
- Preserve accessibility semantics and readable structure in rendered output.
- Prevent XSS by avoiding direct unsafe HTML injection from untrusted content.
- Keep the change focused on Model 3 success rendering and directly impacted tests/docs.

Explicit exclusions:
- No syntax-highlighting feature work beyond baseline code-block rendering.
- No support for arbitrary raw HTML passthrough from model output unless explicitly sanitized/allowed.
- No changes to prompt templates or prompt preview content.

## Non-Goals

- Converting all app text rendering to Markdown.
- Introducing full rich-text editor capabilities.
- Refactoring unrelated output panel components.
