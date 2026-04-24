# Implementation Plan: Fix Issues from TypeScript/Vue Review

**Source design:** `.github/specs/005-fix-issues/design.md`
**Output artifact:** `.github/specs/005-fix-issues/implementation-plan.md`

## Phase 1 — Fix Submit Success-Path Safety in `app/app.vue`

### Objective
Eliminate compile/runtime risk in the submit success path by replacing unsafe casts with explicit runtime payload validation before calling `succeed()`.

### Tasks
- [x] Implement runtime success payload guard for `/api/respond`
  - Task ID: P1-T1
  - Description: Add a guard that verifies `response` is a string before transitioning request state to success.
  - Dependencies: None
  - Validation command: npm run typecheck
  - Expected result: TypeScript compile errors in `app/app.vue` success-path casting/access are removed.

- [x] Route malformed `response.ok` payloads through normalized error handling
  - Task ID: P1-T2
  - Description: Update `handleSubmit` to treat malformed successful payloads as normalized failures (`normalizeUiError` + `fail`) instead of assuming success shape.
  - Dependencies: P1-T1
  - Validation command: npx vitest run --config vitest.unit.config.ts tests/unit/app.ui.test.ts
  - Expected result: Unit tests verify malformed success payloads do not call `succeed()` and instead render error state safely.

- [x] Add regression tests for malformed submit success payload
  - Task ID: P1-T3
  - Description: Add/adjust unit tests to assert invalid success payload shapes from `/api/respond` are handled as normalized errors.
  - Dependencies: P1-T2
  - Validation command: npx vitest run --config vitest.unit.config.ts tests/unit/app.ui.test.ts
  - Expected result: New regression test(s) pass and enforce guarded success-path behavior.

### Validation
- Run `npm run typecheck` after success-path changes.
- Run targeted submit-flow unit tests for malformed success payload handling.

### Exit Criteria (Done when...)
- Unsafe success-path cast/access is removed.
- Malformed `response.ok` payloads are handled via normalized error flow.
- Submit-path regression tests pass.

---

## Phase 2 — Harden Models Success Payload Handling

### Objective
Prevent invalid `ModelsApiResponse` shapes from entering success state by adding runtime payload validation in the models composable.

### Tasks
- [x] Implement `ModelsApiResponse` runtime shape guard
  - Task ID: P2-T1
  - Description: Add composable-local payload guard for expected `ModelsApiResponse` structure (`object`, `data`, `usedConfigFilter`, `showFallbackNote`).
  - Dependencies: None
  - Validation command: npx vitest run --config vitest.unit.config.ts tests/unit/models-selector.test.ts
  - Expected result: Models selector tests continue to pass with guarded payload handling logic.

- [x] Normalize malformed successful models payloads as error state
  - Task ID: P2-T2
  - Description: Update `fetchModels` to send malformed `response.ok` payloads through normalized/logged error flow and avoid invalid `success` state assignment.
  - Dependencies: P2-T1
  - Validation command: npx vitest run --config vitest.config.ts tests/integration/models.test.ts
  - Expected result: Integration behavior remains correct for valid payloads and safely handles malformed success payloads.

- [x] Add regression tests for malformed models success payload
  - Task ID: P2-T3
  - Description: Add/adjust tests to assert malformed success payloads in models flow do not produce invalid `data` state.
  - Dependencies: P2-T2
  - Validation command: npx vitest run --config vitest.unit.config.ts tests/unit/models-selector.test.ts
  - Expected result: New regression tests pass and guard against future payload-shape regressions.

### Validation
- Run targeted unit tests for `ModelsSelector` behavior.
- Run integration tests for `/api/models` route/composable interaction.

### Exit Criteria (Done when...)
- Runtime payload guard exists for models success responses.
- Malformed success payloads transition to normalized error state.
- Models regression tests pass.

---

## Phase 3 — Improve Normalization Classification and Details Policy

### Objective
Broaden API error classification signals (without weakening network precedence) and enforce consistent 256-character `details` policy across API and fallback paths.

### Tasks
- [x] Expand API error detection beyond `message`-only presence
  - Task ID: P3-T1
  - Description: Update type guards/normalization checks so typed metadata (`type`, `code`, `param`) and valid HTTP status hints can classify API errors when `message` is absent.
  - Dependencies: None
  - Validation command: npx vitest run --config vitest.unit.config.ts tests/unit/error-normalization.test.ts
  - Expected result: Unit tests confirm typed metadata/status-only payloads are classified as API where appropriate.

- [x] Preserve network detection precedence in normalization
  - Task ID: P3-T2
  - Description: Ensure expanded API classification does not override existing network error detection semantics.
  - Dependencies: P3-T1
  - Validation command: npx vitest run --config vitest.unit.config.ts tests/unit/error-normalization.test.ts
  - Expected result: Network error cases still normalize to `category: "network"` and omit API-only assumptions.

- [x] Apply consistent details truncation policy for API details path
  - Task ID: P3-T3
  - Description: Enforce the same `details` sanitization + max-length behavior for API details as fallback details.
  - Dependencies: P3-T1
  - Validation command: npx vitest run --config vitest.unit.config.ts tests/unit/error-normalization.test.ts
  - Expected result: Tests verify API and fallback details are both bounded to 256 characters post-sanitization.

- [x] Add targeted normalization/UI compatibility regression tests
  - Task ID: P3-T4
  - Description: Extend unit coverage to include typed-metadata-without-message scenarios and validate compatibility with existing alert rendering behavior.
  - Dependencies: P3-T2, P3-T3
  - Validation command: npx vitest run --config vitest.unit.config.ts tests/unit/error-normalization.test.ts tests/unit/ui-error-alert.test.ts
  - Expected result: Regression tests pass and prevent category/details policy drift.

### Validation
- Run targeted normalization tests.
- Run UI alert tests to ensure rendered fields remain stable after classification updates.

### Exit Criteria (Done when...)
- Typed metadata/status-only API payloads are classified correctly.
- Network precedence remains intact.
- `details` max-length policy is consistent across paths.
- Normalization/UI regression tests pass.

---

## Phase 4 — End-to-End Verification and Quality Gate

### Objective
Validate all implemented fixes together and ensure typecheck, tests, and lint gates pass for production readiness.

### Tasks
- [x] Run focused verification for changed behavior areas
  - Task ID: P4-T1
  - Description: Execute targeted test suites covering submit flow, models flow, normalization, and UI alert behavior.
  - Dependencies: P1-T3, P2-T3, P3-T4
  - Validation command: npx vitest run --config vitest.unit.config.ts tests/unit/app.ui.test.ts tests/unit/models-selector.test.ts tests/unit/error-normalization.test.ts tests/unit/ui-error-alert.test.ts
  - Expected result: All focused tests pass with no regressions in changed flows.

- [x] Run full project test suite
  - Task ID: P4-T2
  - Description: Execute full unit/integration/e2e test coverage to confirm no cross-area regressions.
  - Dependencies: P4-T1
  - Validation command: npm test
  - Expected result: Full test suite passes.

- [x] Run static quality gates
  - Task ID: P4-T3
  - Description: Run typecheck and lint to verify compile and formatting quality across all changes.
  - Dependencies: P4-T2
  - Validation command: npm run lint
  - Expected result: Typecheck, ESLint, and formatting checks pass.

### Validation
- Execute focused tests, then full test suite, then lint/typecheck.

### Exit Criteria (Done when...)
- All focused regression tests pass.
- Full test suite passes.
- Lint/typecheck passes.

---

## Risks, Assumptions, and Dependencies

- **Risk:** Overly strict runtime guards may reject payload variants that are valid but currently undocumented.
  - **Mitigation:** Keep guards minimal and aligned to existing API contracts; add targeted test fixtures for accepted variants.
- **Risk:** Broader API classification may unintentionally shift edge-case `unknown` errors to `api`.
  - **Mitigation:** Preserve network precedence and add explicit unit cases for ambiguous payloads.
- **Assumption:** Existing sanitization utilities remain the canonical path for safe user-visible error text.
- **Dependency:** Test fixtures in current suite are sufficient to cover malformed success payload scenarios once extended.

---

## Traceability

| Phase / Task ID | Design Section | Notes |
| --------------- | -------------- | ----- |
| P1-T1 | Interfaces, Data | Introduces guarded submit success payload validation (`isRespondSuccessPayload` behavior) |
| P1-T2 | Validation/Error Handling, Data | Routes malformed submit success payloads into normalized error flow |
| P1-T3 | Testing | Adds submit malformed success regression coverage |
| P2-T1 | Interfaces, Data | Introduces guarded models success payload validation (`isModelsApiResponsePayload` behavior) |
| P2-T2 | Validation/Error Handling, Data | Routes malformed models success payloads into normalized error flow |
| P2-T3 | Testing | Adds models malformed success regression coverage |
| P3-T1 | Validation/Error Handling, Interfaces | Broadens API classification signals for metadata/status-only envelopes |
| P3-T2 | Validation/Error Handling | Preserves network classification precedence |
| P3-T3 | Security, Data | Applies consistent 256-char `details` policy across API/fallback paths |
| P3-T4 | Testing | Adds normalization/UI compatibility regression coverage |
| P4-T1 | Testing | Focused verification for all changed behavior areas |
| P4-T2 | Testing | Full suite regression verification |
| P4-T3 | Security, Testing | Final lint/typecheck quality gate |

---

**Next step:** `.github/prompts/prompt-5-implement-from-plan.md` — pass this `implementation-plan.md` to begin implementation.

---

## Phase 5 — Remediation: Add Missing `models-selector.test.ts` Regression Test

### Objective
Add the malformed success payload regression test to `tests/unit/models-selector.test.ts` as specified by the design and plan task P2-T3, resolving DISC-1 and DISC-2.

### Tasks
- [x] Add malformed models success payload test to `models-selector.test.ts`
  - Task ID: P5-T1
  - Description: Add a test case in `tests/unit/models-selector.test.ts` that asserts malformed success payloads from the models composable result in error state being surfaced to `ModelsSelector`. Mount `ModelsSelector` with `status: "error"` and an `error` object that reflects the normalized error produced by the composable when a malformed success payload is received, and assert the error alert is rendered.
  - Dependencies: None
  - Validation command: `npx vitest run --config vitest.unit.config.ts tests/unit/models-selector.test.ts`
  - Expected result: New test passes; all existing `models-selector.test.ts` tests continue to pass.

### Validation
- Run `npx vitest run --config vitest.unit.config.ts tests/unit/models-selector.test.ts` after adding the test.
- Run `npm test` to confirm no regressions.

### Exit Criteria (Done when...)
- `tests/unit/models-selector.test.ts` contains a test case exercising malformed success payload → error state → `ModelsSelector` renders error.
- All tests pass.

### Resolution Mapping

| Discrepancy ID | Planned Task | Validation |
|----------------|--------------|------------|
| DISC-1 | P5-T1 | `npx vitest run --config vitest.unit.config.ts tests/unit/models-selector.test.ts` |
| DISC-2 | P5-T1 | `npx vitest run --config vitest.unit.config.ts tests/unit/models-selector.test.ts` |

---

## Run History

> **Prompt 6 run — 2026-04-23:** 1 discrepancy found (DISC-1, DISC-2 are the same gap tracked across both reports). Remediation phase P5 appended. Return to Prompt 5 to implement.
> **Prompt 6 run — 2026-04-23:** No unresolved discrepancies found. Workflow complete.
