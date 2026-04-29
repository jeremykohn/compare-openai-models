# General Description

Test coupling to production selector-ID constants can mask regressions.

# Specific Description

## Problem Statement

Current tests for selector IDs import and reuse production constants (`MODEL_SELECT_IDS`) for key selector lookups. This creates coupling between test assertions and implementation details, which can hide regressions when production selector IDs drift: both app code and tests can change together, allowing failures in external DOM ID contracts to go undetected.

Affected files currently include:
- `app/components/ModelsSelector.vue`
- `shared/constants/model-selectors.ts`
- `tests/unit/models-selector.test.ts`
- `tests/e2e/helpers/selectors.ts`
- `tests/e2e/app.spec.ts`

## Intended Outcome

Improve test independence for selector-ID contracts so regressions in external DOM ID behavior are detectable.

Specifically:
- Keep shared constants in app code where appropriate for implementation clarity.
- Ensure contract-level tests assert explicit selector ID literals (`model1-select`, `model2-select`, `model3-select`) rather than only importing production constants.
- Treat selector IDs as public UI/test contracts and validate them directly in at least one stable contract-level path (unit and/or e2e smoke coverage).

## Scope Boundaries

In scope:
- Test strategy and test code adjustments for selector-ID contract assertions.
- Limited, targeted refactor in test helpers/specs to reduce harmful coupling.
- Minor implementation comments/docs only if required to clarify selector-ID contract expectations.

Out of scope:
- Changing selector runtime behavior or business logic.
- Backend/API changes.
- Broad test architecture refactors unrelated to selector-ID contracts.

## Key Behaviors and Expected User-Visible Results

- User-visible behavior remains unchanged.
- Selector IDs in DOM remain stable (`model1-select`, `model2-select`, `model3-select`) unless intentionally changed in a future scoped update.
- If selector IDs drift unintentionally, contract-level tests fail and surface the regression.

## Assumptions, Constraints, and Explicit Exclusions

Assumptions:
- Selector IDs are relied upon by test automation and should be treated as stable contract values.
- Production constants can still be used where beneficial, but must not be the only source for contract assertions.

Constraints:
- Keep changes minimal and targeted to independence/contract fidelity.
- Preserve current accessibility and selector interaction behavior.

Explicit exclusions:
- No new feature work.
- No renaming of selector IDs in this update unless required and fully covered by explicit contract assertions.

# Non-Goals

- Rewriting all tests to avoid any shared constants.
- Refactoring unrelated selectors, panels, or UI state flows.
- Introducing new testing frameworks or large tooling changes.
