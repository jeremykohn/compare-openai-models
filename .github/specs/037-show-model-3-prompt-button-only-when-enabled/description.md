# Description

## General Description

Currently the button `Comparison prompt for Model 3` is visible even when it is disabled. Update the app so that this button is displayed only when it is enabled.

## Specific Description

### Problem Statement

The UI currently renders the `Comparison prompt for Model 3` button in disabled states. This presents a control that users cannot activate and adds visual noise during states where prompt preview is not available.

### Intended Outcome

After this update:
- The `Comparison prompt for Model 3` button is rendered only when it is actionable (enabled).
- When conditions would previously disable the button, the button is not shown at all.
- Existing prompt-preview behavior remains unchanged when the button is shown.

### Scope Boundaries

In scope:
- Updating the comparison output panel logic so the `Comparison prompt for Model 3` button is conditionally displayed only in enabled states.
- Preserving current expand/collapse interaction when the button is visible.
- Updating tests that currently expect the button to be present-but-disabled.

Out of scope:
- Changes to how the generated prompt content is assembled.
- Changes to Model 3 loading, success, or error request behavior.
- Copy/text changes to button label or prompt content.

### Key Behaviors and Expected User-Visible Results

- Users see `Comparison prompt for Model 3` only when they can interact with it.
- In non-actionable states (for example before successful comparison output is available), the button is absent.
- When visible, the button continues to toggle prompt visibility and `aria-expanded` behavior as before.

### Assumptions, Constraints, and Explicit Exclusions

Assumptions:
- The current enabled/disabled predicate for the button already correctly represents actionability.
- Existing tests cover button visibility and prompt toggle behavior and can be updated in place.

Constraints:
- Keep the change minimal and localized to button rendering conditions and directly impacted tests.
- Preserve accessibility semantics for the toggle interaction when present.

Explicit exclusions:
- No new controls or alternate UI for previewing the prompt.
- No changes to prompt-template files or interpolation logic.
- No broader layout redesign.

## Non-Goals

- Refactoring unrelated comparison panel rendering paths.
- Altering API contracts or server routes.
- Introducing new state-management abstractions for this change.
