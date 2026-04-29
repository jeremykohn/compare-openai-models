# Requirements

## Functional Requirements

### FR-1 Hide Model 3 dropdown from active UI
The application must not render the Model 3 dropdown in the active user interface.

**Acceptance Criteria**
- The form shows only `Model 1` and `Model 2` selectors.
- The control previously labeled for Model 3 is not visible in the rendered page.
- No active UI query by label/role can discover a third model selector.

### FR-2 Hide third comparison output panel from active UI
The application must not render the third comparison output panel in the active user interface.

**Acceptance Criteria**
- After submit, only the two existing model output panels are shown.
- The panel previously used for comparison heading/message is not visible.
- Comparison loading, placeholder, and comparison error texts are not rendered in active UI flow.

### FR-3 Preserve two-model query and output behavior
The application must preserve current two-model behavior for request submission and output rendering.

**Acceptance Criteria**
- A single send action still triggers exactly two `/api/respond` requests.
- Model 1 and Model 2 selectors continue to independently control their request models.
- Left/right loading, success, and error rendering behavior remains unchanged.

### FR-4 Reversible implementation intent
The update must be implemented in a way that is straightforward to reverse in a future commit.

**Acceptance Criteria**
- Changes are localized to UI rendering/wiring and directly related tests.
- Core comparison logic may remain in code if non-rendered, so re-enable can be done by restoring render wiring.
- No destructive schema/contract removals are introduced.

## Technical Requirements

### TR-1 Scope-limited source changes
Implementation changes must be limited to UI components/state wiring and tests required to hide/remove these elements from active interface.

**Acceptance Criteria**
- No server route or backend contract changes are required for this update.
- No unrelated refactors are introduced.

### TR-2 Remove UI reachability for hidden elements
Model 3 dropdown and third comparison panel must not be keyboard reachable or exposed in active UI interaction path.

**Acceptance Criteria**
- Hidden/removed controls are not in tab order.
- There are no visible/interactable controls for Model 3 in active page content.

### TR-3 Update automated test coverage to two-panel/two-selector UI
Tests that currently depend on Model 3 selector or third panel visibility must be updated to reflect intended hidden state.

**Acceptance Criteria**
- Unit and e2e tests assert only two selectors and two visible output panels for active UI.
- Existing two-request behavior assertions remain present and passing.

### TR-4 Preserve existing public contracts
The update must not change request/response contract shapes or runtime configuration contracts.

**Acceptance Criteria**
- `/api/respond` request body and response handling contracts remain unchanged.
- No runtime config/environment variable contract changes are introduced.

## Accessibility Requirements

### AR-1 Active form controls remain clearly accessible
With Model 3 hidden/removed, remaining controls must continue to be clearly labeled and keyboard operable.

**Acceptance Criteria**
- `Model 1` and `Model 2` selectors remain discoverable by label.
- Prompt field and submit flow remain keyboard-accessible.

### AR-2 Removed elements are not exposed as active controls
Hidden/removed Model 3 selector and third panel must not appear as active controls/content in accessibility queries for active UI.

**Acceptance Criteria**
- Accessibility-oriented tests do not find a third selector by role/name.
- Comparison panel heading/message content is absent from active page semantics.

### AR-3 No regression in current accessibility checks
Existing accessibility checks for idle, loading, success, and error states must remain green after this UI change.

**Acceptance Criteria**
- Existing relevant a11y tests pass after selector/panel removal from active UI.

## Assumptions

- Product intent for this commit is to ship only two-model UI flow.
- Future re-enable of Model 3/third panel is expected and should remain feasible.
- Comparison logic can remain dormant/inactive behind removed render surfaces.

## Constraints

- Keep implementation reversible and minimal.
- Preserve all current Model 1/Model 2 behavioral semantics.
- Avoid backend/API modifications unless absolutely required.

## Out of Scope / Non-Goals

- Deleting all comparison-related code paths permanently.
- Introducing new feature-flag infrastructure.
- Redesigning overall app layout beyond removing/hiding Model 3 and third panel surfaces.
- Changing error normalization/backend data contracts.
