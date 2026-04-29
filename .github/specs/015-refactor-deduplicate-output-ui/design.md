# Technical Design: Refactor and Deduplicate Output-Related UI Code

**Source:** `.github/specs/015-refactor-deduplicate-output-ui/requirements.md`
**Spec folder:** `.github/specs/015-refactor-deduplicate-output-ui/`

---

## Overview

This update refactors output-related UI to remove repeated markup and improve maintainability while preserving behavior parity. The implementation is intentionally narrow and focuses only on output composition and output subparts.

Primary outcomes:
- Deduplicate app-level output panel rendering.
- Deduplicate repeated error-details row markup.
- Preserve loading/success/error behavior, accessibility semantics, and visual parity.
- Keep request/response logic and data contracts unchanged.

---

## Architecture

### Current State
- `app/app.vue` renders two `ModelOutputPanel` blocks with near-identical structure and only prop differences.
- `app/components/UiErrorAlert.vue` repeats highly similar `dt`/`dd` row markup for each optional error field.

### Target State
1. Replace duplicate panel blocks in `app/app.vue` with data-driven panel rendering (`v-for`) from a computed list.
2. Introduce `UiErrorDetailRow.vue` to render one details-row pair (`dt` + `dd`) with shared classes.
3. In `UiErrorAlert.vue`, build a computed list of present detail rows and render with `UiErrorDetailRow` via `v-for`.

### Affected Files
- `app/app.vue`
- `app/components/UiErrorAlert.vue`
- `app/components/UiErrorDetailRow.vue` (new)
- `tests/unit/ui-error-alert.test.ts`
- `tests/unit/ui-error-detail-row.test.ts` (new)
- `tests/unit/app.ui.test.ts` (only if selector updates are required)

No changes expected in:
- server routes
- composables
- API types/contracts

---

## Interfaces

### `UiErrorDetailRow.vue` (new)
Props:
- `label: string`
- `value: string | number`

Responsibilities:
- Render one row wrapper with existing grid classes.
- Render `<dt>` and `<dd>` with current typography/wrapping classes.

### `UiErrorAlert.vue`
Public interface remains unchanged:
- `error`, `showRetry`, `retryLabel`, `detailsToggleTestId`, `retryButtonTestId`
- `retry` emit

Internal change:
- Replace repeated hardcoded field sections with a computed row list and `UiErrorDetailRow` rendering.

### `app/app.vue`
Public behavior remains unchanged.
Internal change:
- Replace two repeated `ModelOutputPanel` invocations with a computed `outputPanels` array and `v-for` rendering.

---

## Data

No API/data-model changes.

### New Local Derived Structures
- `app/app.vue`: `outputPanels` computed array containing label/heading/status/data/error for each side.
- `UiErrorAlert.vue`: `detailRows` computed array for present detail fields (`type`, `statusCode`, `code`, `param`, `details`).

---

## Validation / Error Handling

- Existing conditional rules remain unchanged.
- `UiErrorAlert` still shows rows only when values are present.
- Error details content remains sourced from the existing normalized error object.

---

## Security

- Preserve current sanitized error-display boundaries.
- Do not introduce unsafe rendering (`v-html`).
- No additional payload fields or data exposure changes.

---

## Accessibility

- Preserve `role="status"`/`aria-live` in loading state.
- Preserve `role="alert"` in error state.
- Preserve heading semantics in output panel.
- Preserve keyboard operability and semantics of `<details>/<summary>`.

---

## Performance

- No additional network requests.
- Render logic remains equivalent with minor local computed arrays.

---

## Testing

### Unit
- Add `tests/unit/ui-error-detail-row.test.ts` to verify row label/value rendering and classes.
- Update `tests/unit/ui-error-alert.test.ts` to ensure details rows still render conditionally as before.
- Keep/update `tests/unit/app.ui.test.ts` only if output panel selector assumptions change.

### Existing Suites
- Run `tests/unit/app.a11y.test.ts` to ensure semantic parity.
- Run existing app e2e suite to confirm output behavior remains unchanged.

### Quality Gates
- `npm run typecheck`
- `npm test`
- `npm run lint`

---

## Assumptions and Constraints

- Behavior parity is the source of truth.
- Refactor stays output-scoped and incremental.
- No broad component architecture redesign.

---

## Open Questions

None blocking.

---

## Traceability

| Requirement ID | Design Section | Notes |
|---|---|---|
| FR-1 | Overview; Validation / Error Handling; Testing | Behavior parity for loading/success/error retained. |
| FR-2 | Architecture; Interfaces | App-level output panel duplication removed via data-driven render. |
| FR-3 | Architecture; Interfaces | Error detail rows moved to reusable subcomponent. |
| FR-4 | Validation / Error Handling | Conditional row visibility preserved through computed list rules. |
| FR-5 | Testing | Existing tests preserved/updated with same behavioral assertions. |
| TR-1 | Architecture → Affected Files | Changes constrained to output-related UI files and tests. |
| TR-2 | Interfaces | New output-focused reusable subcomponent introduced. |
| TR-3 | Interfaces | Existing public interfaces preserved where possible. |
| TR-4 | Architecture; Interfaces | Styling parity preserved through class reuse. |
| TR-5 | Testing | New component unit coverage added; existing suites remain green. |
| TR-6 | Testing → Quality Gates | Typecheck/test/lint required. |
| SR-1 | Security | Existing sanitized error rendering path preserved. |
| SR-2 | Security | No unsafe HTML rendering introduced. |
| AR-1 | Accessibility | Output semantics preserved. |
| AR-2 | Accessibility | Details toggle behavior preserved. |
| PR-1 | Performance | Render dedup without network or architectural overhead. |
