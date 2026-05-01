# Requirements

## Functional Requirements

### FR-1 Restore Model 3 dropdown in active UI
The application must render the `Model 3` dropdown in the active model-selector UI.

**Acceptance Criteria**
- The selector area shows `Model 1`, `Model 2`, and `Model 3 for comparing responses`.
- The `Model 3` control is visible and queryable by label/role.
- `#model-comparison-select` is present in active UI markup.

### FR-2 Restore third comparison output panel in active UI
The application must render the third comparison output panel in the active results UI.

**Acceptance Criteria**
- After submit, the comparison panel is present alongside the two model output panels.
- Comparison panel loading, heading, placeholder, and error branches are rendered according to comparison state.
- Comparison panel uses the same active behavior as pre-removal implementation.

### FR-3 Restore Model 3 state wiring and event flow
The application must restore Model 3 state/event wiring between selector UI and app shell.

**Acceptance Criteria**
- Selector emits Model 3 updates through existing event naming conventions.
- App shell receives Model 3 updates and uses the selected value for comparison panel content.
- Default/fallback behavior for submitted comparison model remains consistent with pre-removal behavior.

### FR-4 Preserve existing Model 1/Model 2 behavior
Restoration must not regress current Model 1/Model 2 submit, loading, success, and error behavior.

**Acceptance Criteria**
- Submit continues issuing exactly two `/api/respond` requests for outer model responses.
- Existing left/right output semantics remain unchanged.
- Existing prompt validation behavior remains unchanged.

## Technical Requirements

### TR-1 Scope-limited restoration
Implementation changes must be limited to restoring previously removed Model 3 and third-panel UI behavior plus directly related tests.

**Acceptance Criteria**
- No server route contract changes are required.
- No unrelated refactors are introduced.

### TR-2 Re-enable prior interface contracts
Model 3 props/events/template contracts removed in prior commit must be restored where required.

**Acceptance Criteria**
- `ModelsSelector` restores Model 3 prop/event signatures used by app shell.
- `app/app.vue` restores Model 3 bindings and comparison panel render logic.

### TR-3 Update automated coverage to restored three-part UI
Unit and e2e tests changed for two-model-only mode must be restored to validate three-selector/three-panel behavior.

**Acceptance Criteria**
- Unit tests assert Model 3 selector presence and behavior.
- Unit/e2e tests assert comparison panel loading/placeholder/error behavior.
- Accessibility tests cover restored third selector/panel semantics.

### TR-4 Preserve existing public API/data contracts
Restoration must not alter `/api/respond` payload/response contracts or runtime config contracts.

**Acceptance Criteria**
- Existing request/response handling contracts remain unchanged.
- No new runtime configuration variables are introduced.

## Security Requirements

### SR-1 No secret exposure regressions
Restoration must not expose secrets or unsanitized sensitive data in UI.

**Acceptance Criteria**
- Existing sanitized error rendering behavior remains intact.
- No secret values are introduced in client-visible state/log output.

### SR-2 No new backend request surfaces
Restoring comparison UI must not introduce additional backend call paths beyond existing outer model queries.

**Acceptance Criteria**
- Submit continues issuing only the existing two model-response requests.
- Comparison panel content remains placeholder/error/heading logic only.

## Accessibility Requirements

### AR-1 Restore accessible naming/semantics for Model 3 control
Restored Model 3 selector must retain clear label semantics and expected disabled/enabled behavior from prior implementation.

**Acceptance Criteria**
- Model 3 selector is discoverable via label text and role.
- Selector semantics remain keyboard and screen-reader compatible.

### AR-2 Restore accessible semantics for third output panel
Third comparison panel content must be present in active page semantics when rendered.

**Acceptance Criteria**
- Loading/status copy is announced with expected status semantics.
- Heading/error/placeholder content is perceivable in accessibility queries.

### AR-3 No regression in current a11y checks
Restoring Model 3/third panel must not regress existing accessibility checks.

**Acceptance Criteria**
- Relevant unit/e2e accessibility checks pass after restoration.

## Performance Requirements

### PR-1 No additional network overhead
Restoration must not add network request count beyond existing two-request response flow.

**Acceptance Criteria**
- Browser/request tests confirm exactly two `/api/respond` calls per valid submit.

## Assumptions

- The immediate prior commit removed Model 3 selector and comparison panel behavior.
- The pre-removal implementation in this repository is the source of truth for restoration.
- Restoration should be a targeted revert-style update, not a redesign.

## Constraints

- Keep implementation minimal and focused.
- Preserve behavior parity with pre-removal UI.
- Avoid backend/API modifications unless strictly required to restore behavior parity.

## Out of Scope / Non-Goals

- Introducing new comparison features beyond restored prior behavior.
- Redesigning model selector layout or output-panel UX.
- Changing server-side comparison capabilities.
