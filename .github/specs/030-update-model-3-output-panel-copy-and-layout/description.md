# Description

## General Description

Currently, if the Model 1 and Model 2 queries succeed, a third output panel is displayed with a toggle that reveals a prompt for Model 3 and placeholder text. Update the app so the third output panel removes the current placeholder text, updates its header copy, updates the toggle label, and uses the same inner margin as the other output panels that display responses from Model 1 and Model 2.

## Specific Description

### Problem Statement

The current third output panel still presents transitional placeholder copy and inconsistent text labels that do not reflect the intended comparison behavior. Its inner panel spacing is also inconsistent with the first two response panels, creating a noticeable visual mismatch.

### Intended Outcome

When Model 1 and Model 2 succeed and the third output panel is shown:
- Remove the existing placeholder text (which starts with `New feature coming soon`).
- Change the panel header from `Comparison of responses from Model 1 and Model 2` to:
  - `Response from Model 3 ({model-3-name}) comparing responses from Model 1 and Model 2`
- Replace `{model-3-name}` with the currently selected model name from the Model 3 dropdown.
- Change the toggle label from `Prompt for Model 3` to `Comparison prompt for Model 3`.
- Update the third panel inner margin so it matches the inner margin used by the Model 1 and Model 2 response panels.

### Scope Boundaries

In scope:
- Third output panel content/copy updates.
- Third panel header interpolation with selected Model 3 name.
- Third panel toggle label update.
- Third panel inner-margin adjustment to match outer response panels.

Out of scope:
- Changes to model query orchestration or API request flow.
- Changes to success/failure conditions for showing the third panel.
- New controls, new features, or redesign outside the requested third-panel copy/layout updates.

### Key Behaviors and Expected User-Visible Results

- If Model 1 and Model 2 results are successful and the third panel is visible, the old placeholder text is no longer displayed.
- The third panel header displays exactly:
  - `Response from Model 3 ({model-3-name}) comparing responses from Model 1 and Model 2`
  with `{model-3-name}` replaced by the selected Model 3 dropdown value label.
- The prompt toggle label in the third panel reads `Comparison prompt for Model 3`.
- The inner margin of the third panel visually matches the inner margin of the Model 1 and Model 2 response panels.
- Existing behavior for the first two output panels remains unchanged.

### Assumptions, Constraints, and Explicit Exclusions

Assumptions:
- The selected Model 3 display name is already available in current UI state where the third panel is rendered.
- The third panel continues to appear under the same existing conditions (Model 1 and Model 2 success path).

Constraints:
- Keep the update focused on copy and layout consistency in the third output panel.
- Preserve existing accessibility and interaction behavior for the toggle control.

Explicit exclusions:
- No backend/API contract changes.
- No change to which model is used for comparison generation.
- No change to model execution timing or output-panel sequencing.

## Non-Goals

- Introduce new third-panel features beyond the requested copy and layout changes.
- Change Model 1/Model 2 output panel behavior.
- Modify the comparison-generation logic itself.
