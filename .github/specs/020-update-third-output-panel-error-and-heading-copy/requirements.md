# Requirements

## Functional Requirements

### FR-1 Error-state heading copy in third output panel
The application must display the heading `Error: Cannot produce comparison` in the third output panel when model 1, model 2, or both model queries are in an error state.

**Acceptance Criteria**
- When only model 1 errors, the third output panel heading is exactly `Error: Cannot produce comparison`.
- When only model 2 errors, the third output panel heading is exactly `Error: Cannot produce comparison`.
- When both model 1 and model 2 error, the third output panel heading is exactly `Error: Cannot produce comparison`.

### FR-2 Error-state message copy in third output panel
The application must display the message `Unable to compare model outputs due to errors when querying ` + `{models-that-errored}` in the third output panel error state.

**Acceptance Criteria**
- In third-panel error scenarios, the message starts with the exact prefix `Unable to compare model outputs due to errors when querying `.
- `{models-that-errored}` remains appended as the comma-separated list of model descriptors corresponding to the errored model queries.
- The old message prefix `Cannot compare model outputs due to errors when querying ` is no longer shown in the third-panel error message.

### FR-3 Non-error heading copy in third output panel
The application must display the heading `Comparison of responses from Model 1 and Model 2` in the third output panel when comparison content is shown and no outer model-query errors are present.

**Acceptance Criteria**
- In the non-error comparison-ready state, the third panel heading is exactly `Comparison of responses from Model 1 and Model 2`.
- The old non-error heading `Comparison between responses of Models 1 and 2` is no longer shown in the active UI for this panel state.

### FR-4 Behavior parity for third panel states
The update must preserve existing third-panel rendering behavior and state transitions while changing copy.

**Acceptance Criteria**
- Waiting/loading behavior and visibility conditions for the third panel remain unchanged.
- Existing logic for determining `{models-that-errored}` remains unchanged.
- No new third-panel states or branch conditions are introduced by this update.

## Technical Requirements

### TR-1 Scope-limited implementation changes
Implementation changes must be limited to third-panel UI copy surfaces and directly related tests.

**Acceptance Criteria**
- Source updates are limited to files that render/assert third-panel heading and error message text.
- No unrelated refactors are introduced.

### TR-2 Preserve current error descriptor assembly
The implementation must reuse current logic that assembles errored model descriptors without changing ordering or formatting rules.

**Acceptance Criteria**
- Existing descriptor assembly logic is retained.
- Message copy change wraps existing descriptor output without modifying descriptor content rules.

### TR-3 Regression coverage updates
Automated tests that assert third-panel heading/message text must be updated to the new copy while preserving behavioral assertions.

**Acceptance Criteria**
- Relevant unit/UI tests pass with updated expected strings.
- Relevant e2e tests that assert comparison panel copy pass with updated expected strings.
- Test scope remains targeted to the requested copy changes.

### TR-4 No contract or backend changes
The update must not change server routes, request/response contracts, runtime config contracts, or persisted data shapes.

**Acceptance Criteria**
- No server/api files are modified to implement this update.
- No request/response payload structures are modified.

## Accessibility Requirements

### AR-1 Error copy remains perceivable and programmatically exposed
The new third-panel error heading and message must be rendered as visible text in existing semantic elements so people using assistive technologies receive the updated wording.

**Acceptance Criteria**
- The error heading text `Error: Cannot produce comparison` is available in the panel’s heading content.
- The error message uses visible text content with the updated prefix and remains discoverable in the panel region.

### AR-2 Non-error heading remains clear and discoverable
The new non-error heading must be exposed through the existing heading semantics used by the comparison panel.

**Acceptance Criteria**
- The heading `Comparison of responses from Model 1 and Model 2` is rendered in the same heading element/level currently used for non-error state.
- No keyboard/focus behavior changes are introduced by this copy update.

### AR-3 Accessibility-oriented tests reflect new panel copy
Automated accessibility/UI tests that verify third-panel copy must use the updated heading/message strings.

**Acceptance Criteria**
- Tests that query/assert the third-panel heading and error copy are updated to the new wording.
- Accessibility-focused tests continue to pass without weakening existing assertions.

## Assumptions

- Existing comparison panel logic already computes `{models-that-errored}` correctly.
- The requested strings are final and must match exactly, including capitalization and punctuation.
- The third panel currently renders distinct error and non-error heading/message copy in test-covered paths.

## Constraints

- Preserve all current third-panel behavior and state gating.
- Keep change scope limited to copy updates and directly related tests.
- Avoid introducing new dependencies.

## Out of Scope / Non-Goals

- Changing query execution, retry behavior, or error normalization logic
- Modifying first or second output panel copy
- Adding new comparison features, controls, or output formats
- Changing backend logic, API payloads, or model-selection behavior
