# Description: Two Dropdown Menus (Left Active, Right Inactive)

## General Description

In the current app UI, there is one dropdown menu used to select the model for the ChatGPT query. Add a second dropdown menu so there are two dropdown menus shown side-by-side, equally sized, with the same model options. The right-hand dropdown should be inactive. The left-hand dropdown should remain active and continue to control which model is used for the query, as in the current app.

## Specific Description

### Problem Statement
- The current UI supports only one model dropdown, so the interface cannot yet present the planned side-by-side model-selection layout.
- Users cannot see the future multi-model selection structure in place while preserving current single-model execution behavior.

### Intended Outcome
- Render two equally sized dropdown controls in a horizontal row.
- Keep both dropdowns populated with the same model option set.
- Keep only the left dropdown interactive/active.
- Keep the right dropdown visible but inactive/disabled.
- Preserve current query behavior so only the left dropdown value is used when submitting.

### Scope Boundaries
- In scope:
  - UI layout change from one dropdown to two side-by-side dropdowns.
  - Reuse the same models list/options in both dropdowns.
  - Right dropdown disabled/inactive behavior.
  - Left dropdown remains the only active control used for request model selection.
- Out of scope:
  - No second query execution.
  - No server/API contract changes.
  - No comparison logic between models.
  - No change to output panel behavior beyond what is required to support this dropdown layout update.

### Key Behaviors and Expected User-Visible Results
- The UI shows two dropdown menus in one row at desktop widths, equally sized.
- The left dropdown:
  - Is enabled.
  - Supports user selection.
  - Continues driving the submitted `model` parameter exactly as today.
- The right dropdown:
  - Displays the same options list.
  - Is visually and functionally disabled/inactive.
  - Does not affect submitted request payload.
- Existing model-loading, validation, and error handling for model retrieval continue to function.

### Assumptions and Constraints
- Existing model-fetch state is reused for both dropdown option sets.
- Accessibility semantics (labels, required/invalid attributes, help text associations) are preserved for both controls, with disabled semantics applied to the right dropdown.
- Responsive behavior may stack dropdowns on smaller screens while preserving equal sizing when side-by-side.

## Non-Goals
- Activating the right dropdown for request execution.
- Supporting different model selections for separate responses.
- Adding a third dropdown.
- Implementing multi-request or model-comparison workflows.
