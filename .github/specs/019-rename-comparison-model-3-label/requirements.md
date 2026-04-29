# Requirements

## Functional Requirements

### FR-1 Third dropdown label text
The application must display the text `Model 3 for comparing responses` as the visible label for the dropdown currently labeled `Model for comparing outputs`.

**Acceptance Criteria**
- The third comparison-model dropdown renders the exact visible label `Model 3 for comparing responses`.
- The previous visible label text `Model for comparing outputs` is no longer used for that control in the active comparison UI.

### FR-2 Accessible naming alignment
The application must ensure the third comparison-model dropdown exposes an accessible name that matches or includes the visible label `Model 3 for comparing responses`.

**Acceptance Criteria**
- The control can be identified by assistive technologies using an accessible name that contains `Model 3 for comparing responses`.
- If the label is programmatically associated through native labeling or ARIA, the accessible name remains aligned with the visible text.

### FR-3 Behavior preservation
The application must preserve the current behavior of the third comparison-model dropdown while updating its user-facing text and related naming.

**Acceptance Criteria**
- The dropdown appears under the same conditions as before the update.
- Selecting, changing, or clearing the third model behaves the same as before the update.
- The update does not alter comparison flow, submission flow, response rendering, loading states, or error states.

### FR-4 Targeted test and selector updates
The application must update test expectations and selectors that intentionally reference the renamed third dropdown so they remain valid after the label change.

**Acceptance Criteria**
- Tests that locate the control by visible label or accessible name are updated to the new label.
- Selector changes remain limited to this renamed third dropdown and do not broaden scope to unrelated UI elements.

## Technical Requirements

### TR-1 Terminology consistency in targeted identifiers
Implementation code directly associated with the third comparison-model dropdown must use terminology that clearly maps to `Model 3` and `responses` where renaming improves clarity.

**Acceptance Criteria**
- Variables, computed properties, test helpers, and selector identifiers directly tied to this control are reviewed for outdated naming.
- Renaming is limited to identifiers that specifically represent the third comparison-model dropdown or its label.
- Unrelated identifiers are not renamed as part of this update.

### TR-2 Scope-limited source changes
The implementation must confine source changes to the UI components, composables, and tests needed to apply the label update and related naming cleanup.

**Acceptance Criteria**
- No server route, API contract, or backend asset changes are introduced for this update.
- No layout or styling changes are introduced unless strictly required to accommodate the updated label text.

### TR-3 Regression coverage
The implementation must maintain automated coverage for the renamed dropdown through existing relevant tests, updated only as needed for the new terminology.

**Acceptance Criteria**
- Existing relevant unit, integration, or end-to-end tests covering the third dropdown continue to validate expected behavior after the rename.
- Test changes remain behaviorally equivalent and do not weaken assertions for the targeted control.

### TR-4 No public contract changes
The implementation must avoid changing any public contract beyond the targeted user-visible label and directly related UI-facing selectors used in tests.

**Acceptance Criteria**
- No API request or response shape changes are introduced.
- No persisted data structure or runtime configuration contract changes are introduced.
- Internal refactoring does not require downstream consumer changes outside the targeted UI/test code.

## Accessibility Requirements

### AR-1 Visible and programmatic label parity
The third comparison-model dropdown must keep its visible label and programmatic label aligned so people using assistive technologies receive the same updated wording.

**Acceptance Criteria**
- The control’s visible label is programmatically associated with the dropdown.
- Any `aria-label`, `aria-labelledby`, or equivalent naming mechanism used for the control includes the visible label text rather than conflicting terminology.

### AR-2 No regression in keyboard and focus behavior
The label and naming update must not introduce regressions in keyboard navigation, focus order, or focus visibility for the third comparison-model dropdown.

**Acceptance Criteria**
- The dropdown remains reachable in the same tab order as before.
- The control remains operable by keyboard with its existing interaction model.
- Focus indication for the control remains visible after the update.

### AR-3 Testable accessible queries
Where automated UI tests query the control via accessible role and name, those queries must use the updated accessible name.

**Acceptance Criteria**
- Accessibility-oriented test queries target the renamed control using its updated label text.
- Tests continue to verify the control in a way that reflects end-user accessible discovery.

## Assumptions

- The target control is the third model selector shown when comparison behavior exposes that dropdown.
- The new phrase `Model 3 for comparing responses` is the approved final copy for this update.
- Related naming updates are limited to code that specifically represents this control.

## Constraints

- Preserve existing behavior and current comparison workflow.
- Keep the update narrowly scoped to label and terminology alignment.
- Do not introduce unrelated UI refactors or broader copy changes.

## Out of Scope / Non-Goals

- Changing model comparison logic or business rules
- Updating backend routes, API payloads, or server-side prompt/template behavior
- Renaming first or second model selectors unless required by a direct dependency of this targeted change
- Reworking broader UI copy, layout, styling, or branding
- Adding new features, controls, or comparison modes
