# Description: Enable Comparison Dropdown and Conditional Third Output States

## General Description

Currently, two models are selected from two different dropdown menus. Also, there is a disabled dropdown menu labeled "Model for comparing outputs" and a corresponding output area that displays the same placeholder message regardless of whether the two queries succeeded or errored. Change the app so that:
- The "Model for comparing outputs" dropdown is enabled.
- If both queries succeeded, the third output area should display a new italicized placeholder text, "New feature coming soon: Using {model-for-comparing-outputs} to compare responses from {model-1} and {model-2}", with these substitutions:
  - {model-for-comparing-outputs}: The selected name of the model for comparing outputs
  - {model-1}: The selected name of Model 1
  - {model-2}: The selected name of Model 2
- If one or both of the queries errored, the third output area should display an error, with the error message "Cannot compare model outputs due to errors when querying ", followed by a comma-separated sequence of "Model {number} ({name})" for each model that errored, with the actual model number (1 or 2) in place of {number} and the actual model name in place of {name}.

## Specific Description

### Problem Statement

- The comparison-model selector is currently present but disabled, so users cannot choose which model would be used for future comparison behavior.
- The third output area currently uses one generic placeholder flow and does not distinguish between:
  - successful outer-query outcomes, and
  - error outcomes where one or both model queries failed.
- This makes the third panel less informative and blocks the UI from reflecting real outcome-dependent comparison readiness.

### Intended Outcome and Scope Boundaries

#### In Scope

- Enable the dropdown labeled `Model for comparing outputs` so users can select a comparison model from the same model list source.
- Preserve existing Model 1/Model 2 query execution behavior (still only two actual response queries for this update).
- Make the third output area conditional on Model 1/Model 2 outcomes:
  - If both Model 1 and Model 2 queries succeed, show italicized placeholder text with runtime substitutions:
    - selected comparison model name,
    - selected Model 1 name,
    - selected Model 2 name.
  - If one or both queries fail, show an error message in the third panel:
    - prefix: `Cannot compare model outputs due to errors when querying `
    - suffix: comma-separated `Model {number} ({name})` entries for each failed side.

#### Out of Scope

- Running a real third comparison API query.
- Generating or displaying a true comparison report.
- Changing server API contracts for comparison execution.
- Altering existing Model 1/Model 2 request semantics beyond state usage needed for third-panel messaging.

### Key Behaviors and Expected User-Visible Results

- The `Model for comparing outputs` selector is enabled and user-selectable.
- The third output panel continues to appear in the existing post-submit output lifecycle.
- During final rendered state after Model 1 and Model 2 settle:
  - **Both success:**
    - third panel shows italicized text exactly in this format:
      - `New feature coming soon: Using {model-for-comparing-outputs} to compare responses from {model-1} and {model-2}`
    - placeholders are replaced with currently selected model names.
  - **Any error(s):**
    - third panel shows an error message starting with:
      - `Cannot compare model outputs due to errors when querying `
    - followed by entries for each errored side using:
      - `Model 1 ({model-1-name})`
      - `Model 2 ({model-2-name})`
    - entries are comma-separated when both errored.
- Existing Model 1 and Model 2 panel content/behavior remains unchanged.

### Assumptions, Constraints, and Explicit Exclusions

- “Succeeded” and “errored” are determined from existing terminal request states already used by Model 1/Model 2 output panels.
- The comparison-dropdown value is UI state only in this update and does not trigger a new network request.
- Model names used in third-panel text are the selected/submitted names already available in app state.
- Existing sanitization and accessible error semantics must still apply when third-panel error content is rendered.
- If only one side errors, the third-panel error message includes only that side’s `Model {number} ({name})` entry.

## Non-Goals

- Implementing full comparison logic between Model 1 and Model 2 responses.
- Sending a third `/api/respond` request for the comparison model.
- Adding persistence/history for comparison model selections.
- Refactoring unrelated selector/output architecture outside this behavior change.
