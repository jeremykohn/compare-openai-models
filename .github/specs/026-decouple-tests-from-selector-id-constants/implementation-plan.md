# Implementation Plan

## Phase 1 — Establish explicit selector-ID contract assertions

### Objective
Ensure at least one stable contract-level test path verifies selector IDs via explicit literals (`model1-select`, `model2-select`, `model3-select`) rather than relying only on production constants.

### Tasks
- [x] Add explicit literal selector-ID contract assertions in unit coverage
  - `Task ID: P1-T1`
  - `Description: Update `tests/unit/models-selector.test.ts` to include explicit literal assertions for selector IDs and their key associations in at least one contract-focused test path.`
  - `Dependencies: None`
  - `Validation command: npm run test:unit -- tests/unit/models-selector.test.ts`
  - `Expected result: Unit tests fail on selector-ID drift even if production constants change in lockstep.`

- [x] Add explicit literal selector-ID contract assertions in e2e smoke coverage
  - `Task ID: P1-T2`
  - `Description: Update `tests/e2e/app.spec.ts` (or equivalent smoke path) so at least one test asserts literal selectors `#model1-select`, `#model2-select`, and `#model3-select` directly.`
  - `Dependencies: P1-T1`
  - `Validation command: npm run test:e2e -- tests/e2e/app.spec.ts`
  - `Expected result: E2E smoke detects selector-ID contract regressions independent of shared production constants.`

### Validation
- Confirm literal contract assertions exist in stable unit/e2e paths.
- Confirm contract assertions do not weaken existing behavior checks.

### Exit Criteria
Done when explicit literal selector-ID contract assertions are present and passing in at least one stable unit and/or e2e contract path.

## Phase 2 — Preserve helper maintainability while preventing exclusive coupling

### Objective
Retain useful selector helpers/constants for non-contract assertions while ensuring tests are not exclusively coupled to production ID constants.

### Tasks
- [x] Align selector helpers/tests to preserve readability and non-contract abstraction
  - `Task ID: P2-T1`
  - `Description: Review `tests/e2e/helpers/selectors.ts` and related tests to keep helper abstraction for non-contract checks without removing explicit literal contract coverage added in Phase 1.`
  - `Dependencies: P1-T2`
  - `Validation command: npm run test:e2e -- tests/e2e/models-selector.spec.ts tests/e2e/app.spec.ts`
  - `Expected result: Helpers remain maintainable, and contract checks remain explicit and independent.`

- [x] Verify accessibility-linked ID assertions remain robust
  - `Task ID: P2-T2`
  - `Description: Ensure selector-ID checks continue to cover accessibility-relevant relationships (for/id and described-by semantics) in unit/a11y coverage.`
  - `Dependencies: P1-T1`
  - `Validation command: npm run test:unit -- tests/unit/models-selector.test.ts tests/unit/app.a11y.test.ts`
  - `Expected result: Accessibility-linked selector-ID regressions are detectable without exclusive reliance on production constants.`

### Validation
- Confirm helper abstraction remains for non-contract checks.
- Confirm explicit contract checks remain discoverable and authoritative.

### Exit Criteria
Done when test readability is preserved and selector-ID contract checks are not exclusively tied to production constants.

## Phase 3 — Regression and integration verification

### Objective
Validate behavior parity and repository-wide quality after decoupling test contract assertions.

### Tasks
- [x] Run targeted selector regression suites
  - `Task ID: P3-T1`
  - `Description: Execute targeted unit and e2e suites relevant to selector IDs and contract assertions.`
  - `Dependencies: P2-T1, P2-T2`
  - `Validation command: npm run test:unit -- tests/unit/models-selector.test.ts tests/unit/app.a11y.test.ts && npm run test:e2e -- tests/e2e/models-selector.spec.ts tests/e2e/app.spec.ts`
  - `Expected result: Targeted suites pass and confirm no behavior regression from test decoupling changes.`

- [x] Run full repository quality gates
  - `Task ID: P3-T2`
  - `Description: Execute full integration quality checks to ensure the update is safe to merge.`
  - `Dependencies: P3-T1`
  - `Validation command: npm run typecheck && npm test && npm run lint`
  - `Expected result: Typecheck, full tests, and lint all pass.`

### Validation
- Confirm selector runtime behavior remains unchanged.
- Confirm all quality gates pass.

### Exit Criteria
Done when targeted and full validations pass with behavior-equivalent output.

## Risks and Mitigations

- **Risk:** Contract assertions are re-abstracted and lose independence over time.
  - **Mitigation:** Keep explicit literal assertions in designated contract tests.
- **Risk:** Changes to test selectors reduce readability.
  - **Mitigation:** Restrict literals to contract-focused tests and keep helper abstractions elsewhere.
- **Risk:** Accessibility ID relationships drift without detection.
  - **Mitigation:** Preserve explicit assertions for label/ID and described-by semantics.

## Assumptions

- Selector IDs are a stable contract in current scope.
- Existing selector behavior is canonical and must remain unchanged.

## Dependencies

- Existing selector components and tests under `app/components/` and `tests/**`.
- Existing test and lint tooling configured in project scripts.

## Traceability

| Phase / Task ID | Design Section | Notes |
| --------------- | -------------- | ----- |
| Phase 1 | Overview; Interfaces; Testing | Establishes explicit literal contract assertions for selector IDs. |
| P1-T1 | Interfaces; Accessibility; Testing | Adds unit-level explicit literal selector-ID contract checks. |
| P1-T2 | Interfaces; Testing | Adds e2e smoke-level explicit literal selector-ID contract checks. |
| Phase 2 | Architecture; Interfaces; Accessibility; Testing | Balances maintainable helpers with non-exclusive contract assertions. |
| P2-T1 | Architecture; Interfaces; Testing | Keeps helper maintainability while preserving independent contract checks. |
| P2-T2 | Accessibility; Interfaces; Testing | Ensures accessibility-linked ID assertions remain robust. |
| Phase 3 | Testing | Verifies behavior parity and integration safety. |
| P3-T1 | Testing; Accessibility | Executes targeted suites for selector contract and a11y validation. |
| P3-T2 | Testing | Executes full repository quality gates. |

## Run History

> **Prompt 6 run — 2026-04-29:** No unresolved discrepancies found. Workflow complete.
