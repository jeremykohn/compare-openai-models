# Technical Design: Consistent Output Panel Padding

**Source:** `.github/specs/014-consistent-output-panel-padding/requirements.md`
**Spec folder:** `.github/specs/014-consistent-output-panel-padding/`

---

## Overview

This update is a single-file, single-line presentation fix. The `<article>` element in `app/components/ModelOutputPanel.vue` currently applies `p-4` as a base class and `p-6` inside the success branch of its dynamic `:class` binding. Because Tailwind processes both, the success state renders with `p-6` while error and loading states render with `p-4`, producing a visible inconsistency.

The fix moves all padding to the static base class at `p-6` and removes the `p-6` utility from the success branch of the dynamic `:class` binding. No other file, property, or behavior changes.

---

## Architecture

### Affected Files

- `app/components/ModelOutputPanel.vue` — padding class adjustment on `<article>`.
- `tests/unit/model-output-panel.test.ts` and/or `tests/unit/app.ui.test.ts` — update any assertions that check for `p-4` or `p-6` on the panel article element.

No changes are required in:
- `app/components/UiErrorAlert.vue`
- `app/app.vue`
- Server routes, composables, or type definitions
- End-to-end tests (unless they assert padding classes directly)

### Current State

```vue
<article
  class="grid min-w-0 max-w-full gap-3 rounded-2xl p-4 shadow-sm"
  :class="
    status === 'error'
      ? 'border border-red-200 bg-red-50'
      : status === 'success'
        ? 'border border-emerald-200 bg-emerald-50 p-6 text-emerald-900'
        : 'border border-slate-200 bg-white'
  "
>
```

- Base class: `p-4` (applied to all states)
- Success dynamic class: `p-6` (overrides `p-4` for success only)
- Error and loading dynamic classes: no padding override → keep `p-4`

### Target State

```vue
<article
  class="grid min-w-0 max-w-full gap-3 rounded-2xl p-6 shadow-sm"
  :class="
    status === 'error'
      ? 'border border-red-200 bg-red-50'
      : status === 'success'
        ? 'border border-emerald-200 bg-emerald-50 text-emerald-900'
        : 'border border-slate-200 bg-white'
  "
>
```

- Base class: `p-6` (applied uniformly to all states)
- No padding utility appears in any branch of the dynamic `:class` binding

---

## Interfaces

### UI Component Interface

`ModelOutputPanel.vue` public interface (props) is unchanged:
- `label`, `heading`, `status`, `data`, `error`

No new props, emits, slots, or events are introduced.

---

## Data

No data model, state, or data flow changes.

---

## Validation / Error Handling

No validation or error handling changes. Prompt validation, request lifecycle, and error normalization remain untouched.

---

## Security

No security-relevant changes. This update does not touch input handling, secrets, API calls, or error rendering content.

---

## Accessibility

The semantic structure of `ModelOutputPanel.vue` is preserved in full:
- `<h2>` heading element and its conditional text-color classes remain unchanged.
- `role="status"` / `aria-live` on the loading indicator remain unchanged.
- `UiErrorAlert` with `role="alert"` remains unchanged.

No ARIA attributes, landmark roles, or focus behavior are affected.

---

## Performance

No performance impact. A single Tailwind class change in one component file.

---

## Testing

### Unit Testing

Check `tests/unit/model-output-panel.test.ts` and `tests/unit/app.ui.test.ts` for any assertions referencing `p-4` or `p-6` on the output panel `<article>` element.

- If a test asserts `p-4` on the article: update it to assert `p-6`.
- If a test asserts `p-6` on the article for success only: update it to assert `p-6` regardless of state, or remove the state-conditional check.
- If no test asserts padding classes on the article: no test update is needed.

### End-to-End Testing

No E2E test changes are expected. Padding is a visual/CSS property that Playwright tests do not typically assert. If any E2E test does assert computed padding style, update it to the new uniform value.

### Quality Gates

- `npm run typecheck`
- `npm test`
- `npm run lint`

---

## Assumptions and Constraints

- `p-6` is the correct uniform value (matches existing success-state padding and the more intentional of the two values).
- No other Tailwind padding utilities (`px-*`, `py-*`, `pt-*`, etc.) appear on the `<article>` element; only `p-4` and `p-6` are involved.
- This is a minimal, targeted fix with no dependencies on other in-flight changes.

---

## Open Questions

None blocking for this design.

---

## Traceability

| Requirement ID | Design Section | Notes |
|---|---|---|
| FR-1 | Target State; Testing | Uniform padding achieved by moving `p-6` to base class and removing it from dynamic binding. |
| FR-2 | Target State; Architecture | Only the `p-4` → `p-6` base class change is made; all other class strings are preserved. |
| TR-1 | Architecture | Change is limited to `ModelOutputPanel.vue` and affected tests. |
| TR-2 | Target State | `p-6` in base class; no padding utility in `:class` branches. |
| TR-3 | Target State; Assumptions and Constraints | `p-6` chosen as the uniform value. |
| TR-4 | Testing | Unit test assertions updated if they reference `p-4` or `p-6` on the article. |
| TR-5 | Testing | Quality gates listed. |
| AR-1 | Accessibility | Semantic markup explicitly unchanged; confirmed in affected files section. |
