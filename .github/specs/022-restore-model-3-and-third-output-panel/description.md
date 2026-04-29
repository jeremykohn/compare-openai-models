# General Description

Restore the Model 3 dropdown and the third output panel that were removed in the previous commit.

# Specific Description

## Problem Statement

The current UI was reduced to a two-model-only flow by removing:
- the `Model 3` selector from the model-selection area, and
- the third comparison output panel from the results area.

That removal temporarily disabled the comparison-facing UI surface. We now need to re-enable that UI surface so the app again exposes the same three-selector/three-panel structure used before the removal.

## Intended Outcome

Reintroduce the previously removed UI pieces so the app once again includes:
- a visible `Model 3` dropdown in the selector UI, and
- a visible third output panel for comparison-related content.

Behavior should be restored consistently with the pre-removal implementation so the prior three-part layout and interaction model are available again.

## Scope Boundaries

In scope:
- Restore Model 3 selector rendering and related UI wiring.
- Restore third output panel rendering and related UI wiring.
- Restore any tests that were changed only to support the temporary removal.

Out of scope:
- New comparison feature behavior beyond what existed before the removal.
- Redesigning selector/panel layout.
- API contract changes unrelated to restoring removed UI.

## Key Behaviors and Expected User-Visible Results

After restoration:
- The model selector area shows three selectors again, including `Model 3`.
- The output area includes the third comparison panel again.
- Comparison panel loading/placeholder/error/success-related display behavior matches the previous (pre-removal) behavior.
- Existing Model 1/Model 2 behavior remains intact.

## Assumptions

- The previous commit removed Model 3 and the third panel intentionally as a temporary change.
- The most recent pre-removal behavior is the source of truth for restoration.
- Restoration should prefer minimal, targeted reversions over introducing new behavior.

## Constraints

- Keep changes focused on restoring removed functionality.
- Preserve existing app conventions for naming, accessibility, and test style.
- Avoid unrelated refactors.

## Explicit Exclusions

- No new comparison logic beyond restored behavior.
- No new feature flags or configuration toggles for this restoration.

# Non-Goals

- Improving or redesigning restored comparison UX.
- Refactoring unrelated app areas during restoration.
