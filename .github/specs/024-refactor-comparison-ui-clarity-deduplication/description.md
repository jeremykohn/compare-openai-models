# General Description

Refactor the comparison UI code to improve clarity and reduce duplication, limited to the model comparison interface (`app/app.vue` and related selector/output UI components), without changing user-visible behavior.

# Specific Description

## Problem Statement

The current comparison UI implementation contains repeated layout and rendering logic across the model selector and output presentation areas. This duplication increases maintenance cost and makes future UI changes harder to apply consistently. Developers working on the comparison interface are affected because small visual or structural updates require edits in multiple places, increasing the risk of inconsistencies.

## Intended Outcome

Refactor the comparison UI code so shared structure and repeated view logic are expressed once through clearer component/composable boundaries and reusable patterns, while preserving the current behavior and visual output.

## Scope Boundaries

In scope:
- `app/app.vue`
- Related model selector UI components
- Related output display UI components
- Supporting UI-level composables/utilities used only by this comparison UI

Out of scope:
- Server routes and backend behavior
- API request/response contracts
- Model selection rules, submission flow, loading behavior, error behavior, or output semantics
- New features, visual redesign, or interaction changes

## Key Behaviors and Expected User-Visible Results

After the refactor:
- The comparison UI behaves the same as before for all existing interactions.
- The same controls, labels, states, and rendered outputs remain available in the same functional flow.
- No new user-facing functionality is introduced.
- Existing tests that validate current behavior should remain valid or require only non-behavioral test updates tied to refactored structure.

## Assumptions

- Existing comparison behavior is the source of truth and must be preserved.
- Refactoring may involve extracting reusable presentational units and consolidating repeated markup/state wiring.
- Any renaming or internal reorganization should remain internal and not change public contracts.

## Constraints

- No intentional behavior changes in the comparison UI.
- Keep accessibility support at least at the current level during refactor.
- Keep changes focused on clarity and deduplication; avoid unrelated cleanup.

## Explicit Exclusions

- Changes to environment configuration, runtime secrets, or deployment settings.
- Changes to non-comparison pages or unrelated components.
- Performance tuning beyond what naturally results from deduplication.

# Non-Goals

- Adding new comparison capabilities or controls.
- Changing visual design direction, spacing system, or branding.
- Reworking the backend model/data pipeline.
- Introducing new third-party UI libraries solely for this refactor.
