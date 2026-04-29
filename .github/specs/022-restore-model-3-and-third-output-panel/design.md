# Overview

This update restores previously removed UI surfaces: the `Model 3` selector and third comparison output panel. The goal is behavior parity with the pre-removal implementation while preserving current Model 1/Model 2 request flow and contracts.

Goals:
- Re-enable visible `Model 3` selector in active selector UI.
- Re-enable comparison output panel rendering and state branches.
- Restore Model 3 state/event wiring required by comparison panel copy.
- Preserve two-request outer model query behavior and existing contracts.

Out of scope:
- New comparison logic/features beyond prior behavior.
- Backend/API contract changes.
- Unrelated layout redesign.

# Architecture

## High-Level Approach

1. Restore Model 3 prop/event/template paths in `ModelsSelector`.
2. Restore Model 3 refs/bindings in `app/app.vue`.
3. Restore third comparison panel markup and computed branches in `app/app.vue`.
4. Restore test assertions for three-selector/three-panel behavior.

## Affected Surfaces

- `app/components/ModelsSelector.vue`
  - Re-add Model 3 prop default, emit contract, and template field (`#model-comparison-select`).
- `app/app.vue`
  - Re-add Model 3 refs (`selectedModelIdModel3`, `submittedModelIdModel3`).
  - Re-add computed comparison-panel state and copy.
  - Re-add comparison panel render block and selector wiring.
- Tests
  - `tests/unit/models-selector.test.ts`
  - `tests/unit/app.ui.test.ts`
  - `tests/unit/app.a11y.test.ts`
  - `tests/e2e/helpers/selectors.ts`
  - `tests/e2e/app.spec.ts`
  - `tests/e2e/models-selector.spec.ts`
  - `tests/e2e/accessibility.spec.ts`

# Interfaces

## UI Surface Contract

After restoration, active UI exposes:
- Three model selectors: `Model 1`, `Model 2`, `Model 3 for comparing responses`
- Three output areas: two model outputs plus comparison panel

Comparison panel states:
- Loading copy while outer model responses are in-flight
- Error heading/message when one or more outer requests fail
- Non-error heading plus placeholder text when both outer requests succeed

## Event/State Interface

- `ModelsSelector` emits:
  - `update:selectedModelIdModel1`
  - `update:selectedModelIdModel2`
  - `update:selectedModelIdModel3`
- App shell receives Model 3 updates and derives submitted comparison-model fallback.
- Submit continues invoking only `queryModel1` and `queryModel2`.

# Data

No backend data model change is required.

Client-side state restored:
- `selectedModelIdModel3`: live selection for comparison model
- `submittedModelIdModel3`: value used in panel copy after submit (with fallback)

Existing request body remains `{ prompt, model }` for left/right requests.

# Validation/Error Handling

- Prompt validation flow remains unchanged.
- Existing left/right success/error rendering remains unchanged.
- Comparison error message remains descriptor-based over outer request errors.
- Comparison placeholder/heading copy restored to pre-removal behavior.

# Security

- No new network surfaces beyond current two-query flow.
- No secret-handling changes.
- Existing error sanitization behavior is preserved.

# Accessibility

- Restore Model 3 label/control semantics.
- Restore comparison panel status/heading/content semantics.
- Maintain predictable keyboard flow and no regression of existing a11y checks.

# Testing

## Unit/UI

- Restore selector tests for Model 3 rendering/events/options parity.
- Restore app UI tests for comparison loading/placeholder/error branches.
- Restore app a11y tests for third selector/panel semantics.

Target command:
- `npm run test:unit -- tests/unit/models-selector.test.ts tests/unit/app.ui.test.ts tests/unit/app.a11y.test.ts`

## End-to-End

- Restore Model 3 selector helper and assertions.
- Restore comparison-panel assertions in happy-path/loading/error scenarios.
- Keep two-request behavior assertions.

Target command:
- `npx playwright test tests/e2e/app.spec.ts tests/e2e/accessibility.spec.ts tests/e2e/models-selector.spec.ts`

## Broader Checks

- `npm run typecheck`
- `npm test`
- `npm run lint`

# Assumptions

- Pre-removal implementation in branch history is available as behavior reference.
- Current test harness remains stable.

# Constraints

- Minimal, targeted restoration-only changes.
- No unrelated refactors.

# Open Questions

None.

# Traceability

| Requirement ID | Design Section | Notes |
|----------------|----------------|-------|
| FR-1 | Interfaces; Architecture; Testing | Restores Model 3 selector rendering and queryability. |
| FR-2 | Interfaces; Architecture; Testing | Restores third comparison panel rendering and branches. |
| FR-3 | Interfaces; Data; Architecture | Restores Model 3 state/event wiring and fallback usage. |
| FR-4 | Data; Validation/Error Handling; Testing | Preserves existing two-request outer flow and semantics. |
| TR-1 | Architecture | Constrains edits to restoration scope. |
| TR-2 | Interfaces; Architecture | Re-enables prior Model 3 contracts in component/app surfaces. |
| TR-3 | Testing | Restores unit/e2e coverage for three-part UI. |
| TR-4 | Data; Security | Confirms unchanged public contracts. |
| SR-1 | Security; Validation/Error Handling | Preserves sanitized client-safe error behavior. |
| SR-2 | Security; Data; Testing | Confirms no added backend request surfaces. |
| AR-1 | Accessibility; Interfaces; Testing | Restores accessible Model 3 semantics. |
| AR-2 | Accessibility; Interfaces; Testing | Restores comparison-panel perceivability semantics. |
| AR-3 | Accessibility; Testing | Maintains no-regression accessibility checks. |
| PR-1 | Data; Testing | Keeps two `/api/respond` requests per submit. |
