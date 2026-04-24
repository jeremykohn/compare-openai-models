# Implementation Plan: Fix Error Details Bug

**Source design:** `.github/specs/004-fix-error-details-bug/design.md`
**Output artifact:** `.github/specs/004-fix-error-details-bug/implementation-plan.md`

## Phase 1 — Error Contract and Normalization Foundation

### Objective
Establish the updated error contracts and normalization behavior so typed fields (`type`, `code`, `param`) and sanitized fallback details are preserved consistently from client/server inputs.

### Tasks
- [x] Define and apply typed error contract updates
  - Task ID: P1-T1
  - Description: Update shared error contracts (`ApiErrorResponse`, `NormalizedUiError`) to include optional `type`, `code`, `param`, and `statusText` while preserving backward compatibility with legacy `{ message, details }` payloads.
  - Dependencies: None
  - Validation command: npm run typecheck
  - Expected result: Type-check passes and updated interfaces compile without breaking existing usages.

- [x] Implement normalization extraction for typed fields
  - Task ID: P1-T2
  - Description: Extend `normalizeUiError` with coerce helpers for `type`, `code`, `param`, and robust status extraction paths for structured API errors.
  - Dependencies: P1-T1
  - Validation command: npx vitest run --config vitest.unit.config.ts tests/unit/error-normalization.test.ts
  - Expected result: Unit tests verify extraction of typed fields from top-level and nested error envelopes.

- [x] Add unknown/unsupported fallback normalization behavior
  - Task ID: P1-T3
  - Description: For unknown or unsupported error formats, normalize into sanitized stringified payload in `details`, enforce 256-character max, and ensure no user-facing `Type: unknown` outcome.
  - Dependencies: P1-T2
  - Validation command: npx vitest run --config vitest.unit.config.ts tests/unit/error-normalization.test.ts
  - Expected result: Unit tests confirm fallback details are sanitized, truncated to 256, and classification remains compatible with design rules.

- [x] Add/adjust unit tests for normalization matrix
  - Task ID: P1-T4
  - Description: Add unit cases for structured payloads, unsupported payloads, unknown objects, JSON parse fallback inputs, and token redaction in fallback details.
  - Dependencies: P1-T3
  - Validation command: npx vitest run --config vitest.unit.config.ts tests/unit/error-normalization.test.ts tests/unit/error-sanitization.test.ts
  - Expected result: New and existing normalization/sanitization tests pass with deterministic assertions.

### Validation
- Run focused unit suite for normalization and sanitization.
- Confirm 256-length policy for `details` is enforced in tests.

### Exit Criteria (Done when...)
- Contracts include required optional typed fields.
- Normalization handles structured + unknown/unsupported payloads.
- Fallback uses sanitized stringified payload in `details`.
- Unit tests cover and pass for all core normalization cases.

---

## Phase 2 — Server Error Shaping and Security Controls

### Objective
Ensure server routes return safe, structured error DTOs with fixed route-level messages, typed metadata extraction, and secure fallback behavior.

### Tasks
- [x] Implement server extraction for structured upstream error fields
  - Task ID: P2-T1
  - Description: Update `/api/respond` and `/api/models` error shaping to parse upstream JSON and extract safe `type`, `code`, `param`, and `statusText` into route error DTOs.
  - Dependencies: P1-T1
  - Validation command: npx vitest run --config vitest.config.ts tests/integration/respond-route.test.ts tests/integration/models.test.ts
  - Expected result: Integration tests verify typed field extraction from standard upstream envelopes.

- [x] Enforce fixed server message policy and secure fallback details
  - Task ID: P2-T2
  - Description: Preserve fixed route-level messages; never pass through upstream message verbatim. For unsupported payloads, emit sanitized stringified payload in `details` with 256-character cap.
  - Dependencies: P2-T1
  - Validation command: npx vitest run --config vitest.config.ts tests/integration/respond-route.test.ts
  - Expected result: Integration tests confirm fixed message behavior and sanitized fallback details policy.

- [x] Apply security bounds and redaction consistently on server output
  - Task ID: P2-T3
  - Description: Ensure server-side redaction and length bounds are applied to `type`, `code`, `param`, and `details` prior to response serialization.
  - Dependencies: P2-T2
  - Validation command: npx vitest run --config vitest.config.ts tests/integration/respond-route.test.ts tests/integration/models.test.ts
  - Expected result: Integration assertions verify sensitive content is redacted and bounded according to design.

### Validation
- Run integration tests for both server routes.
- Confirm fixed messages and typed extraction/fallback behavior together.

### Exit Criteria (Done when...)
- Both routes emit safe structured DTOs.
- Fixed message safety policy is enforced.
- Unsupported payloads are sanitized + truncated before reaching client.

---

## Phase 3 — Client Propagation and UI Rendering Behavior

### Objective
Propagate status and typed fields from fetch handlers through state into `UiErrorAlert`, with user-facing Type mapped to upstream `type` and no `Type: unknown` display.

### Tasks
- [x] Preserve status in non-OK client paths
  - Task ID: P3-T1
  - Description: Update submit/model fetch error paths to include `response.status` when normalizing errors, including parse-failure branches.
  - Dependencies: P1-T3, P2-T2
  - Validation command: npx vitest run --config vitest.unit.config.ts tests/unit/app.ui.test.ts tests/unit/models-selector.test.ts
  - Expected result: Unit tests confirm status code is retained for non-OK responses and parse-failure paths.

- [x] Update UI error rendering mapping and fallback behavior
  - Task ID: P3-T2
  - Description: Render user-facing `Type` from upstream `error.type`, render `code` verbatim, and ensure unknown/unsupported errors use sanitized stringified `details` without displaying `Type: unknown` text.
  - Dependencies: P3-T1
  - Validation command: npx vitest run --config vitest.unit.config.ts tests/unit/ui-error-alert.test.ts tests/unit/app.ui.test.ts
  - Expected result: Unit tests verify field rendering rules and no user-facing `unknown` type display.

- [x] Add focused UI component/state regression tests
  - Task ID: P3-T3
  - Description: Expand component and app-level tests for typed errors (`type`, `code`, `param`), status rendering, and unsupported/unknown fallback details.
  - Dependencies: P3-T2
  - Validation command: npx vitest run --config vitest.unit.config.ts tests/unit/ui-error-alert.test.ts tests/unit/app.ui.test.ts tests/unit/models-selector.test.ts
  - Expected result: UI-oriented unit suites pass with deterministic expectations for all supported and fallback cases.

### Validation
- Run targeted unit tests for `UiErrorAlert`, app UI flow, and models selector.
- Verify no regressions in default error behavior.

### Exit Criteria (Done when...)
- Status and typed metadata propagate client-side as designed.
- Type` shows upstream `type` when present.
- UI never shows user-facing `Type: unknown` for unknown/unsupported errors.

---

## Phase 4 — End-to-End Verification, Quality Gates, and Readiness

### Objective
Validate full stack behavior with e2e coverage, ensure security invariants hold, and finalize readiness for Prompt 5 execution.

### Tasks
- [x] Add/adjust e2e scenarios for typed and fallback error details
  - Task ID: P4-T1
  - Description: Add or update Playwright tests to cover typed error display, verbatim `code`, unsupported payload fallback details, and unknown/untyped payload behavior.
  - Dependencies: P3-T3
  - Validation command: npm run test:e2e -- tests/e2e/app.spec.ts tests/e2e/models-selector.spec.ts
  - Expected result: E2E tests pass and confirm user-visible behavior matches design decisions.

- [x] Run integration + unit + e2e quality gate
  - Task ID: P4-T2
  - Description: Execute combined automated verification for all changed areas to confirm no cross-layer regressions.
  - Dependencies: P4-T1
  - Validation command: npm run test
  - Expected result: Unit + integration suites pass with no failures in updated error handling paths.

- [x] Run typecheck and lint gate
  - Task ID: P4-T3
  - Description: Validate static quality gates after behavior changes and tests are in place.
  - Dependencies: P4-T2
  - Validation command: npm run lint
  - Expected result: Typecheck, ESLint, and Prettier checks pass.

### Validation
- Execute e2e, then test suite, then lint/typecheck.
- Confirm logs and UI outputs do not include sensitive content in fallback details.

### Exit Criteria (Done when...)
- All targeted test layers pass (unit, integration, e2e).
- Lint/typecheck pass.
- Design behavior is fully represented in tests and validated for security-safe output.

---

## Risks, Dependencies, and Assumptions

- **Primary dependency:** Current behavior in server routes and normalizer may require coordinated changes to keep DTO shapes and UI rendering aligned.
- **Risk:** Over-sanitization may remove useful diagnostics; under-sanitization may expose sensitive content.
- **Risk mitigation:** Add explicit tests for secret patterns and truncation boundaries in unit/integration/e2e layers.
- **Assumption:** Upstream OpenAI error envelopes can vary and must be supported with robust fallback.
- **Assumption:** Existing route-level fixed message constants remain unchanged.

---

## Traceability

| Phase / Task ID | Design Section | Notes |
| --------------- | -------------- | ----- |
| P1-T1 | Interfaces, Data | Introduces optional typed fields on `ApiErrorResponse` / `NormalizedUiError` with backward compatibility |
| P1-T2 | Validation / Error Handling | Implements typed extraction/coercion (`type`, `code`, `param`) |
| P1-T3 | Validation / Error Handling, Data | Adds unknown/unsupported sanitized stringified fallback in `details` with 256 max |
| P1-T4 | Testing, Security | Adds normalization/sanitization regression tests including redaction behavior |
| P2-T1 | Architecture, Interfaces, Data | Server-side typed extraction from upstream envelopes |
| P2-T2 | Security, Data | Keeps fixed route messages and secure fallback details behavior |
| P2-T3 | Security | Enforces redaction + bounded lengths for server output fields |
| P3-T1 | Architecture, Validation / Error Handling | Preserves client-side status propagation in non-OK and parse-failure paths |
| P3-T2 | Interfaces, Security | Maps user-facing Type to upstream `type`; prevents user-facing `unknown` display |
| P3-T3 | Testing | UI regression coverage for typed fields and fallback details |
| P4-T1 | Testing | End-to-end verification of typed display + unknown/unsupported fallback behavior |
| P4-T2 | Testing | Full automated quality gate for changed error pipeline |
| P4-T3 | Security, Testing | Final static quality and formatting checks before implementation execution |

---

**Next step:** `.github/prompts/prompt-5-implement-from-plan.md` — pass this `implementation-plan.md` to begin implementation.

---

## Run History

### Prompt 6 Run: 2026-04-23

**Status:** ✅ **NO DISCREPANCIES FOUND**

**Summary:** Comprehensive discrepancy review completed against design and implementation plan. All 12 Phase tasks (P1-T1 through P4-T3) have been correctly implemented in code. One previously-identified discrepancy (DISC-1: Type field rendering) was resolved during implementation and has been validated through full test suite (unit, integration, e2e).

**Boundary:** `git diff $(git merge-base HEAD main) HEAD --name-only` across 17 changed files

**Key Findings:**
- ✅ Error contract updates (P1-T1): `ApiErrorResponse` and `NormalizedUiError` include optional `code`, `type`, `param`, `statusText` fields
- ✅ Typed field extraction (P1-T2, P2-T1): Coerce functions and server mapper implemented correctly
- ✅ Security bounds enforced (P2-T3): `code`/`type`/`param` ≤ 128 chars, `details` ≤ 256 chars
- ✅ Status propagation (P3-T1): `response.status` merged throughout client error paths including parse-failure branches
- ✅ UI rendering (P3-T2): Type renders upstream `error.type` only when present; no user-facing `Type: unknown` display
- ✅ Unsupported payload fallback (P1-T3): Sanitized stringified payload with 256-char truncation
- ✅ Fixed server messages (P2-T2): Routes preserve fixed constants, never forward upstream message
- ✅ Test coverage (P1-T4, P3-T3, P4-T1): 14 unit + 12 integration + 6 e2e = 32 targeted tests, all passing
- ✅ Quality gates (P4-T2, P4-T3): Full test suite (43 unit + 13 integration) and lint/typecheck all passing

**Discrepancy Reports:**
- `.github/specs/004-fix-error-details-bug/discrepancy-reports/modifications-vs-design.md` — No open discrepancies; DISC-1 resolved.
- `.github/specs/004-fix-error-details-bug/discrepancy-reports/modifications-vs-implementation-plan.md` — All 12 implementation plan tasks completed and validated.

**Verdict:** Implementation is ready for production. No additional remediation tasks required. Proceed to commit and merge.
