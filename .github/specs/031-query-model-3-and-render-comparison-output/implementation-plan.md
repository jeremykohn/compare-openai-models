# Implementation Plan

## Phase 1 — Extend `useModelQuery` role type

### P1-T1: Widen role union in `use-model-query.ts`

- **File**: `app/composables/use-model-query.ts`
- **Change**: Change parameter type from `"model1" | "model2"` to `"model1" | "model2" | "model3"`.
- **Validation**:
  ```
  npm run typecheck
  ```
- **Expected result**: Typecheck passes; no other changes required.

---

## Phase 2 — Add model3State input to `useComparisonUiState`

### P2-T1: Add `model3State` parameter and `isModel3Loading` computed

- **File**: `app/composables/use-comparison-ui-state.ts`
- **Change**:
  - Add `model3State: ModelRequestState` to the options object type.
  - Add `isModel3Loading` computed: `model3State.status === "loading"`.
  - Return `isModel3Loading` from the composable.
- **Validation**:
  ```
  npm run typecheck
  ```
- **Expected result**: Typecheck passes. `app.vue` will fail until P3-T1 is applied (acceptable within phase).

---

## Phase 3 — Wire model3 query in `app.vue`

### P3-T1: Instantiate `useModelQuery("model3")` and call after model 1/2 succeed

- **File**: `app/app.vue`
- **Change**:
  - Destructure `{ state: model3RequestState, query: queryModel3 }` from `useModelQuery("model3")`.
  - Call `reset()` on model3 state at the start of `handleSubmit` (before `Promise.all`).
  - After `Promise.all` resolves, conditionally call `await queryModel3(generatedModel3Prompt.value, selectedModelIdModel3.value)` when `model1RequestState.status === "success" && model2RequestState.status === "success" && generatedModel3Prompt.value`.
  - Pass `model3State: model3RequestState` into `useComparisonUiState`.
  - Destructure `isModel3Loading` from `useComparisonUiState` return.
  - Pass `model3-status`, `model3-data`, `model3-error` props to `<ComparisonOutputPanel>`.

> `useRequestState` must expose `reset` — it already does (see implementation). No change needed there.

- **Validation**:
  ```
  npm run typecheck
  ```
- **Expected result**: Typecheck passes. Component prop type errors expected until P4-T1 is applied.

---

## Phase 4 — Update `ComparisonOutputPanel` component

### P4-T1: Add model3 props and render loading / success / error branches

- **File**: `app/components/ComparisonOutputPanel.vue`
- **Change**:
  - Add three new props: `model3Status: RequestStatus`, `model3Data: string | null`, `model3Error: NormalizedUiError | null`.
  - Import `UiErrorAlert` and `RequestStatus`/`NormalizedUiError` types.
  - Replace the existing `v-else` content block (currently renders outer-error text) with a multi-branch block:
    - **model3 loading** (`model3Status === "loading"`): `role="status"` + `aria-live="polite"` spinner + "Waiting for Model 3 response…" text. This block is shown when `!isWaiting && model3Status === "loading"`.
    - **model3 success** (`model3Status === "success" && model3Data`): `<p>` response text above the prompt toggle area. The toggle and its `<pre>` remain below.
    - **model3 error** (`model3Status === "error" && model3Error`): `<UiErrorAlert :error="model3Error" :show-retry="false" />`.
    - **outer error** (`hasOuterError`): existing `<p>` error-text rendering (unchanged).
  - Adjust `isPromptToggleDisabled` — the toggle is also disabled while `model3Status !== "success"` (i.e. disable until model3 succeeds so prompt text is meaningful in context).
  - DOM order: response/error content → toggle button → prompt `<pre>`.
- **Validation**:
  ```
  npm run typecheck
  npm test
  ```
- **Expected result**: Typecheck passes. Existing tests may fail until P5 updates them.

---

## Phase 5 — Update unit tests

### P5-T1: Update and add unit test assertions in `app.ui.test.ts`

- **File**: `tests/unit/app.ui.test.ts`
- **Change**: Update existing stubs/mocks and add new test cases:
  - Mock `useModelQuery` to return a third instance for model3 and expose a controllable `state`.
  - **New test**: model 3 loading state — assert spinner present, text = "Waiting for Model 3 response…".
  - **New test**: model 3 success — assert response `<p>` rendered above the prompt toggle button.
  - **New test**: model 3 error — assert `UiErrorAlert` `<details>` toggle is present.
  - **Updated test**: outer-error (model 1 or 2 fail) — assert model3 query is **not** called.
  - **Updated test**: happy-path heading — heading unchanged (already covered by existing tests).
- **Validation**:
  ```
  npm test
  ```
- **Expected result**: All unit tests pass.

---

## Phase 6 — Update E2E and accessibility tests

### P6-T1: Update `app.spec.ts` for Model 3 success and error paths

- **File**: `tests/e2e/app.spec.ts`
- **Change**:
  - Update happy-path test: after model 3 mock resolves, assert response text visible in third panel.
  - Add model 3 error path test: mock model 3 API call to return error; assert `<details>` visible.
- **Validation**:
  ```
  npm run test:e2e
  ```
- **Expected result**: All e2e tests pass.

### P6-T2: Update `accessibility.spec.ts` for full success state

- **File**: `tests/e2e/accessibility.spec.ts`
- **Change**: Update success-state axe assertion to wait for model 3 response to be rendered before running axe scan.
- **Validation**:
  ```
  npm run test:e2e
  ```
- **Expected result**: No new axe violations.

---

## Phase 7 — Full quality gate run

### P7-T1: Run all quality checks

- **Validation**:
  ```
  npm run typecheck && npm test && npm run lint
  ```
- **Expected result**: All checks pass with zero errors.

---

## Post-Phase Find-and-Fix Protocol

After each phase, inspect:
1. Any TypeScript errors introduced in adjacent files (run `npm run typecheck`).
2. Any test failures unrelated to the current phase's changes.
3. Any lint/Prettier issues in modified files (`npm run lint`).

Resolve all issues before moving to the next phase.

---

## Run History

> **Prompt 5 run — 2026-04-30:** All 7 phases implemented. Typecheck, unit (94), integration (13) tests pass. Lint clean. No unresolved discrepancies.
> **Prompt 6 run — 2026-04-30:** Found one discrepancy: missing dedicated Model 3 error-path E2E coverage required by `P6-T1`. Added `renders model 3 error panel with details when comparison request fails` in `tests/e2e/app.spec.ts` and updated happy-path response-count assertion to reflect three rendered responses. Verified with `npm run test:e2e -- tests/e2e/app.spec.ts` (8 passed).
