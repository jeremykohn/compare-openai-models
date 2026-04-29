# Overview

This update hides/removes the Model 3 dropdown and the third comparison output panel from active UI while preserving the existing two-model query flow. The implementation is intentionally reversible by keeping logic changes localized to render/wiring surfaces and related tests.

Goals:
- Remove Model 3 selector from active rendered form.
- Remove comparison output panel from active rendered outputs.
- Keep two-request behavior, request payload shape, and left/right state handling unchanged.
- Keep update easy to reverse in a later commit.

Out of scope:
- Backend/API contract changes
- New feature flags/infrastructure
- Permanent deletion of all comparison logic

# Architecture

## High-Level Approach

1. Update selector rendering to expose only Model 1 and Model 2 controls in active UI.
2. Remove comparison panel rendering block from active output area.
3. Keep existing two-request submit logic and per-side request state behavior unchanged.
4. Remove or isolate now-unused Model 3 view-state wiring if it is no longer required by active rendering.
5. Update tests that currently assert third selector/panel visibility.

## Affected Surfaces

- `app/components/ModelsSelector.vue`
  - Remove Model 3 field rendering and related emit/prop usage from active template.
- `app/app.vue`
  - Remove Model 3 binding usage in template.
  - Remove comparison panel render branch from template.
  - Keep two-model request flow and output panels unchanged.
- Tests
  - `tests/unit/models-selector.test.ts`
  - `tests/unit/app.ui.test.ts`
  - `tests/unit/app.a11y.test.ts`
  - `tests/e2e/helpers/selectors.ts`
  - `tests/e2e/app.spec.ts`
  - `tests/e2e/accessibility.spec.ts`
  - `tests/e2e/models-selector.spec.ts` (if it references Model 3)

# Interfaces

## UI Surface Contract

After this update, active UI exposes:
- Two model selectors: `Model 1`, `Model 2`
- Two output panels corresponding to Model 1 and Model 2 states

Active UI must not expose:
- Model 3 selector
- Comparison panel heading/message/loading/error elements

## Event/State Interface

- Selector update events remain for Model 1/Model 2 only in active UI path.
- Submit handler continues sending two requests (one per model selector).
- No new interface or public contract is introduced.

# Data

No backend data model changes are required.

Client-side state handling:
- Retain per-side request state (`model1`, `model2`) unchanged.
- Remove or isolate active dependence on Model 3 view-state if no longer rendered.
- Request bodies remain `{ prompt, model }` per existing flow.

# Validation/Error Handling

- Prompt validation flow remains unchanged.
- Left/right error/success rendering remains unchanged.
- Comparison panel-specific copy/rendering is removed from active UI path.

# Security

Security impact is none for this scoped UI update.

- No new inputs introduced.
- No secret handling changes.
- No API/security boundary changes.

# Accessibility

- Remaining controls and outputs keep current semantic structure.
- Removed elements are not exposed as active controls or discoverable labels in active UI.
- Keyboard/focus order remains valid for reduced two-selector UI.

# Testing

## Unit/UI

- Update selector tests to assert only Model 1/Model 2 controls are rendered.
- Update app UI tests to remove third-panel assertions and verify two-panel behavior remains.
- Keep two-request behavior assertions intact.

Target command:
- `npm run test:unit -- tests/unit/models-selector.test.ts tests/unit/app.ui.test.ts tests/unit/app.a11y.test.ts`

## End-to-End

- Remove usage of Model 3 helper selectors from active flows.
- Assert happy-path and error flows without comparison panel expectations.
- Keep `/api/respond` dual-request assertions intact.

Target command:
- `npx playwright test tests/e2e/app.spec.ts tests/e2e/accessibility.spec.ts tests/e2e/models-selector.spec.ts`

## Broader Checks

- `npm run typecheck`
- `npm test`

# Assumptions

- Two-model-only UI is desired for this commit.
- Reversibility is achieved by preserving core logic where practical and minimizing destructive removals.

# Constraints

- Minimal, targeted changes only.
- No API/backend contract changes.
- Preserve existing two-model behavior.

# Open Questions

None.

# Traceability

| Requirement ID | Design Section | Notes |
|----------------|----------------|-------|
| FR-1 | Interfaces; Architecture; Testing | Removes Model 3 selector from active UI rendering and assertions. |
| FR-2 | Interfaces; Architecture; Testing | Removes third comparison panel rendering and related assertions. |
| FR-3 | Architecture; Data; Validation/Error Handling; Testing | Preserves two-request flow and left/right state behavior. |
| FR-4 | Architecture; Constraints | Uses localized UI/render changes for easy future restoration. |
| TR-1 | Architecture; Testing | Keeps changes scoped to UI/render and related tests. |
| TR-2 | Interfaces; Accessibility; Testing | Ensures removed elements are not active/reachable. |
| TR-3 | Testing | Updates unit/e2e suites for two-selector/two-panel UI. |
| TR-4 | Data; Security | Confirms no public contract changes. |
| AR-1 | Accessibility; Interfaces; Testing | Maintains accessible labels/flow for remaining controls. |
| AR-2 | Accessibility; Interfaces; Testing | Ensures removed controls/content are not exposed in active UI. |
| AR-3 | Accessibility; Testing | Keeps accessibility checks passing after UI simplification. |
