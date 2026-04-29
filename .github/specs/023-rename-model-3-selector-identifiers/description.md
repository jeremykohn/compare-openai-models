# General Description

Earlier, the third dropdown menu was relabeled from comparison-specific wording to Model 3 wording, and some related code names were updated, but not all. Rename remaining identifier and selector references for the Model 3 dropdown so naming is consistent with the Model 3 convention. For example, rename the dropdown ID from `model-comparison-select` to `model3-select`, and align related variable names, selectors, and test references accordingly.

# Specific Description

## Problem Statement

The UI and codebase currently use mixed naming conventions for the third model selector:
- some references use updated Model 3 terminology,
- others still use older comparison-oriented names.

This inconsistency causes confusion and makes the selector harder to reason about and maintain, especially in tests and selector helpers where old IDs and names remain in use.

## Intended Outcome

Standardize naming for the third dropdown so all relevant code paths use Model 3 terminology consistently.

At minimum:
- rename the dropdown DOM ID from `model-comparison-select` to `model3-select`, and
- update other related names/selectors/references tied to this dropdown so they consistently follow Model 3 naming conventions.

## Scope Boundaries

In scope:
- Renaming the third dropdown ID in active UI markup.
- Renaming related references tied to the same control, including:
  - component/query selectors,
  - helper functions/selectors in tests,
  - variable and prop names where they are specifically about the Model 3 dropdown identity.
- Updating affected tests to match the renamed identifiers.

Out of scope:
- Behavioral changes to submit/query flow.
- Changing Model 3 feature semantics.
- Renaming unrelated comparison concepts that do not represent the Model 3 dropdown identity.
- UI redesign or layout changes.

## Key Behaviors and Expected User-Visible Results

After the rename update:
- The third dropdown remains visible and behaves exactly as before.
- The third dropdown element ID is `model3-select`.
- Existing functionality is preserved; this is a naming consistency update, not a feature change.
- Automated tests and e2e selectors referencing this control pass with updated naming.

## Assumptions

- Current behavior of the third dropdown is already correct and should be preserved.
- The rename should be applied consistently across app code and tests where references point to the Model 3 dropdown.
- Backward compatibility for old selector names is not required unless explicitly requested.

## Constraints

- Keep changes focused on naming consistency for Model 3 dropdown references.
- Avoid unrelated refactors.
- Preserve accessibility and testability of the selector.

## Explicit Exclusions

- No new Model 3 logic.
- No backend/API changes.
- No changes to non-Model-3 naming domains unless directly required by this rename.

# Non-Goals

- Introducing new comparison functionality.
- Renaming all comparison-related wording everywhere in the repo.
- Modifying output panel behavior as part of this update.
