# Design

## Overview

This change removes the non-actionable `Comparison prompt for Model 3` button from the UI by conditionally rendering it only when the existing enablement predicate is true. The toggle interaction, generated prompt preview region, and comparison state rendering remain unchanged.

## Architecture

### Affected files
- `app/components/ComparisonOutputPanel.vue`
  - Update button rendering condition so the toggle is rendered only in actionable states.
- `tests/unit/app.ui.test.ts`
  - Update/add assertions for presence-in-success and absence-in-non-actionable states.
- `tests/e2e/app.spec.ts` (if needed)
  - Keep happy-path visibility assertion; add/adjust assertions for non-actionable-state absence if existing coverage expects disabled visibility.

### Behavior impact
- The button is hidden (not rendered) when `isPromptToggleDisabled` would have been true.
- The button appears when `isPromptToggleDisabled` is false and continues to function identically.

## Component Design

### Current state
`ComparisonOutputPanel.vue` computes `isPromptToggleDisabled` and always renders the button with `:disabled="isPromptToggleDisabled"`.

### Proposed state
Keep `isPromptToggleDisabled` as the source of truth for actionability and add a visibility condition:
- Render button only when `!isPromptToggleDisabled`.
- Retain button semantics and click handler unchanged.

Example shape:

```vue
<button
  v-if="!isPromptToggleDisabled"
  type="button"
  data-testid="comparison-model3-prompt-toggle"
  :aria-expanded="isPromptVisible"
  :aria-controls="promptRegionId"
  @click="togglePromptVisibility"
>
  Comparison prompt for Model 3
</button>
```

Optional cleanup:
- With this visibility condition, `:disabled` may be removed because rendered instances are always actionable.

## Accessibility

- Removing a non-actionable disabled control improves keyboard navigation by eliminating an inert focus target.
- When rendered, the button keeps native semantics and `aria-expanded`/`aria-controls` behavior.
- Prompt region association remains unchanged.

## Security

- No data-flow or rendering-risk changes.
- No new input handling or HTML rendering behavior is introduced.

## Performance

- Conditional rendering of one button is negligible and does not alter request flow.
- No new async work is added.

## Testing Strategy

### Unit
- Keep success-path test that expects toggle presence and interaction.
- Add/adjust test assertions to verify toggle absence in non-actionable states (for example loading/error/non-success conditions).

### E2E
- Keep happy-path assertion that toggle becomes visible when comparison succeeds.
- Ensure no test expects a disabled-but-visible toggle in non-actionable states.

## Traceability

- **FR-1 / TR-1:** Button visibility driven by `isPromptToggleDisabled` inversion.
- **FR-2 / AR-1:** Existing toggle semantics and behavior preserved when visible.
- **FR-3 / TR-2:** Loading/success/error flows unchanged outside button visibility.
- **TR-3:** Unit/E2E assertions updated for visibility semantics.
- **TR-4:** Full quality-gate execution after implementation.
