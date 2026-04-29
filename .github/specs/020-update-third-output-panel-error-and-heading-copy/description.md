# General Description

Make these changes to the third output panel:
- If there are errors when querying model 1, or 2, or both, the output panel should display:
  - the heading `Error: Cannot produce comparison`
  - the message `Unable to compare model outputs due to errors when querying ` + `{models-that-errored}`
    - This is a change from the current message `Cannot compare model outputs due to errors when querying ` + `{models-that-errored}`.
    - `{models-that-errored}` is the comma-separated list of models and model names whose queries resulted in an error.
- If there are no errors, the output panel should display the heading `Comparison of responses from Model 1 and Model 2`.
  - This is a change from its current heading `Comparison between responses of Models 1 and 2`.

# Specific Description

## Problem Statement

The third output panel currently uses comparison copy that no longer matches the desired wording for both error and non-error states. People reading comparison results see inconsistent language:
- In error scenarios, the current message starts with `Cannot compare...` instead of the required `Unable to compare...` wording.
- In non-error scenarios, the heading text uses `Comparison between responses of Models 1 and 2` instead of the required `Comparison of responses from Model 1 and Model 2`.
- Error-state heading text is not aligned to the requested explicit heading `Error: Cannot produce comparison`.

This affects end-user clarity and consistency in the third output panel only.

## Intended Outcome

Update third output panel copy so it exactly reflects the requested wording in each state:
- Any error state (model 1 error, model 2 error, or both):
  - heading: `Error: Cannot produce comparison`
  - message: `Unable to compare model outputs due to errors when querying ` + `{models-that-errored}`
- No-error comparison state:
  - heading: `Comparison of responses from Model 1 and Model 2`

The update is copy-only for the third output panel and must not alter existing comparison logic or state transitions.

## Scope Boundaries

In scope:
- Third output panel heading text in error state
- Third output panel message text in error state
- Third output panel heading text in non-error comparison-ready state
- Any directly related UI tests that assert these exact strings

Out of scope:
- Changes to model query behavior, success/error detection rules, or request flow
- Changes to first and second output panel headings/messages
- API contract, backend routes, or data-shape changes
- Broader wording updates outside this specific panel and states

## Key Behaviors and Expected User-Visible Results

After the update:
- If model 1 fails, model 2 fails, or both fail, the third panel shows:
  - heading `Error: Cannot produce comparison`
  - message `Unable to compare model outputs due to errors when querying ` + `{models-that-errored}`
- `{models-that-errored}` remains the comma-separated list of errored model descriptors (model index and selected model name).
- If neither model has an error and comparison placeholder content is shown, the third panel heading is `Comparison of responses from Model 1 and Model 2`.
- Existing behavior for waiting/loading states and conditional rendering remains unchanged.

## Assumptions

- `{models-that-errored}` is already produced by existing logic and only surrounding copy needs to change.
- Error ordering for `{models-that-errored}` remains deterministic as currently implemented.
- The required new strings are final and must match exactly.

## Constraints

- Preserve current behavior and control flow; only copy changes are intended.
- Keep updates limited to third output panel rendering and tests that intentionally assert this panel’s copy.
- Do not introduce unrelated refactors.

## Explicit Exclusions

- Changing the definition of when comparison is considered errored
- Changing how model names are selected or displayed in `{models-that-errored}`
- Adding new comparison features or UI states

# Non-Goals

- Refactoring panel component structure
- Renaming labels in other components
- Updating copy in unrelated errors or prompts
