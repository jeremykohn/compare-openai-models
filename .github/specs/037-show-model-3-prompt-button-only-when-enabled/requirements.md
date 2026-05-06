# Requirements

## Functional Requirements

### FR-1: Show Model 3 prompt toggle only when actionable
The UI shall display the `Comparison prompt for Model 3` button only when it is enabled/actionable.

**Acceptance Criteria**
- When the current enablement predicate evaluates to true, the button is visible.
- When the current enablement predicate evaluates to false, the button is not rendered.
- The button is no longer shown in a disabled visual state.

### FR-2: Preserve prompt-toggle behavior when visible
When the button is visible, it shall retain existing expand/collapse behavior for prompt preview.

**Acceptance Criteria**
- Clicking the visible button toggles prompt preview visibility as before.
- `aria-expanded` values continue to reflect toggle state (`false` when collapsed, `true` when expanded).
- Prompt preview content and label remain unchanged.

### FR-3: Keep comparison-state behavior unchanged
The update shall not alter model-query state handling for Model 3.

**Acceptance Criteria**
- Model 3 loading, success, and error rendering behavior remains unchanged, except for button visibility in non-actionable states.
- Existing comparison heading and message copy remains unchanged.

## Technical Requirements

### TR-1: Reuse existing enablement predicate
Implementation shall rely on existing button enablement logic to decide visibility.

**Acceptance Criteria**
- No new business rules are introduced for actionability.
- Visibility condition is directly traceable to the existing enablement predicate.

### TR-2: Limit change scope to comparison panel and tests
Changes shall be localized to the comparison output panel and directly affected tests.

**Acceptance Criteria**
- `app/components/ComparisonOutputPanel.vue` is updated for conditional rendering.
- Only tests asserting prompt-toggle presence/disabled behavior are updated.
- No unrelated component/composable behavior changes are introduced.

### TR-3: Update automated tests for visibility semantics
Automated tests shall assert presence only when actionable and absence when non-actionable.

**Acceptance Criteria**
- Unit tests verify the toggle exists in success/actionable state.
- Unit tests verify the toggle is absent in non-actionable states.
- E2E tests continue to pass with updated visibility expectations.

### TR-4: Pass quality gates
All in-scope changes shall pass repository checks.

**Acceptance Criteria**
- `npm run typecheck` passes.
- `npm test` passes.
- `npm run lint` passes.

## Security Requirements

### SR-1: No security behavior change
This UI visibility update shall not introduce new data handling or injection paths.

**Acceptance Criteria**
- No additional user input handling is introduced.
- No new `v-html` usage or HTML injection paths are introduced.

## Accessibility Requirements

### AR-1: Preserve accessible semantics when control is present
When rendered, the toggle shall maintain current button semantics and ARIA state behavior.

**Acceptance Criteria**
- The control remains a native `<button>`.
- `aria-expanded` and `aria-controls` continue to be valid when visible.

### AR-2: Remove non-actionable control from focus order
When the control is not actionable, it shall not be keyboard-focusable because it is not rendered.

**Acceptance Criteria**
- In non-actionable states, keyboard users do not tab to a disabled toggle.
- Focus order remains predictable and free of dead-end controls.

## Performance Requirements

### PR-1: No measurable performance regression
Conditional rendering of the button shall not introduce additional network calls or expensive computation.

**Acceptance Criteria**
- No new async operations are introduced.
- Existing reactive flow remains functionally equivalent.

## Out of Scope / Non-Goals

- Changes to prompt-generation logic.
- Changes to Model 1/Model 2/Model 3 request orchestration.
- Changes to prompt preview text, formatting, or templates.
- Visual redesign outside the button visibility condition.
