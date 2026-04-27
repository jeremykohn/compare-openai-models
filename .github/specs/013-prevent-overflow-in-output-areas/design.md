# Technical Design: Prevent Overflow in Output Areas

**Source:** `.github/specs/013-prevent-overflow-in-output-areas/requirements.md`
**Spec folder:** `.github/specs/013-prevent-overflow-in-output-areas/`

---

## Overview

This update is a presentation-layer refinement that prevents text and nested content from overflowing output-related UI regions. The goal is to make outer output panels and inner error areas wrap content safely, stay width-constrained by layout, and grow vertically as needed without changing request, response, or error-handling behavior.

Primary outcomes:
- Long headings, response text, and error details wrap instead of overflowing horizontally.
- Nested error content remains contained inside its parent output panel.
- Output panels and error regions size vertically to fit content.
- Left and right output panels may have different heights based on their own content.
- Existing dual-model behavior, error sanitization, and accessibility semantics remain intact.

Scope is limited to UI/component styling and related automated coverage.

---

## Architecture

### Current State
The current page composes output behavior through these main surfaces:
- `app/app.vue`
  - renders the two-column output region via `ModelOutputPanel`.
- `app/components/ModelOutputPanel.vue`
  - renders outer output panel container,
  - renders heading,
  - renders loading state,
  - renders response text,
  - renders nested `UiErrorAlert` for error state.
- `app/components/UiErrorAlert.vue`
  - renders nested error container,
  - renders error message text,
  - renders `<details>` / `<summary>` toggle,
  - renders structured error metadata with `dl`, `dt`, and `dd`.

### Target State
- Outer output panels become overflow-safe containers that constrain width and allow content-driven height.
- Response text and headings gain explicit wrapping/min-width behavior so long content can shrink and wrap inside the panel.
- Nested error alert becomes overflow-safe within the panel.
- Structured error detail rows are adjusted so long values wrap inside available width instead of pushing the grid wider than the panel.
- No server, composable, or request-state architecture changes are required.

### Affected Files
Expected implementation surfaces:
- `app/components/ModelOutputPanel.vue`
- `app/components/UiErrorAlert.vue`
- `app/app.vue` (only if parent grid/container classes require small containment support adjustments)
- Related tests:
  - `tests/unit/app.ui.test.ts`
  - `tests/unit/app.a11y.test.ts`
  - `tests/e2e/app.spec.ts`
  - `tests/e2e/accessibility.spec.ts` (if needed)

### Design Strategy
1. Harden outer panel layout behavior in `ModelOutputPanel.vue`.
2. Harden nested error layout behavior in `UiErrorAlert.vue`.
3. Ensure parent grid/container rules in `app/app.vue` do not reintroduce horizontal overflow.
4. Add automated regression coverage with intentionally long content.

---

## Interfaces

### UI Component Interfaces
No prop, emit, or API contract changes are required.

#### `ModelOutputPanel.vue`
Current public interface remains unchanged:
- `label`
- `heading`
- `status`
- `data`
- `error`

Changes are limited to presentation classes/structure so the component:
- wraps heading text,
- wraps response body text,
- constrains nested content width,
- grows vertically with content.

#### `UiErrorAlert.vue`
Current public interface remains unchanged:
- `error`
- `showRetry`
- `retryLabel`
- `detailsToggleTestId`
- `retryButtonTestId`

Changes are limited to layout classes/markup behavior so:
- the alert container stays within parent width,
- summary text wraps safely,
- `dd` metadata values wrap inside their grid column,
- expanded details remain contained.

### CSS / Layout Interface
The implementation should rely on existing utility-class patterns rather than introducing a new styling system.

Expected utility concepts:
- width containment on outer and inner containers,
- `min-w-0` on grid/flex children that need to shrink,
- line wrapping / word-breaking for long content,
- no fixed heights for output or nested error regions,
- preservation of content-driven vertical sizing.

---

## Data

### State Model
No data model changes are required.

### Data Flow
No request, response, or error normalization flow changes are required.

Existing flow remains:
1. `app/app.vue` passes per-model state into `ModelOutputPanel`.
2. `ModelOutputPanel` renders success/loading/error branch.
3. Error branch renders `UiErrorAlert` with normalized `error` object.
4. Overflow-safe styling must apply equally whether content is a heading, response body, or structured error metadata.

---

## Validation/Error Handling

### Validation
- Prompt validation behavior remains unchanged.
- Model selection and submission behavior remain unchanged.

### Error Handling
- Existing normalized/sanitized `NormalizedUiError` behavior remains unchanged.
- Overflow-safe layout must handle:
  - long `error.message`,
  - long `error.type`,
  - long `error.code`,
  - long `error.param`,
  - long `error.details`.

### Layout Handling Rules
- Outer panel must never widen because nested error text is long.
- Expanded `<details>` content must remain contained by the alert container and the outer panel.
- Long response strings or headings must wrap and increase height rather than width.
- Left and right panels must be allowed to resolve to different heights naturally.

---

## Security

- Preserve existing sanitized error rendering; no raw error objects or secrets are newly exposed.
- Do not introduce `v-html` or any unsafe HTML rendering to solve overflow.
- Keep all content rendered as plain text through Vue interpolation.
- Do not alter error normalization or redaction logic in this change.

Security-sensitive invariants:
- Existing redacted details remain redacted.
- Styling/layout changes do not bypass sanitization or expose hidden raw values.

---

## Accessibility

- Preserve heading semantics in `ModelOutputPanel.vue`.
- Preserve `role="alert"` behavior in `UiErrorAlert.vue`.
- Preserve keyboard operability of `<details>` / `<summary>` and retry button.
- Wrapped content must remain readable at zoom and under narrower widths.
- Do not introduce horizontal scrolling as the primary reading mode for core output/error content.

WCAG-aligned considerations in scope:
- readable reflow under constrained widths,
- preserved name/role/value semantics,
- no regression in current accessible error interactions.

---

## Performance

- No new network requests.
- No JS-driven measurement or resize observers are required.
- Prefer CSS/layout-only fixes for wrapping and containment.
- Avoid polling/timer-based layout work.

---

## Testing

### Unit Testing
Update `tests/unit/app.ui.test.ts` to include long-content cases for:
- long output heading text,
- long response text,
- long error details.

Unit assertions should verify at minimum:
- relevant elements include overflow-safe class behavior,
- output/error branches still render correctly with long content fixtures.

Update `tests/unit/app.a11y.test.ts` as needed to confirm no accessibility regressions in error/details rendering.

### E2E Testing
Update `tests/e2e/app.spec.ts` to include scenarios with long response/error content and verify:
- output remains visible,
- details can expand,
- content stays in the expected panel.

Update `tests/e2e/accessibility.spec.ts` only if current a11y flows need alignment with long-content fixtures.

### Quality Gates
The completed change should pass:
- `npm run typecheck`
- `npm test`
- `npm run lint`

---

## Assumptions and Constraints

- Existing current components remain the implementation surfaces.
- Minimal, targeted utility-class changes are preferred over markup-heavy redesign.
- Equal-height columns are not required.
- Wrapping is the primary strategy; truncation is not the default solution.
- If a specific edge case still needs a fallback break strategy, it should be applied narrowly to problematic text containers only.

---

## Open Questions

None blocking for this design.

---

## Traceability

| Requirement ID | Design Section | Notes |
|----------------|----------------|-------|
| FR-1 | Overview; Architecture; Interfaces; Validation/Error Handling; Testing | Covers wrapping for headings, response text, and error metadata. |
| FR-2 | Overview; Architecture; Validation/Error Handling; Testing | Keeps nested error content contained within outer panel. |
| FR-3 | Overview; Architecture; Interfaces | Uses content-driven height with no fixed vertical sizing. |
| FR-4 | Overview; Interfaces; Validation/Error Handling | Prevents horizontal expansion through width-constrained layout behavior. |
| FR-5 | Overview; Validation/Error Handling; Assumptions and Constraints | Preserves independent panel heights. |
| FR-6 | Overview; Data; Validation/Error Handling; Security | Preserves dual-output behavior and existing logic. |
| TR-1 | Architecture; Data | Limits scope to UI styling/layout surfaces. |
| TR-2 | Architecture; Interfaces | Applies consistent overflow-safe styling across outer/inner regions. |
| TR-3 | Validation/Error Handling; Security | Handles structured error metadata safely in layout. |
| TR-4 | Testing | Adds targeted long-content regression coverage. |
| TR-5 | Testing | Keeps project quality gates as final validation. |
| SR-1 | Security; Validation/Error Handling | Preserves sanitization and avoids exposing sensitive content. |
| SR-2 | Security | Avoids unsafe HTML rendering. |
| AR-1 | Accessibility; Interfaces | Preserves readable wrapping behavior at varied lengths. |
| AR-2 | Accessibility; Validation/Error Handling | Keeps error details semantics and operability intact. |
| AR-3 | Accessibility | Preserves heading/status/error associations. |
| PR-1 | Performance | Uses CSS/layout-first approach with no heavy runtime logic. |
| PR-2 | Performance; Data | Introduces no extra network work. |
