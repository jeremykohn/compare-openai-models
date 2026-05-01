# Implementation Plan

## Phase 1 — Update app landing copy

### P1-T1: Change main title in `app/app.vue`
- **File**: `app/app.vue`
- **Change**: Replace `ChatGPT prompt tester` with `Compare OpenAI Models`.
- **Validation command**:
  ```bash
  npm run typecheck
  ```
- **Expected result**: App compiles with updated title text.

### P1-T2: Change subtitle in `app/app.vue`
- **File**: `app/app.vue`
- **Change**: Replace subtitle with `Send a prompt to two models, and compare the two responses using a third model.`
- **Validation command**:
  ```bash
  npm run typecheck
  ```
- **Expected result**: App compiles with updated subtitle text.

## Phase 2 — Update helper copy under dropdowns

### P2-T1: Change default-model helper text in `ModelsSelector.vue`
- **File**: `app/components/ModelsSelector.vue`
- **Change**: Replace `Uses gpt-4.1-mini by default if none is selected.` with `Each model is gpt-4.1-mini by default if not otherwise selected.`
- **Validation command**:
  ```bash
  npm run typecheck
  ```
- **Expected result**: Component compiles with updated helper text.

## Phase 3 — Update tests asserting old copy

### P3-T1: Update unit heading assertion
- **File**: `tests/unit/app.ui.test.ts`
- **Change**: Assert `Compare OpenAI Models`.
- **Validation command**:
  ```bash
  npm test
  ```
- **Expected result**: Unit tests pass with new heading copy.

### P3-T2: Update helper-text unit assertion
- **File**: `tests/unit/models-selector.test.ts`
- **Change**: Assert `Each model is gpt-4.1-mini by default if not otherwise selected.`
- **Validation command**:
  ```bash
  npm test
  ```
- **Expected result**: Unit tests pass with new helper copy.

### P3-T3: Update e2e heading assertions
- **File**: `tests/e2e/app.spec.ts`
- **Change**: Replace `ChatGPT prompt tester` heading checks with `Compare OpenAI Models`.
- **Validation command**:
  ```bash
  npm run test:e2e -- tests/e2e/app.spec.ts
  ```
- **Expected result**: E2E spec passes with updated heading copy.

## Phase 4 — Full quality gate verification

### P4-T1: Run complete checks
- **Validation command**:
  ```bash
  npm run typecheck && npm test && npm run lint
  ```
- **Expected result**: All checks pass.

## Post-Phase Find-and-Fix

After each phase:
1. Resolve any copy-assertion drift in tests.
2. Re-run failing checks before moving on.
3. Keep changes restricted to copy and directly impacted tests.

## Run History

> _(Append dated entries after Prompt 5 and Prompt 6 runs.)_
> **Prompt 5 run — 2026-05-01:** Updated page copy in `app/app.vue` (title + subtitle) and `app/components/ModelsSelector.vue` (default-model helper text). Updated copy assertions in `tests/unit/app.ui.test.ts`, `tests/unit/models-selector.test.ts`, and `tests/e2e/app.spec.ts`. Validation passed: `npm run typecheck`, `npm test` (unit 94 + integration 13), and `npm run lint` (after formatting `app/app.vue` with Prettier).
> **Prompt 6 run — 2026-05-01:** Performed discrepancy review between spec artifacts (`description.md`, `requirements.md`, `design.md`) and implementation/tests. Confirmed title/subtitle/helper copy match exact required strings in `app/app.vue` and `app/components/ModelsSelector.vue`; confirmed updated assertions in `tests/unit/app.ui.test.ts`, `tests/unit/models-selector.test.ts`, and `tests/e2e/app.spec.ts`; verified no residual old UI copy under `app/` or `tests/`. No discrepancies found; no code changes required.
