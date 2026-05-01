# Implementation Plan

## Phase 1 — Add template-text display source

### P1-T1: Import `comparison-prompt.md` for toggle display
- **Files**: `app/composables/use-comparison-ui-state.ts`
- **Change**:
  - Add raw import for `server/assets/prompt-templates/comparison-prompt.md?raw`.
  - Return a new field dedicated to toggle preview display text.
- **Validation command**:
  ```bash
  npm run typecheck
  ```
- **Expected result**: Typecheck passes and composable API remains compatible.

## Phase 2 — Rewire UI binding to use template display text

### P2-T1: Pass template-text display source to third panel
- **Files**: `app/app.vue`
- **Change**:
  - Keep `generatedModel3Prompt` for request submission logic.
  - Bind third-panel prompt-preview prop to new template-text field from composable.
- **Validation command**:
  ```bash
  npm run typecheck
  ```
- **Expected result**: Runtime prompt generation remains unchanged; preview binding compiles.

## Phase 3 — Update tests to new preview expectations

### P3-T1: Update unit assertions for toggle preview content
- **Files**: `tests/unit/app.ui.test.ts`
- **Change**:
  - Replace assertions expecting runtime-interpolated prompt content with assertions based on `comparison-prompt.md` text.
- **Validation command**:
  ```bash
  npm test
  ```
- **Expected result**: Unit tests pass with new preview-source expectations.

### P3-T2: Update e2e assertions for toggle preview content
- **Files**: `tests/e2e/app.spec.ts`
- **Change**:
  - Replace e2e prompt-preview assertions that check runtime markers/interpolated values with template-text assertions.
- **Validation command**:
  ```bash
  npm run test:e2e -- tests/e2e/app.spec.ts
  ```
- **Expected result**: Targeted e2e passes with template-source preview.

## Phase 4 — Full quality verification

### P4-T1: Run repository quality gates
- **Validation command**:
  ```bash
  npm run typecheck && npm test && npm run lint
  ```
- **Expected result**: All checks pass.

## Post-Phase Find-and-Fix

After each phase:
1. Fix type/import breakages immediately.
2. Update any brittle prompt-preview assertions tied to old runtime content.
3. Re-run failing checks before moving to next phase.

## Run History

> _(Append dated entries after Prompt 5 and Prompt 6 runs.)_
> **Prompt 5 run — 2026-05-01:** Implemented display-source switch for third-panel prompt preview. Runtime Model 3 request prompt generation remained unchanged. Updated `useComparisonUiState` to expose `comparisonPromptPreviewText` from `server/assets/prompt-templates/comparison-prompt.md`, rewired `app.vue` preview binding, and updated unit/e2e assertions to verify template-text display. Validation passed: `npm run typecheck`, `npm test` (unit 94 + integration 13), and `npm run lint`.
