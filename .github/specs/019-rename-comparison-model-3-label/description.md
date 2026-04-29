# General Description

For the dropdown menu currently labeled "Model for comparing outputs", change the label to "Model 3 for comparing responses". Also make related code changes, such as updating names for variables and selectors.

# Specific Description

## Problem Statement

The current comparison UI uses the label "Model for comparing outputs" for the third model-selection dropdown. That label is less consistent with the rest of the interface because it does not clearly identify the dropdown as the third model selector, and the related internal naming may still reflect older terminology. This affects people using and maintaining the comparison UI because the displayed language and code identifiers are harder to map consistently to the three-model layout.

## Intended Outcome

Update the third dropdown label so the UI presents it as "Model 3 for comparing responses" and align related implementation naming with that terminology where it improves clarity, without changing the existing behavior of model selection or comparison.

## Scope Boundaries

In scope:
- The visible label text for the dropdown currently shown as "Model for comparing outputs"
- Related accessibility-facing label text that should match the visible label
- Related variable names, computed names, selector names, and test references that specifically describe this third comparison model control
- Supporting UI code and tests needed to keep naming consistent with the new label

Out of scope:
- Changes to model-selection behavior or comparison logic
- Changes to server routes, API contracts, or backend data handling
- Broader terminology updates unrelated to this specific third dropdown
- Visual redesign or layout changes beyond what is required by the new label text

## Key Behaviors and Expected User-Visible Results

After the update:
- The dropdown previously labeled "Model for comparing outputs" is labeled "Model 3 for comparing responses".
- Any associated accessible name for that control matches or includes the updated visible label.
- The dropdown continues to behave exactly as it does today, including when it appears, how it is selected, and how it participates in comparison flows.
- Existing selectors/tests that intentionally target this control are updated only as needed to reflect the renamed label and related identifiers.

## Assumptions

- The target control is the third model selector introduced for comparison behavior.
- "Responses" is the preferred term to use in the updated visible label and related naming where applicable.
- Internal renaming should stay limited to identifiers directly tied to this control so unrelated code remains stable.

## Constraints

- Preserve current functionality and user flow.
- Keep the accessible naming aligned with the visible label.
- Avoid unrelated refactors while updating terminology.

## Explicit Exclusions

- Adding new comparison features or controls
- Renaming first or second model selectors unless strictly required by the targeted consistency update
- Altering business logic, request payloads, or persisted data shapes

# Non-Goals

- Reworking the overall comparison UI copy strategy
- Changing the semantics of comparison or output rendering
- Refactoring unrelated components solely for naming consistency
