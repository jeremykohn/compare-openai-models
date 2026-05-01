# Design

## Overview

The third-panel prompt toggle will continue to exist, but its expanded content source changes from the dynamically generated Model 3 request prompt to a static template file (`comparison-prompt.md`). Runtime Model 3 query generation remains unchanged.

## Architecture

### Current
- `useComparisonUiState` computes `generatedModel3Prompt` (runtime assembled prompt used for Model 3 requests).
- `app.vue` passes `generatedModel3Prompt` into `ComparisonOutputPanel` as `generated-prompt-text`.
- `ComparisonOutputPanel` renders this value inside the expanded `<pre>` block.

### Proposed
- Keep `generatedModel3Prompt` unchanged for request payload usage.
- Introduce a separate display-source value sourced from `server/assets/prompt-templates/comparison-prompt.md?raw`.
- Pass this display-source value to `ComparisonOutputPanel` for toggle rendering.
- Preserve existing toggle interactions, visibility reset behavior, and aria wiring.

## Interfaces

### `useComparisonUiState`
- **No breaking changes** to existing return values.
- Add one new return field for prompt-preview display text (template-file text).

### `app.vue`
- Continue using `generatedModel3Prompt` for `queryModel3(...)` payload.
- Pass new template-text field to `ComparisonOutputPanel` via existing `generated-prompt-text` prop (or an equivalent renamed prop if chosen during implementation).

### `ComparisonOutputPanel.vue`
- No behavior change in toggle mechanics.
- Expanded `<pre>` displays provided template-file text.

## Data Flow

1. Import `comparison-prompt.md?raw` in `useComparisonUiState`.
2. Expose template-text value in composable return object.
3. Bind that value in `app.vue` to the prompt-preview prop on `ComparisonOutputPanel`.
4. Keep runtime-generated prompt (`generatedModel3Prompt`) exclusively for Model 3 request execution path.

## Validation and Error Handling

- Existing null guards for runtime prompt generation remain unchanged.
- Template-display text is static file content and does not require interpolation.

## Security

- Runtime request prompt still passes through `buildSafeComparisonPrompt`.
- Displaying static template text removes exposure of submission-specific runtime prompt payload in UI.

## Accessibility

- Preserve existing button toggle semantics and `aria-expanded`/`aria-controls` linkage.
- Preserve existing focus order and keyboard operability.

## Performance

- Adds only static raw-template import for display text; no network calls added.
- No request-count change in model query flow.

## Testing Strategy

- Update unit/e2e assertions that currently check runtime prompt content (`UNTRUSTED` markers, user prompt echo, model outputs) in toggle preview.
- Assert preview shows known text from `comparison-prompt.md` instead.
- Run `typecheck`, `test`, and `lint` quality gates.

## Traceability

- **FR-1/TR-1/TR-3**: Toggle preview source switched to `comparison-prompt.md` and tests updated.
- **FR-2/SR-1**: Runtime request path (`generatedModel3Prompt` + `queryModel3`) unchanged.
- **FR-3/TR-2**: Third-panel lifecycle and accessibility behavior preserved.
- **TR-4**: Full quality gates executed.
