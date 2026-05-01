# Implementation Plan

## Phase 1 — Switch Model 3 template source import

### P1-T1: Update template import in `use-comparison-ui-state.ts`
- **File**: `app/composables/use-comparison-ui-state.ts`
- **Change**: Replace raw import path from `prompt-comparison-template.md?raw` to `model-3-prompt-template.md?raw`.
- **Validation command**:
  ```bash
  npm run typecheck
  ```
- **Expected result**: Build/typecheck succeeds; no contract changes.

## Phase 2 — Verify tests and quality gates

### P2-T1: Execute test suite
- **Validation command**:
  ```bash
  npm test
  ```
- **Expected result**: Unit and integration suites pass with no regressions.

### P2-T2: Execute lint and formatting checks
- **Validation command**:
  ```bash
  npm run lint
  ```
- **Expected result**: Lint/type/format checks pass.

## Post-Phase Find-and-Fix

After each phase:
1. Fix any import/path/type issues related to the template switch.
2. Fix any test assertions that are source-file-coupled.
3. Re-run failed checks until green.

## Run History

> _(Append dated entries after Prompt 5 and Prompt 6 runs.)_
> **Prompt 5 run — 2026-05-01:** Switched Model 3 template import in `app/composables/use-comparison-ui-state.ts` from `prompt-comparison-template.md?raw` to `model-3-prompt-template.md?raw`. Validation passed: `npm run typecheck`, `npm test` (unit 94 + integration 13), and `npm run lint`.
> **Prompt 6 run — 2026-05-01:** Discrepancy review completed for spec `033`. No mismatches found between `description.md`, `requirements.md`, `design.md`, implementation, and validation results. No additional code changes required.
