# Implementation Plan

## Phase 1 — Introduce canonical safe template assembly

### Objective
Move comparison prompt assembly to a canonical template path and dedicated safe interpolation utility.

### Tasks
- [x] Add canonical comparison template asset
  - `Task ID: P1-T1`
  - `Description: Create `server/assets/prompt-templates/prompt-comparison-template.md` with existing placeholder contract and explicit instruction that inserted sections are untrusted data.`
  - `Dependencies: None`
  - `Validation command: npm run test:unit -- tests/unit/app.ui.test.ts`
  - `Expected result: Template file exists at canonical path and composes with existing placeholders.`

- [x] Implement centralized safe interpolation utility
  - `Task ID: P1-T2`
  - `Description: Add `app/utils/prompt-template-safety.ts` with deterministic normalization, fence neutralization, marker wrapping, and placeholder substitution.`
  - `Dependencies: P1-T1`
  - `Validation command: npm run test:unit -- tests/unit/prompt-template-safety.test.ts`
  - `Expected result: Utility returns safe assembled prompt with bounded untrusted fields.`

- [x] Wire compare-state prompt generation to safe utility
  - `Task ID: P1-T3`
  - `Description: Update `app/composables/use-comparison-ui-state.ts` to import canonical template and call the safe interpolation utility instead of direct chained `replaceAll` on untrusted input.`
  - `Dependencies: P1-T2`
  - `Validation command: npm run test:unit -- tests/unit/app.ui.test.ts`
  - `Expected result: Generated prompt path uses centralized safe assembly and existing run guards.`

### Exit Criteria
Done when prompt generation uses canonical template plus safe interpolation utility in the compare-state flow.

## Phase 2 — Add hardening and regression test coverage

### Objective
Prove prompt-injection safeguards work and existing user-visible behavior remains intact.

### Tasks
- [x] Add unit tests for prompt-safety utility
  - `Task ID: P2-T1`
  - `Description: Add `tests/unit/prompt-template-safety.test.ts` covering marker insertion, triple-backtick neutralization, deterministic output, and adversarial instruction text handling.`
  - `Dependencies: P1-T2`
  - `Validation command: npm run test:unit -- tests/unit/prompt-template-safety.test.ts`
  - `Expected result: Utility hardening behavior is verified with explicit adversarial fixtures.`

- [x] Update UI/e2e assertions for generated prompt safety invariants
  - `Task ID: P2-T2`
  - `Description: Update existing tests (`tests/unit/app.ui.test.ts`, `tests/e2e/app.spec.ts`) to assert generated prompt remains visible under toggle and includes safety marker invariants without regressing behavior.`
  - `Dependencies: P1-T3`
  - `Validation command: npm run test:unit -- tests/unit/app.ui.test.ts && npm run test:e2e -- tests/e2e/app.spec.ts`
  - `Expected result: Existing compare behavior remains valid and safety structure is covered.`

### Exit Criteria
Done when hardening and regression tests pass with stable assertions.

## Phase 3 — Validate and close

### Objective
Confirm integration quality and finalize workflow.

### Tasks
- [x] Run full repository quality gates
  - `Task ID: P3-T1`
  - `Description: Run typecheck, full tests, and lint for in-scope changes.`
  - `Dependencies: P2-T1, P2-T2`
  - `Validation command: npm run typecheck && npm test && npm run lint`
  - `Expected result: All gates pass with no in-scope regressions.`

### Exit Criteria
Done when full quality gates pass and implementation is ready for discrepancy review.

## Risks and Mitigations

- **Risk:** Marker format degrades prompt readability.
  - **Mitigation:** Keep markers concise, explicit, and text-only.
- **Risk:** Template path changes break imports.
  - **Mitigation:** Update imports atomically with tests.
- **Risk:** Overly broad sanitization changes intended content.
  - **Mitigation:** Limit transformations to structural safety normalization only.

## Traceability

| Phase / Task ID | Requirement Coverage |
|---|---|
| P1-T1 | TR-1, SR-1 |
| P1-T2 | FR-1, FR-2, TR-2, SR-1, PR-1 |
| P1-T3 | FR-3, TR-1, TR-2 |
| P2-T1 | TR-3, FR-1, FR-2, SR-1 |
| P2-T2 | FR-3, TR-3, AR-1 |
| P3-T1 | TR-4 |

## Run History

> **Prompt 6 run — 2026-04-30:** No unresolved discrepancies found. Workflow complete.
