# Requirements — Prove Two Distinct `/api/respond` Requests in Playwright

## Context
This update hardens end-to-end test assertions so dual-query behavior is verified with evidence of two distinct POST requests, reducing false positives from duplicate generic response waiters.

## Functional Requirements

- **FR-1:** E2E tests MUST verify that a single send action produces two distinct `POST /api/respond` requests.
  - **Acceptance criteria:**
    - Tests fail when only one `/api/respond` request is sent.
    - Tests pass only when two request events are observed.

- **FR-2:** E2E tests MUST verify request distinctness when different models are selected on left and right.
  - **Acceptance criteria:**
    - Test assertions detect and fail if both requests target the same model unexpectedly.
    - Test assertions confirm expected left/right model values in request evidence.

- **FR-3:** Accessibility success-path e2e flow MUST wait for both requests before asserting final UI headings/content.
  - **Acceptance criteria:**
    - Accessibility e2e fails if only one response completes before final assertions.

- **FR-4:** Test reliability MUST be prioritized over timing-sensitive patterns.
  - **Acceptance criteria:**
    - Assertions rely on deterministic request interception/capture patterns rather than duplicate identical response waiters.

## Technical Requirements

- **TR-1:** `tests/e2e/app.spec.ts` MUST replace duplicate generic `waitForResponse()` usage with deterministic request-level verification.
  - **Acceptance criteria:**
    - Tests record and assert two distinct matching request instances.

- **TR-2:** Request verification MUST capture evidence sufficient to prove distinctness (for example, request body model IDs, request counters, or uniquely keyed intercepts).
  - **Acceptance criteria:**
    - Assertions include model-specific or request-identity-specific checks.

- **TR-3:** `tests/e2e/accessibility.spec.ts` MUST align success-state waiting logic with dual-request behavior.
  - **Acceptance criteria:**
    - Success-state assertions execute only after both `/api/respond` request/response events complete.

- **TR-4:** If needed for reuse, `tests/e2e/helpers/mock-api.ts` MAY be extended with deterministic helpers for counting/capturing `/api/respond` calls.
  - **Acceptance criteria:**
    - Helper abstractions remain explicit and test-readable.

- **TR-5:** Test updates MUST preserve existing scenario coverage intent (happy path, error path, typed error metadata, accessibility states).
  - **Acceptance criteria:**
    - No current intended scenario is silently dropped while hardening assertions.

## Accessibility Requirements

- **AR-1:** Accessibility e2e assertions MUST continue validating user-perceivable output headings for both response panels in success scenarios.
  - **Acceptance criteria:**
    - Both panel headings remain asserted after dual-request completion.

- **AR-2:** Accessibility-focused tests MUST remain stable and deterministic to avoid flaky outcomes that obscure real accessibility regressions.
  - **Acceptance criteria:**
    - Test runs do not depend on race-prone timing behavior for pass/fail.

## Out of Scope / Non-Goals

- Changing production request orchestration logic in app runtime.
- Modifying `/api/respond` API contract.
- Broad refactors of unrelated test suites or non-e2e test infrastructure.

## Assumptions and Constraints

- The application behavior under test remains one submit action triggering two requests.
- Distinctness evidence is available via Playwright request/route introspection.
- This requirements set is scoped to `.github/specs/011/description.md` and specified target test files.
