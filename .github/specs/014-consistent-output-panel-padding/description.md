# Description: Consistent Output Panel Padding

## General Description

Adjust the inner margin so it's the same for all output areas. Currently the inner margin is narrower for error output areas, which is visually noticeable.

## Specific Description

### Problem Statement

Each output panel in `app/components/ModelOutputPanel.vue` is rendered as an `<article>` element. The element has a base padding of `p-4` (1rem / 16px on all sides). The dynamic class applied for the success state adds `p-6` (1.5rem / 24px), which overrides the base padding and makes successful-response panels visibly larger on the inside than error panels. Error panels keep only the base `p-4`, making the difference noticeable when a user sees both states or switches between them.

### Intended Outcome

All output panel states — loading, success, and error — should use the same inner padding so the panels look visually consistent regardless of their current state.

### Scope Boundaries

- **In scope:**
  - Adjusting padding classes on the `<article>` element in `app/components/ModelOutputPanel.vue` so all states use the same value.
  - Updating any tests that assert padding-related classes if they are affected by the change.
- **Out of scope:**
  - Changing any other visual properties of the output panels (color, border, shadow, border-radius, gap).
  - Changing padding or layout in `UiErrorAlert.vue` or other nested components.
  - Changing the layout of the two-column output grid in `app/app.vue`.
  - Modifying request/response logic, error normalization, or composables.

### Key Behaviors and Expected User-Visible Results

- A panel in the loading state has the same inner padding as a panel in the success state and a panel in the error state.
- The visual padding change is not dependent on which model responded or whether a response is a success or error.
- No other visual property of the panels changes as a result of this fix.

### Assumptions and Constraints

- The fix should be minimal: adjust only the padding value(s) responsible for the inconsistency.
- The chosen consistent padding value should match or be compatible with the existing design intent; choosing `p-6` to match success is equally valid to choosing `p-4`, so long as the same value is used for all states.
- Existing accessibility semantics (heading structure, `role="alert"`, `aria-live`) must remain intact.

## Non-Goals

- Redesigning the visual appearance of the output panels beyond padding consistency.
- Normalizing padding across unrelated UI sections outside of `ModelOutputPanel.vue`.
- Introducing CSS variables, design tokens, or a new styling system.
