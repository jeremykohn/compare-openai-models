# General Description

Deduplicate the code that uses `model1-select`, `model2-select`, `model3-select`, and other identifiers that are duplicated within files and/or across files.

# Specific Description

## Problem Statement

The current codebase contains repeated identifier strings and closely related selector identifiers (including `model1-select`, `model2-select`, and `model3-select`) in multiple places. This duplication increases maintenance cost, makes rename/refactor work error-prone, and raises the risk of identifier drift between templates, scripts, and tests.

## Intended Outcome

Refactor selector-identifier usage so duplicated identifier literals are centralized and reused through clear, single-source definitions where appropriate. Preserve existing user-visible behavior, existing selector semantics, and current test intent while reducing repeated hardcoded identifiers across in-scope files.

## Scope Boundaries

In scope:
- Deduplication of repeated selector identifier literals and related duplicated identifier constants/usages.
- Refactoring within the comparison selector/output UI surfaces and directly coupled test helpers/selectors.
- Internal maintainability improvements that preserve current behavior.

Out of scope:
- New UI features or UX changes.
- Backend/API contract changes.
- Renaming identifiers in ways that intentionally change public behavior unless required for consistency and explicitly validated.
- Unrelated refactors outside identifier deduplication for this area.

## Key Behaviors and Expected User-Visible Results

After this update:
- The app continues to function the same from a user perspective.
- Existing model selectors remain present with equivalent behavior and accessibility semantics.
- Existing selector and panel interactions remain unchanged.
- Existing tests continue asserting the same behavior, with structural updates only where needed to align with deduplicated identifier sources.

## Assumptions, Constraints, and Explicit Exclusions

Assumptions:
- Current selector behavior is canonical and must be preserved.
- Identifier deduplication can be done without changing business logic.

Constraints:
- Keep edits focused on duplicated selector identifier usage and directly related code paths.
- Prefer single-source constants or shared helper mapping where it improves clarity.
- Maintain accessibility-related identifier relationships (`id`, labels, `aria-describedby`, test selectors) after refactor.

Explicit exclusions:
- No third-party dependency additions solely for deduplication.
- No expansion of scope into broad component redesign.

# Non-Goals

- Implementing new selector capabilities.
- Reworking request orchestration or server-side logic.
- Changing copy/text content unrelated to identifier deduplication.
