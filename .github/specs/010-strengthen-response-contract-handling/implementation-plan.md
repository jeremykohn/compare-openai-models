# Implementation Plan — Enforce Full `/api/respond` Success Contract (`response` + `model`)

## Phase 1 — Contract Hardening in Client Success Path

### Objective
Enforce strict success payload validation and propagate server-returned model identity through side-specific response handling.

### Tasks
- [x] Strengthen success payload guard to require `response` and `model`
  - Task ID: P1-T1
  - Description: Update `isRespondSuccessPayload()` in `app/utils/type-guards.ts` so success is recognized only when both `response` and `model` exist as strings.
  - Dependencies: None
  - Validation command: `npm run test:unit -- tests/unit/app.ui.test.ts`
  - Expected result: Payloads missing `model` no longer pass success checks.

- [x] Propagate returned model in request success result
  - Task ID: P1-T2
  - Description: Update `runSingleQuery()` in `app/app.vue` to return both `response` and `model` for successful calls and consume both in side state updates.
  - Dependencies: P1-T1
  - Validation command: `npm run test:unit -- tests/unit/app.ui.test.ts`
  - Expected result: Side success flow stores server-confirmed model identity alongside response data.

- [x] Derive headings from server-confirmed side model values
  - Task ID: P1-T3
  - Description: Update heading source logic in `app/app.vue` so each side heading reflects returned model value rather than only submitted selection snapshots.
  - Dependencies: P1-T2
  - Validation command: `npm run test:unit -- tests/unit/app.ui.test.ts`
  - Expected result: Heading text matches returned model values for each resolved side.

### Validation
- `npm run test:unit -- tests/unit/app.ui.test.ts`

### Exit Criteria
Done when client success detection is strict, side success flows carry returned model identity, and headings use server-confirmed model values.

---

## Phase 2 — Error-Path Preservation and Contract Regression Coverage

### Objective
Ensure malformed success-shaped payloads route through normalized error handling while preserving route-contract stability and accessibility semantics.

### Tasks
- [x] Add unit coverage for malformed success payloads and heading correctness
  - Task ID: P2-T1
  - Description: Update `tests/unit/app.ui.test.ts` for cases covering missing `model`, invalid types, and submitted-vs-returned model mismatch heading behavior.
  - Dependencies: P1-T1, P1-T3
  - Validation command: `npm run test:unit -- tests/unit/app.ui.test.ts`
  - Expected result: Tests fail without strict contract handling and pass with updated logic.

- [x] Confirm integration contract remains `{ response, model }`
  - Task ID: P2-T2
  - Description: Validate/update `tests/integration/respond-route.test.ts` assertions to keep route success shape stable without widening contract scope.
  - Dependencies: None
  - Validation command: `npm run test:integration -- tests/integration/respond-route.test.ts`
  - Expected result: Integration tests pass and preserve canonical route success contract.

- [x] Verify accessibility semantics remain intact after heading source changes
  - Task ID: P2-T3
  - Description: Run and adjust a11y assertions as needed to ensure semantic headings and panel labeling remain intact after model-source updates.
  - Dependencies: P1-T3
  - Validation command: `npm run test:a11y`
  - Expected result: Accessibility suites pass with no semantic regression.

### Validation
- `npm run test:unit -- tests/unit/app.ui.test.ts`
- `npm run test:integration -- tests/integration/respond-route.test.ts`
- `npm run test:a11y`

### Exit Criteria
Done when malformed payloads consistently fail into normalized error handling, route contract remains stable, and accessibility checks pass.

---

## Phase 3 — Final Verification and Quality Gates

### Objective
Complete focused and full validation to ensure contract hardening is robust, secure-by-default, and merge-ready.

### Tasks
- [x] Run focused regression suite for affected areas
  - Task ID: P3-T1
  - Description: Execute focused unit and integration tests tied to success contract handling and heading behavior.
  - Dependencies: P2-T1, P2-T2
  - Validation command: `npm run test:unit -- tests/unit/app.ui.test.ts && npm run test:integration -- tests/integration/respond-route.test.ts`
  - Expected result: Focused suites pass with strict contract behavior enforced.

- [x] Run full repository quality gates
  - Task ID: P3-T2
  - Description: Execute full quality gates to ensure no regressions across type system, test matrix, or linting.
  - Dependencies: P3-T1, P2-T3
  - Validation command: `npm run typecheck && npm test && npm run lint`
  - Expected result: Typecheck, all tests, and lint pass.

### Validation
- `npm run typecheck && npm test && npm run lint`

### Exit Criteria
Done when focused and full validation pass and no regressions are introduced.

---

## Risks, Assumptions, and Dependencies
- Risk: Stricter validation may surface existing malformed backend or mock responses.
  - Mitigation: Route these cases through existing normalized error handling and update tests/mocks to contract-compliant shapes.
- Risk: Heading source migration could break expected UI assertions.
  - Mitigation: Add explicit mismatch tests and semantic heading assertions.
- Assumption: Backend success response remains `{ response, model }`.
- Dependency: Existing error normalization/logging utilities remain unchanged and available.

## Traceability
| Phase / Task ID | Design Section | Notes |
| --------------- | -------------- | ----- |
| P1-T1 | Architecture; Data; Validation/Error Handling | Implements strict success-shape checks (`response` + `model`). |
| P1-T2 | Data; Interfaces | Propagates returned model through side-success flow. |
| P1-T3 | Interfaces; Data; Accessibility | Updates heading source to server-confirmed model while preserving semantics. |
| P2-T1 | Testing; Validation/Error Handling | Verifies malformed payload rejection and heading correctness. |
| P2-T2 | Interfaces; Testing | Preserves route success contract stability in integration coverage. |
| P2-T3 | Accessibility; Testing | Guards against semantic a11y regression from heading data-source changes. |
| P3-T1 | Testing | Focused regression run for contract hardening behavior. |
| P3-T2 | Testing; Security | Final quality-gate verification for secure-by-default behavior and no regressions. |

## Run History

> **Prompt 6 run — 2026-04-26:** No unresolved discrepancies found. Workflow complete.
