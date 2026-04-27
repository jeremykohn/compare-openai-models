# Technical Design — Prove Two Distinct `/api/respond` Requests in Playwright

## Overview
This design strengthens Playwright tests to deterministically prove that one submit action triggers two distinct `POST /api/respond` requests in dual-model flows. It replaces fragile duplicate generic response waits with request-evidence assertions (request count + request body model assertions).

### Goals
- Remove false-positive risk from duplicate identical `waitForResponse()` predicates.
- Assert two distinct request instances per submit.
- Assert request distinctness when different left/right models are selected.
- Keep accessibility e2e success assertions synchronized with completion of both requests.

### In Scope
- `tests/e2e/app.spec.ts`
- `tests/e2e/accessibility.spec.ts`
- `tests/e2e/helpers/mock-api.ts` (if shared helpers improve deterministic capture)

### Out of Scope
- Any production runtime behavior changes.
- API contract changes.
- Broad refactoring outside relevant e2e assertions.

## Architecture
### Current State
- Some tests wait twice on the same response predicate, which can pass without proving two distinct requests.

### Target State
- Tests capture deterministic per-request evidence for `/api/respond` calls:
  - request counter and/or collected request payload list
  - assertions on exact count `=== 2`
  - assertions that model IDs correspond to selected left/right values when applicable
- Final success assertions execute only after evidence confirms both requests have completed.

### Affected Files
- `tests/e2e/app.spec.ts`
- `tests/e2e/accessibility.spec.ts`
- optional helper additions in `tests/e2e/helpers/mock-api.ts`

## Interfaces
### Test Harness Interfaces
- Prefer route interception hooks (`page.route`) or request listeners (`page.on("request")`) to collect request evidence.
- Keep test helper interfaces explicit (e.g., utility that returns captured requests and awaitable completion gates).

### Assertion Interfaces
- Assert all of the following in dual-request scenarios:
  - two POST requests to `/api/respond`
  - parsed request bodies contain expected prompt/model data
  - when models differ in selectors, observed model values differ accordingly

## Data
### Captured Evidence Model
- In-memory array of captured `/api/respond` request snapshots:
  - method
  - url
  - parsed JSON body (`prompt`, optional `model`)
- Deterministic completion gate:
  - wait until captured count reaches expected value
  - then execute UI assertions

### State Flow in Tests
1. Configure interception/listeners before user action.
2. Trigger submit.
3. Wait until two request events are captured/resolved.
4. Assert request-level distinctness.
5. Assert final UI headings/content.

## Validation/Error Handling
- Parsing request bodies in tests should handle malformed JSON defensively and fail with explicit assertion messages.
- Avoid timing-only waits for correctness; prefer condition-based waits tied to captured evidence.
- Keep negative test behavior deterministic (e.g., single-request regression should fail count assertion).

## Security
- No production security surface changes (test-only update).
- Test assertions should avoid logging sensitive values; capture only minimal required payload fields for verification.

## Accessibility
- Accessibility e2e tests continue asserting both user-perceivable response headings.
- Accessibility success assertions are gated on both requests completing to avoid race-induced false results.
- Deterministic waiting reduces flaky outcomes that can mask genuine accessibility regressions.

## Testing
### Primary Updates
- `tests/e2e/app.spec.ts`
  - Replace duplicate generic waits with request-evidence capture.
  - Add explicit assertions for count and model distinctness.
- `tests/e2e/accessibility.spec.ts`
  - Ensure success-state assertions wait for both requests.

### Optional Shared Helper
- If duplication appears, add a helper in `tests/e2e/helpers/mock-api.ts` for capturing/awaiting dual `/api/respond` calls with parsed bodies.

### Regression Coverage Preservation
- Maintain existing scenario intent (happy path, error path, typed metadata, a11y states) while hardening request-proof mechanics.

## Assumptions and Constraints
- App behavior remains one submit action producing two `/api/respond` requests.
- Playwright request interception APIs are available in current test setup.
- This design is scoped to `.github/specs/011/requirements.md`.

## Traceability
| Requirement ID | Design Section | Notes |
|----------------|----------------|-------|
| FR-1 | Architecture; Interfaces; Data; Testing | Deterministic evidence model asserts two distinct requests per submit. |
| FR-2 | Interfaces; Data; Testing | Request body model assertions verify expected left/right distinctness. |
| FR-3 | Accessibility; Testing; Data | Accessibility success assertions run only after both requests complete. |
| FR-4 | Validation/Error Handling; Architecture | Replace race-prone waits with condition-based deterministic capture. |
| TR-1 | Architecture; Testing | Remove duplicate generic wait patterns in `app.spec.ts`. |
| TR-2 | Interfaces; Data | Capture request-level evidence (count/body/identity). |
| TR-3 | Testing; Accessibility | Align accessibility e2e waiting logic to dual-request flow. |
| TR-4 | Testing; Interfaces | Optional helper abstraction for reusable deterministic capture. |
| TR-5 | Testing | Preserve existing coverage intent while strengthening assertion quality. |
| AR-1 | Accessibility; Testing | Keep dual-heading assertions in success scenarios. |
| AR-2 | Accessibility; Validation/Error Handling | Reduce flakiness with deterministic waits to surface real regressions. |
