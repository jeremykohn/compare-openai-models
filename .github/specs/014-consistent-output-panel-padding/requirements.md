# Requirements: Consistent Output Panel Padding

**Source:** `.github/specs/014-consistent-output-panel-padding/description.md`
**Spec folder:** `.github/specs/014-consistent-output-panel-padding/`

---

## Functional Requirements

### FR-1: Apply Uniform Padding to All Output Panel States
- The `<article>` element in `app/components/ModelOutputPanel.vue` SHALL use the same padding value for the loading, success, and error states.
- **Acceptance Criteria:**
  - When two panels are visible side by side — one in the success state and one in the error state — their inner padding appears identical to visual inspection.
  - Switching a panel from loading to success to error does not change the perceived inner spacing.

### FR-2: Preserve All Other Panel Visual Properties
- The fix SHALL only affect inner padding. Border, background color, border-radius, box shadow, internal gap, and typography SHALL remain unchanged for all states.
- **Acceptance Criteria:**
  - Error panels retain their red border and red background.
  - Success panels retain their emerald border and emerald background.
  - Idle/loading panels retain their slate border and white background.
  - No visual regression is introduced for any state other than padding.

---

## Technical Requirements

### TR-1: Scope Change to `ModelOutputPanel.vue` Only
- The padding fix SHALL be implemented solely within `app/components/ModelOutputPanel.vue`.
- No changes SHALL be made to `UiErrorAlert.vue`, `app/app.vue`, composables, server routes, or any file outside `ModelOutputPanel.vue` (other than test files where assertions require updating).
- **Acceptance Criteria:**
  - A diff of the change shows modifications only in `app/components/ModelOutputPanel.vue` and any directly affected test files.

### TR-2: Consistent Padding via Static Base Class
- The consistent padding SHALL be expressed as a single static Tailwind utility class on the `<article>` element's base `class` attribute.
- The dynamic `:class` binding SHALL not include any padding utility for any state.
- **Acceptance Criteria:**
  - The `<article>` base `class` contains exactly one padding utility (e.g., `p-6`).
  - The `:class` conditional binding for the success state does not include a padding class.
  - No `p-{n}` or `px-{n}` / `py-{n}` utility appears inside any branch of the `:class` binding.

### TR-3: Chosen Padding Value
- The consistent padding value SHALL be `p-6` (1.5rem / 24px on all sides), matching the current success-state padding which represents the larger, more intentional value.
- **Acceptance Criteria:**
  - The `<article>` base class includes `p-6`.
  - Error and loading panels gain the same `p-6` inner spacing currently only present on success panels.

### TR-4: Update Test Assertions for Padding Classes
- Any unit or end-to-end test that currently asserts a specific padding class on the output panel `<article>` element SHALL be updated to reflect the new uniform padding value.
- **Acceptance Criteria:**
  - All existing tests pass after the change.
  - No test asserts the old inconsistent padding behavior.

### TR-5: Pass Project Quality Gates
- The completed update SHALL pass all repository quality checks.
- **Acceptance Criteria:**
  - `npm run typecheck` passes.
  - `npm test` passes.
  - `npm run lint` passes.

---

## Accessibility Requirements

### AR-1: Preserve Existing Semantic Structure
- The padding change SHALL not alter the heading hierarchy, landmark roles, ARIA attributes, or any other semantic markup in `ModelOutputPanel.vue`.
- **Acceptance Criteria:**
  - `<h2>` remains the heading element for the panel title.
  - `role="status"` / `aria-live` on the loading indicator remain intact.
  - `role="alert"` on the nested `UiErrorAlert` remains intact.
  - Existing accessibility unit and end-to-end tests continue to pass.

---

## Out of Scope / Non-Goals

- Changing any visual property of output panels other than padding.
- Changing padding or layout in `UiErrorAlert.vue` or nested components.
- Normalizing padding for any UI region outside `ModelOutputPanel.vue`.
- Introducing CSS variables, design tokens, or a new styling system.
- Changing request/response logic, error normalization, or composables.

---

## Assumptions and Constraints

- Tailwind CSS utility classes remain the styling mechanism; no custom CSS is introduced.
- `p-6` is chosen as the uniform value because it matches the current success-state padding, which is the more intentional of the two existing values.
- The `p-4` currently in the base class and the `p-6` in the success dynamic class represent an unintentional inconsistency, not a deliberate design choice.
- Existing test infrastructure (Vitest + Playwright) is available and stable.
