# Implementation Plan

## Phase 1 — Update prompt-toggle rendering

### P1-T1: Render Model 3 prompt button only when actionable
- **File**: `app/components/ComparisonOutputPanel.vue`
- **Change**:
  - Apply conditional rendering so `comparison-model3-prompt-toggle` is shown only when `!isPromptToggleDisabled`.
  - Preserve existing click handler and ARIA attributes for visible state.
  - Remove `:disabled` binding if it is no longer needed after conditional rendering.
- **Validation command**:
  ```bash
  npm run typecheck
  ```
- **Expected result**: Component compiles and button visibility matches actionability.

## Phase 2 — Update unit tests

### P2-T1: Assert visibility semantics in app UI unit tests
- **File**: `tests/unit/app.ui.test.ts`
- **Change**:
  - Keep existing success-path assertion that toggle is present and expandable.
  - Add or update assertions so non-actionable states expect toggle absence (not disabled presence).
- **Validation command**:
  ```bash
  npm run test:unit
  ```
- **Expected result**: Unit tests pass with new visibility expectations.

## Phase 3 — Update e2e tests (if impacted)

### P3-T1: Align e2e expectations with conditional rendering
- **File**: `tests/e2e/app.spec.ts` (if needed)
- **Change**:
  - Ensure happy-path checks still assert visible prompt toggle when comparison succeeds.
  - Update any test that expects a disabled-but-visible toggle in non-actionable states.
- **Validation command**:
  ```bash
  npm run test:e2e -- tests/e2e/app.spec.ts
  ```
- **Expected result**: E2E spec passes with updated toggle visibility behavior.

## Phase 4 — Full quality verification

### P4-T1: Run complete checks
- **Validation command**:
  ```bash
  npm run typecheck && npm test && npm run lint
  ```
- **Expected result**: All quality gates pass.

## Post-Phase Find-and-Fix

After each phase:
1. Resolve any failing assertions caused by visibility changes before proceeding.
2. Keep changes scoped to prompt-toggle rendering and directly impacted tests.
3. Avoid modifying request flow or prompt-generation logic.

## Run History


> **Prompt 5 run — 2026-05-05:** Updated `app/components/ComparisonOutputPanel.vue` so `comparison-model3-prompt-toggle` renders only when actionable (`v-if="!isPromptToggleDisabled"`), removing disabled-only visibility. Preserved existing toggle interaction and ARIA behavior when present. Updated `tests/unit/app.ui.test.ts` to assert toggle absence in non-actionable states (Model 3 loading and outer-error/no-model3-query path) and retained success-path visibility assertions. Updated `tests/e2e/app.spec.ts` to assert toggle is hidden before success and hidden in Model 3 error state while remaining visible in success flow. Ran validation: `npm run test:unit`, `npm run test:e2e -- tests/e2e/app.spec.ts`, `npm run typecheck && npm test && npm run lint`.
>
> **Prompt 6 run — 2026-05-05:** Performed discrepancy review against `description.md`, `requirements.md`, and `design.md` using the current post-stash state. Verified `app/components/ComparisonOutputPanel.vue` renders `comparison-model3-prompt-toggle` only when actionable (`v-if="!isPromptToggleDisabled"`), verified button semantics and toggle behavior remain intact when visible, and confirmed non-actionable-state absence assertions in `tests/unit/app.ui.test.ts` and `tests/e2e/app.spec.ts`. No discrepancies found; no code changes required.
