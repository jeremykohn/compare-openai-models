# Implementation Plan: Add Error Details Toggle

**Source:** `.github/specs/001-add-error-details-toggle/design.md`

**Date:** 2026-04-22

---

## Overview

This plan delivers the error details toggle feature in three phases:

- **Phase 1 — Data layer:** Extend `NormalizedUiError` with `statusCode`, update `normalizeUiError`, update composables to carry the full error object
- **Phase 2 — UI layer:** Update `UiErrorAlert.vue` with `<details>/<summary>` and new props; update `ModelsSelector.vue` and `app.vue` to pass the structured error
- **Phase 3 — Tests & validation:** Update and add unit tests, component tests, and E2E tests; run full test suite and typecheck

Each phase builds on the prior one. Phase 1 must be complete before Phase 2; Phase 2 must be complete before Phase 3.

---

## Phase 1 — Data Layer: Extend Error Type and Composables

### Objective

Extend `NormalizedUiError` with `statusCode`, add `statusCode` extraction to `normalizeUiError`, and update `useRequestState` and `useModelsState` to carry `NormalizedUiError | null` instead of separate string fields.

### Tasks

- [x] **Extend `NormalizedUiError` type with `statusCode`**
  - `Task ID: P1-T1`
  - `Description: Add optional statusCode?: number field to the NormalizedUiError type in app/utils/error-normalization.ts`
  - `Dependencies: None`
  - `Validation command: npm run typecheck`
  - `Expected result: No type errors`

- [x] **Add `coerceStatusCode` helper and populate `statusCode` in `normalizeUiError`**
  - `Task ID: P1-T2`
  - `Description: Add a private coerceStatusCode(error: unknown): number | undefined helper that reads .statusCode or .status from the error object, validates it is a number in range 100–599, and returns it or undefined. Call coerceStatusCode in the api branch of normalizeUiError and include the result as statusCode in the returned NormalizedUiError.`
  - `Dependencies: P1-T1`
  - `Validation command: npm run typecheck`
  - `Expected result: No type errors`

- [x] **Update `useRequestState` to store `NormalizedUiError | null`**
  - `Task ID: P1-T3`
  - `Description: In app/composables/use-request-state.ts, replace the error: string | null and errorDetails: string | null fields in RequestState with error: NormalizedUiError | null. Update the fail() function signature from fail(error: string, details?: string) to fail(error: NormalizedUiError). Update start(), succeed(), and reset() to set state.error = null. Import NormalizedUiError from app/utils/error-normalization.ts.`
  - `Dependencies: P1-T1`
  - `Validation command: npm run typecheck`
  - `Expected result: No type errors`

- [x] **Update `useModelsState` to store `NormalizedUiError | null`**
  - `Task ID: P1-T4`
  - `Description: In app/composables/use-models-state.ts, replace the error: string | null and errorDetails: string | null fields in ModelsState with error: NormalizedUiError | null. Update all state assignments that currently set state.error and state.errorDetails to instead call normalizeUiError on the caught error and assign the result to state.error. Remove errorDetails from all assignments.`
  - `Dependencies: P1-T1`
  - `Validation command: npm run typecheck`
  - `Expected result: No type errors`

- [x] **Update `app.vue` to pass full `NormalizedUiError` to `fail()`**
  - `Task ID: P1-T5`
  - `Description: In app/app.vue, update both error-handling call sites in handleSubmit() — the response.ok check and the catch block — to call fail(normalized) instead of fail(normalized.message, normalized.details). No template changes yet.`
  - `Dependencies: P1-T3`
  - `Validation command: npm run typecheck`
  - `Expected result: No type errors`

### Validation

Run after all Phase 1 tasks are complete:

```
npm run typecheck
npm test -- --reporter=verbose
```

### Exit Criteria

Phase 1 is done when:
- `npm run typecheck` passes with no errors
- All existing unit and integration tests pass (tests may need minor updates to match new type signatures — see Phase 3)
- `NormalizedUiError` includes `statusCode?: number`
- `useRequestState.state.error` is `NormalizedUiError | null`
- `useModelsState.state.error` is `NormalizedUiError | null`

---

## Phase 2 — UI Layer: Update Components

### Objective

Update `UiErrorAlert.vue` to use `<details>/<summary>` and accept a `NormalizedUiError` prop. Update `ModelsSelector.vue` to pass a single `error: NormalizedUiError | null` prop. Update `app.vue` template bindings.

### Tasks

- [x] **Rewrite `UiErrorAlert.vue` props and template**
  - `Task ID: P2-T1`
  - `Description: Replace the current UiErrorAlert.vue props (message, title, details, enableDetailsToggle) with a single required error: NormalizedUiError prop. Keep showRetry, retryLabel, detailsToggleTestId, and retryButtonTestId props unchanged. Remove the showDetails ref and canToggleDetails computed property and the onToggleDetails() function — native <details> handles toggle state without JavaScript. Update the template: keep the outer <div role="alert"> container and its Tailwind classes; replace the <p>{{ title }}</p> with a hardcoded <p>Something went wrong</p>; render <p>{{ error.message }}</p>; add a <details :data-testid="detailsToggleTestId"> element (not open by default) with <summary>Error Details</summary> and a <dl> inside containing three conditional rows: (1) Type / {{ error.category }}, always shown; (2) Status Code / {{ error.statusCode }}, shown only v-if="error.statusCode"; (3) Details / {{ error.details }}, shown only v-if="error.details". Keep the retry <button> at the bottom guarded by v-if="showRetry". Ensure no v-html is used anywhere in the template.`
  - `Dependencies: P1-T1`
  - `Validation command: npm run typecheck`
  - `Expected result: No type errors`

- [x] **Update `ModelsSelector.vue` to accept `error: NormalizedUiError | null`**
  - `Task ID: P2-T2`
  - `Description: In app/components/ModelsSelector.vue, replace the error?: string | null and errorDetails?: string | null props with a single error?: NormalizedUiError | null prop (default: null). Update the UiErrorAlert usage inside the template to pass :error="props.error" instead of :message and :details. Import NormalizedUiError from app/utils/error-normalization.ts.`
  - `Dependencies: P2-T1, P1-T4`
  - `Validation command: npm run typecheck`
  - `Expected result: No type errors`

- [x] **Update `app.vue` template to pass `state.error` object to `UiErrorAlert`**
  - `Task ID: P2-T3`
  - `Description: In app/app.vue template, update the UiErrorAlert binding from :title :message :details props to :error="state.error". Remove the :title, :message, and :details prop bindings. The v-else-if condition remains: state.status === 'error' && state.error.`
  - `Dependencies: P2-T1, P1-T5`
  - `Validation command: npm run typecheck`
  - `Expected result: No type errors`

- [x] **Update `app.vue` ModelsSelector binding to remove `error-details` prop**
  - `Task ID: P2-T4`
  - `Description: In app/app.vue template, update the <ModelsSelector> binding from :error="modelsState.error" :error-details="modelsState.errorDetails" to :error="modelsState.error" only. The errorDetails prop no longer exists on ModelsSelector.`
  - `Dependencies: P2-T2, P1-T4`
  - `Validation command: npm run typecheck`
  - `Expected result: No type errors`

### Validation

Run after all Phase 2 tasks are complete:

```
npm run typecheck
npm run lint
```

### Exit Criteria

Phase 2 is done when:
- `npm run typecheck` passes with no errors
- `npm run lint` passes with no errors
- `UiErrorAlert.vue` uses `<details>/<summary>` and accepts `error: NormalizedUiError`
- `ModelsSelector.vue` accepts `error: NormalizedUiError | null` (no `errorDetails` prop)
- `app.vue` passes `state.error` directly to `UiErrorAlert` and `ModelsSelector`

---

## Phase 3 — Tests and Validation

### Objective

Update existing tests that break due to Phase 1/2 changes, add new tests covering the `<details>/<summary>` toggle and `statusCode` propagation, and run the full test suite plus E2E tests to confirm no regressions.

### Tasks

- [x] **Update `tests/unit/error-normalization.test.ts` for `statusCode`**
  - `Task ID: P3-T1`
  - `Description: Add three new test cases to tests/unit/error-normalization.test.ts: (1) "includes statusCode from API error object" — pass { message: "Bad request", statusCode: 400 }, assert normalized.statusCode === 400; (2) "omits statusCode for network errors" — pass a network fetch error, assert normalized.statusCode is undefined; (3) "omits statusCode when value is out of range" — pass { message: "err", statusCode: 99 }, assert normalized.statusCode is undefined.`
  - `Dependencies: P1-T2`
  - `Validation command: npm test -- tests/unit/error-normalization.test.ts`
  - `Expected result: All tests in this file pass`

- [x] **Update `tests/unit/use-request-state.test.ts` for new `fail()` signature**
  - `Task ID: P3-T2`
  - `Description: Update tests/unit/use-request-state.test.ts to pass a NormalizedUiError object (e.g., { category: "unknown", message: "err" }) to fail() instead of a string. Update assertions on state.error and remove any assertions on state.errorDetails.`
  - `Dependencies: P1-T3`
  - `Validation command: npm test -- tests/unit/use-request-state.test.ts`
  - `Expected result: All tests in this file pass`

- [x] **Rewrite `tests/unit/ui-error-alert.test.ts`**
  - `Task ID: P3-T3`
  - `Description: Rewrite tests/unit/ui-error-alert.test.ts to test the updated component. Include these test cases: (1) "renders error message" — mount with { error: { category: "api", message: "Oops", statusCode: 400 } }, assert text contains "Oops"; (2) "renders 'Something went wrong' title" — assert title text present; (3) "renders <details> element" — assert wrapper contains a <details> element; (4) "<details> is collapsed by default" — assert the details element does not have the open attribute; (5) "displays error category in details" — assert "api" appears in a <dd>; (6) "displays status code when present" — assert "400" appears in a <dd>; (7) "omits status code row when absent" — mount with error without statusCode, assert "Status Code" label is not present; (8) "displays details when present" — mount with error.details set, assert details text visible; (9) "omits details row when absent" — mount without error.details, assert "Details" label not present; (10) "retry button is hidden by default" — assert no retry button rendered; (11) "retry button emits retry event" — mount with showRetry: true, click button, assert retry event emitted.`
  - `Dependencies: P2-T1`
  - `Validation command: npm test -- tests/unit/ui-error-alert.test.ts`
  - `Expected result: All tests in this file pass`

- [x] **Update `tests/unit/models-selector.test.ts` for new `error` prop**
  - `Task ID: P3-T4`
  - `Description: Update tests/unit/models-selector.test.ts to pass a NormalizedUiError object (e.g., { category: "api", message: "Unable to load models." }) to the error prop instead of a plain string. Remove any errorDetails prop usage. Verify tests still pass.`
  - `Dependencies: P2-T2`
  - `Validation command: npm test -- tests/unit/models-selector.test.ts`
  - `Expected result: All tests in this file pass`

- [x] **Update `tests/unit/app.ui.test.ts` for new error state shape**
  - `Task ID: P3-T5`
  - `Description: Review tests/unit/app.ui.test.ts for any tests that mock or assert on error state (error, errorDetails). Update them to pass NormalizedUiError objects to the fail() function or to error-state-related composable mocks, and remove any errorDetails references.`
  - `Dependencies: P1-T5, P2-T3`
  - `Validation command: npm test -- tests/unit/app.ui.test.ts`
  - `Expected result: All tests in this file pass`

- [x] **Add E2E test for error details toggle in `tests/e2e/app.spec.ts`**
  - `Task ID: P3-T6`
  - `Description: Add a new E2E test to tests/e2e/app.spec.ts titled "shows error details toggle when submission fails". Steps: (1) mock /api/models to return success; (2) mock /api/respond to return a 503 JSON error response { message: "Service unavailable", statusCode: 503 }; (3) navigate to /; (4) fill in a prompt; (5) click Send and wait for the mocked response; (6) assert the error alert is visible; (7) assert a <details> element with a <summary> containing text "Error Details" is present and not open; (8) click the <summary>; (9) assert the <details> element now has the open attribute and the text "unknown" or "api" or "network" is visible in the expanded content.`
  - `Dependencies: P2-T1, P2-T3`
  - `Validation command: npm run test:e2e`
  - `Expected result: All E2E tests pass including the new test`

- [x] **Run full test suite and typecheck**
  - `Task ID: P3-T7`
  - `Description: Run npm test (unit + integration) and npm run test:e2e (Playwright) and npm run typecheck. Confirm all tests pass and no type errors remain.`
  - `Dependencies: P3-T1, P3-T2, P3-T3, P3-T4, P3-T5, P3-T6`
  - `Validation command: npm run typecheck && npm test && npm run test:e2e`
  - `Expected result: All checks pass with no failures or errors`

- [x] **Run lint and auto-fix**
  - `Task ID: P3-T8`
  - `Description: Run npm run lint on all modified files. Fix any lint or formatting issues. Confirm no lint errors remain.`
  - `Dependencies: P3-T7`
  - `Validation command: npm run lint`
  - `Expected result: No lint errors`

### Validation

Run after all Phase 3 tasks are complete:

```
npm run typecheck && npm test && npm run test:e2e && npm run lint
```

### Exit Criteria

Phase 3 is done when:
- `npm run typecheck` passes with no errors
- `npm test` passes (all unit + integration tests)
- `npm run test:e2e` passes (all E2E tests including the new toggle test)
- `npm run lint` passes with no errors

---

## Traceability

| Phase / Task ID | Design Section | Notes |
|---|---|---|
| P1-T1 | Interfaces → `NormalizedUiError` | Adds `statusCode?: number` field; TR-1, SR-2 |
| P1-T2 | Interfaces → `normalizeUiError` update; Validation/Error Handling | `coerceStatusCode` helper; 100–599 range validation; TR-3, SR-2 |
| P1-T3 | Interfaces → `useRequestState` | Replaces `error: string \| null` + `errorDetails`; TR-5 |
| P1-T4 | Interfaces → `useModelsState` | Same consolidation for models composable; TR-4, TR-5 |
| P1-T5 | Interfaces → `app.vue`; Architecture → Target State | Updates `fail()` call site; TR-6 |
| P2-T1 | Interfaces → `UiErrorAlert.vue` props + template; Accessibility; Security | `<details>/<summary>` + `<dl>/<dt>/<dd>`; FR-2, FR-3, AR-1–AR-7, SR-3; TR-2 |
| P2-T2 | Interfaces → `ModelsSelector.vue` | Consolidates `error`/`errorDetails` props; TR-4 |
| P2-T3 | Interfaces → `app.vue` template | Passes `state.error` object to `UiErrorAlert`; TR-6, FR-1 |
| P2-T4 | Interfaces → `app.vue` template | Removes `errorDetails` binding from `ModelsSelector`; TR-4 |
| P3-T1 | Testing → error-normalization unit tests | `statusCode` inclusion/omission/range tests; TR-7, TR-3 |
| P3-T2 | Testing → use-request-state unit tests | Updates `fail()` call shape in tests; TR-7 |
| P3-T3 | Testing → ui-error-alert unit tests | Full `<details>/<summary>` component test suite; TR-7, FR-2, FR-3, AR-1 |
| P3-T4 | Testing → models-selector unit tests | Updates error prop type in tests; TR-7 |
| P3-T5 | Testing → app.ui unit tests | Updates error state mocks; TR-7 |
| P3-T6 | Testing → E2E tests | End-to-end toggle verification; TR-7, FR-2, FR-3, FR-4 |
| P3-T7 | Testing (full suite) | Gate: typecheck + unit + E2E all pass; TR-7, PR-1, PR-2 |
| P3-T8 | Testing (lint) | No lint or formatting regressions |

---

## Run History

> *(Appended by Prompt 5 and Prompt 6 runs)*

> **Prompt 6 run — 2026-04-22:** No unresolved discrepancies found. Workflow complete.
