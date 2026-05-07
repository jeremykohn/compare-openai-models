# Requirements

## Functional Requirements

- **FR-1**: The Model 3 prompt toggle label MUST be changed from `Comparison prompt for Model 3` to `View the prompt sent to Model 3 for comparing Response 1 and Response 2`.
  - Acceptance criteria:
    - The visible label text in the Model 3 prompt toggle exactly matches the required new string.
    - The old label text is not displayed in the Model 3 prompt toggle.

- **FR-2**: The toggle/disclosure behavior MUST remain unchanged.
  - Acceptance criteria:
    - Default collapsed state remains unchanged.
    - Expanding and collapsing interactions remain unchanged.
    - Prompt content visibility behavior remains unchanged when toggled.

- **FR-3**: Prompt content itself MUST remain unchanged.
  - Acceptance criteria:
    - The same generated prompt text is displayed when expanded.
    - No changes are made to prompt generation logic.

## Technical Requirements

- **TR-1**: The label text update MUST be implemented in the existing Model 3 prompt toggle component without changing unrelated component logic.
  - Acceptance criteria:
    - Only label copy is changed in the relevant prompt toggle markup.
    - Existing state handling and toggle handlers are preserved.

- **TR-2**: Automated tests that assert the old label text MUST be updated to assert the new label text.
  - Acceptance criteria:
    - Unit test coverage validating toggle label text passes with the new string.
    - E2E coverage validating toggle label text passes with the new string.

- **TR-3**: No backend or API contract changes are permitted.
  - Acceptance criteria:
    - No changes are introduced under `server/api/` or request/response payload shapes.

## Accessibility Requirements

- **AR-1**: The updated label text MUST remain understandable and descriptive for people using assistive technologies.
  - Acceptance criteria:
    - The new visible label text describes what is being revealed when the control is activated.

## Assumptions and Constraints

- The Model 3 prompt toggle control already exists and remains the same control.
- The required new label text must match exactly, including capitalization and spacing.
- This update is copy-only and does not include interaction redesign.

## Out of Scope / Non-Goals

- Refactoring toggle implementation details.
- Changing disclosure state management.
- Changing prompt content, prompt templates, or model request flow.
- Modifying unrelated UI copy.
