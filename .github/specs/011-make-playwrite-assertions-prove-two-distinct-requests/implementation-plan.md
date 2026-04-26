# Implementation Plan — Prove Two Distinct `/api/respond` Requests in Playwright

## Phase 1 — Deterministic Request-Evidence Capture in E2E

### Objective

Replace fragile duplicate generic response waits with deterministic evidence capture proving two distinct `/api/respond` POST requests per submit.

### Tasks

- [x] Introduce deterministic request capture in app e2e flow
  - Task ID: P1-T1
  - Description: Refactor `tests/e2e/app.spec.ts` to capture `/api/respond` request instances using interception/listener strategy and assert exact request count (`=== 2`) per single submit.
  - Dependencies: None
  - Validation command: `npm run test:e2e -- tests/e2e/app.spec.ts`
  - Expected result: Test fails when only one request is emitted and passes only with two distinct captured requests.

- [x] Assert request-body distinctness for left/right model selections
  - Task ID: P1-T2
  - Description: Add assertions in `tests/e2e/app.spec.ts` that captured request bodies include expected model IDs and prove distinctness when left/right selections differ.
  - Dependencies: P1-T1
  - Validation command: `npm run test:e2e -- tests/e2e/app.spec.ts`
  - Expected result: Test fails if both requests incorrectly target the same model under differing selections.

- [x] Optional helper extraction for reusable dual-request capture
  - Task ID: P1-T3
  - Description: If duplication appears, extend `tests/e2e/helpers/mock-api.ts` with helper(s) for collecting request snapshots and awaiting expected request counts.
  - Dependencies: P1-T1
  - Validation command: `npm run test:e2e -- tests/e2e/app.spec.ts`
  - Expected result: Shared helper improves readability without reducing assertion specificity.

### Validation

- `npm run test:e2e -- tests/e2e/app.spec.ts`

### Exit Criteria

Done when app e2e deterministically proves two distinct requests with request-body evidence.

---

## Phase 2 — Accessibility E2E Alignment and Flake Resistance

### Objective

Align accessibility e2e success assertions to dual-request completion and reduce race-prone timing behavior.

### Tasks

- [x] Gate accessibility success assertions on dual-request completion
  - Task ID: P2-T1
  - Description: Update `tests/e2e/accessibility.spec.ts` success path to wait for evidence that both `/api/respond` requests complete before asserting output headings/content.
  - Dependencies: P1-T1
  - Validation command: `npm run test:a11y:e2e`
  - Expected result: Accessibility success assertions no longer pass after only one request.

- [x] Harden request/body parsing in tests with explicit failure modes
  - Task ID: P2-T2
  - Description: Ensure captured request-body parsing in e2e tests fails clearly for malformed data rather than silently passing on weak conditions.
  - Dependencies: P1-T1
  - Validation command: `npm run test:e2e -- tests/e2e/accessibility.spec.ts`
  - Expected result: Test failures clearly identify malformed request evidence instead of producing flaky/ambiguous outcomes.

- [x] Preserve scenario coverage intent while changing wait mechanics
  - Task ID: P2-T3
  - Description: Confirm happy-path/error-path/typed-metadata/a11y scenarios remain covered after deterministic wait refactors.
  - Dependencies: P1-T1, P2-T1
  - Validation command: `npm run test:e2e -- tests/e2e/app.spec.ts && npm run test:e2e -- tests/e2e/accessibility.spec.ts`
  - Expected result: Existing scenario intent remains intact with stronger request-proof assertions.

### Validation

- `npm run test:e2e -- tests/e2e/app.spec.ts && npm run test:e2e -- tests/e2e/accessibility.spec.ts`
- `npm run test:a11y:e2e`

### Exit Criteria

Done when accessibility and app e2e suites are deterministic, dual-request-aware, and stable.

---

## Phase 3 — Final Verification and Quality Gates

### Objective

Complete full validation and ensure test-only hardening introduces no regressions.

### Tasks

- [x] Run focused e2e regression commands
  - Task ID: P3-T1
  - Description: Execute focused browser test commands for app and accessibility suites after request-proof refactor.
  - Dependencies: P2-T3
  - Validation command: `npm run test:e2e -- tests/e2e/app.spec.ts && npm run test:a11y:e2e`
  - Expected result: Focused suites pass consistently across repeated runs.

- [x] Run full repository quality gates
  - Task ID: P3-T2
  - Description: Execute full quality checks to ensure no side effects from e2e assertion changes.
  - Dependencies: P3-T1
  - Validation command: `npm run typecheck && npm test && npm run lint`
  - Expected result: Typecheck, tests, and lint pass.

### Validation

- `npm run typecheck && npm test && npm run lint`

### Exit Criteria

Done when deterministic dual-request assertions are in place and full quality gates pass.

---

## Risks, Assumptions, and Dependencies

- Risk: Over-constrained waits can introduce flakiness.
  - Mitigation: Use condition-based waits tied to captured request evidence instead of timing-only waits.
- Risk: Helper abstraction may hide important assertion detail.
  - Mitigation: Keep helpers thin and assertions explicit in test bodies.
- Assumption: App continues to issue two `/api/respond` requests per submit.
- Dependency: Playwright interception/listener APIs remain available in current test environment.

## Traceability

| Phase / Task ID | Design Section                          | Notes                                                                       |
| --------------- | --------------------------------------- | --------------------------------------------------------------------------- |
| P1-T1           | Architecture; Interfaces; Data; Testing | Replaces duplicate generic waits with deterministic request-count evidence. |
| P1-T2           | Interfaces; Data; Testing               | Proves distinct request targets through request-body model assertions.      |
| P1-T3           | Interfaces; Testing                     | Optional helper extraction for reusable deterministic capture mechanics.    |
| P2-T1           | Accessibility; Testing; Data            | Aligns accessibility success assertions to completion of both requests.     |
| P2-T2           | Validation/Error Handling; Testing      | Improves failure clarity for malformed request evidence parsing.            |
| P2-T3           | Testing; Architecture                   | Preserves scenario coverage intent while strengthening wait logic.          |
| P3-T1           | Testing; Accessibility                  | Confirms focused suite stability after deterministic assertion refactor.    |
| P3-T2           | Testing; Security                       | Final quality-gate run to ensure no broad regressions from test hardening.  |

## Run History

> **Prompt 6 run — 2026-04-26:** No unresolved discrepancies found. Workflow complete.
