# Design

## Overview

This spec extends the existing form-submission flow to execute a Model 3 query once both Model 1 and Model 2 succeed, then renders the response (or error) in the third output panel. No new API routes, model selectors, or orchestration patterns are introduced; the change is additive and purely wired through composable and component layers that already exist.

---

## Architecture

### High-Level Flow

```
User submits form
  → queryModel1 + queryModel2 fire in parallel (existing)
  → await Promise.all([queryModel1, queryModel2])        ← existing
  → if both succeed → queryModel3(generatedModel3Prompt, submittedModelIdModel3)  ← NEW
  → ComparisonOutputPanel renders model3 request state                            ← NEW/updated
```

### Layers Changed

| Layer | File | Change |
|---|---|---|
| Composable | `app/composables/use-model-query.ts` | Add `"model3"` as a valid `role` value |
| Composable | `app/composables/use-comparison-ui-state.ts` | Expose `model3State` (reactive) and `comparisonPanelHeading` driven by model3 status |
| Root component | `app/app.vue` | Instantiate `useModelQuery("model3")`; call `queryModel3` after both model 1/2 succeed; reset model3 state on new submission; pass model3 state to `ComparisonOutputPanel` |
| UI component | `app/components/ComparisonOutputPanel.vue` | Accept and render model3 `status`, `data`, and `error` props; show loading spinner, `UiErrorAlert`, or response text above the prompt toggle |

---

## Interfaces

### `useModelQuery` — role extension

`useModelQuery` currently accepts `"model1" | "model2"`. The role literal union is widened to `"model1" | "model2" | "model3"`. No other behavioral changes are required; the role string is used only for log tagging.

```typescript
// Before
export function useModelQuery(role: "model1" | "model2")

// After
export function useModelQuery(role: "model1" | "model2" | "model3")
```

### `useComparisonUiState` — new input

The composable receives one additional input ref: the model3 request state.

```typescript
export function useComparisonUiState(options: {
  model1State: ModelRequestState;
  model2State: ModelRequestState;
  model3State: ModelRequestState;          // NEW
  submittedPrompt: Ref<string>;
  submittedModelIdModel1: Ref<string>;
  submittedModelIdModel2: Ref<string>;
  submittedModelIdModel3: Ref<string>;
})
```

The composable exposes one new computed derived from `model3State`:

| Return | Type | Description |
|---|---|---|
| `isModel3Loading` | `ComputedRef<boolean>` | `true` while model3 status is `"loading"` |

`comparisonPanelHeading` already exists; its logic remains unchanged for this spec.

### `ComparisonOutputPanel` — new props

| Prop | Type | Required | Description |
|---|---|---|---|
| `model3Status` | `RequestStatus` | yes | Drives loading / success / error branch rendering |
| `model3Data` | `string \| null` | yes | Response text to display on success |
| `model3Error` | `NormalizedUiError \| null` | yes | Error object to pass to `UiErrorAlert` on error |

Existing props (`isWaiting`, `heading`, `hasOuterError`, `errorText`, `generatedPromptText`, `promptResetKey`) are reassessed:

- `isWaiting` — **repurposed**: now signals "waiting for model 1/2" only while either of those is still pending; when model 3 is loading, `model3Status === "loading"` is the source of truth for the model-3 loading spinner. `isWaiting` is retained to preserve the "Waiting for Model 1 and Model 2 responses…" message during that phase.
- `hasOuterError` / `errorText` — **retained** for the outer-model-error path (model 1 or 2 failed; comparison cannot proceed).
- `generatedPromptText` / `promptResetKey` — **retained** unchanged.

### `app.vue` — orchestration changes

```typescript
// New instance
const {
  state: model3RequestState,
  submittedModelId: submittedModelIdModel3Resolved,
  query: queryModel3,
} = useModelQuery("model3");

// handleSubmit — after Promise.all resolves
await Promise.all([
  queryModel1(promptResult.trimmedPrompt, selectedModelIdModel1.value),
  queryModel2(promptResult.trimmedPrompt, selectedModelIdModel2.value),
]);

// Fire model3 only when both succeeded
if (
  model1RequestState.status === "success" &&
  model2RequestState.status === "success" &&
  generatedModel3Prompt.value
) {
  await queryModel3(generatedModel3Prompt.value, selectedModelIdModel3.value);
}
```

`model3RequestState` is passed into `useComparisonUiState` and as props to `ComparisonOutputPanel`.

`submittedModelIdModel3` (already a `ref`) remains the source of truth for both the UI heading and as the default fallback; `submittedModelIdModel3Resolved` from `useModelQuery("model3")` captures the actual resolved model ID after the request.

> **Note**: `submittedModelIdModel3` in `app.vue` is set once at submit time and is already passed to `useComparisonUiState`. The new `submittedModelIdModel3Resolved` from `useModelQuery("model3")` is not needed for heading computation — the heading already uses the value captured at submit time. `submittedModelIdModel3Resolved` may be ignored or left unused to keep the interface minimal.

---

## Data

### Third-Panel State Machine

```
idle  ──[both model1+model2 succeed]──►  loading  ──[model3 ok]──►  success
                                                   └─[model3 fail]─►  error
```

On a new form submission, `useRequestState.reset()` shall be called for model3 state before model 1/2 queries start, so the third panel returns to idle and the prior response is cleared.

### Reactive State Ownership

| State | Owner | Passed as |
|---|---|---|
| `model3RequestState` | `app.vue` (via `useModelQuery`) | prop to `ComparisonOutputPanel`; input to `useComparisonUiState` |
| `generatedModel3Prompt` | `useComparisonUiState` (computed) | returned, consumed by `app.vue` to supply Model 3 query payload |
| `submittedModelIdModel3` | `app.vue` ref | passed to `useComparisonUiState` for heading |

---

## Validation and Error Handling

- If `generatedModel3Prompt.value` is `null` at the time both model 1/2 succeed (edge case: data trimmed to empty), model 3 query is **not** issued. The third panel remains in its outer-error / waiting state as appropriate.
- Model 3 errors follow the same normalized-error pipeline: `fetchModelResponse` → `normalizeUiError` → `fail(error)` → `model3RequestState.error`. `UiErrorAlert` renders these without modification.
- Outer errors (model 1 or 2 failed) short-circuit model 3 query entirely; the third panel shows the outer-error message as it does today.

---

## Security

- Model 3 request is issued through the same `/api/respond` server route as models 1 and 2. No new route or secret exposure is required. (SR-1)
- `UiErrorAlert` already applies normalized/redacted error details. Third-panel error details inherit that behavior without changes. (SR-2)

---

## Accessibility

- **Loading state** (`model3Status === "loading"`): rendered inside a `role="status"` + `aria-live="polite"` container matching the existing model 1/2 loading pattern — identical to `ModelOutputPanel`'s loading markup. (AR-1)
- **Error `<details>`**: delegated entirely to `UiErrorAlert`, which already provides an accessible `<details>`/`<summary>` implementation. (AR-2)
- **Success response text**: rendered as a `<p>` with `whitespace-pre-wrap`, consistent with `ModelOutputPanel`'s success rendering.
- **Toggle button**: no change to existing toggle; it remains below the response/error content. (FR-5 / AR-2)
- **Focus order**: response/error content is inserted above the toggle in DOM order, preserving a logical reading and focus sequence.

---

## Performance

- Exactly one additional `fetch` call is made per eligible submission (both model 1/2 succeed). (PR-1)
- No polling, no duplicated requests, no additional watchers beyond the one `watch` already present in `ComparisonOutputPanel`.

---

## Testing

### Unit Tests (`tests/unit/`)

New and updated assertions in `app.ui.test.ts` (and/or a new dedicated test file if the file grows too large):

| Scenario | Assertion |
|---|---|
| Both model 1/2 succeed → model 3 loading | Third panel shows spinner + "Waiting for Model 3 response…" |
| Model 3 succeeds | Third panel shows response text; prompt toggle is below response text |
| Model 3 fails | Third panel shows `UiErrorAlert` with `<details>` |
| One of model 1/2 fails | Model 3 query is **not** issued; third panel shows outer-error message |
| New submission resets model 3 state | Prior model 3 response is cleared before new queries fire |

### E2E Tests (`tests/e2e/app.spec.ts`)

| Scenario | Assertion |
|---|---|
| Happy path (all three models succeed) | Third panel displays Model 3 response text |
| Model 3 error path | Third panel enters error state; `<details>` is present |

### Accessibility Tests (`tests/e2e/accessibility.spec.ts`)

- Re-run axe on full success state (model 1 + 2 + 3 all succeed) to catch any new violations.

---

## Traceability

| Requirement | Design Element |
|---|---|
| FR-1 | `app.vue` `handleSubmit` — conditional `queryModel3` after `Promise.all` |
| FR-2 | `ComparisonOutputPanel` model3 loading branch; `role="status"` + `aria-live` |
| FR-3 | `ComparisonOutputPanel` model3 error branch → `UiErrorAlert` |
| FR-4 | `ComparisonOutputPanel` model3 success branch → `<p>` response text |
| FR-5 | Prompt toggle rendered below success/error content in DOM order |
| FR-6 | `Promise.all` for model 1/2 unchanged; no new props on `ModelOutputPanel` |
| TR-1 | `useModelQuery("model3")` reuses existing `fetchModelResponse` + `normalizeUiError` |
| TR-2 | `submittedModelIdModel3` ref passed unchanged to `queryModel3` |
| TR-3 | `reset()` called on model3 state at start of `handleSubmit` |
| TR-4 | Unit + E2E test table above |
| TR-5 | Quality gates validated in Prompt 5 |
| SR-1 | `/api/respond` route reused; no new secrets |
| SR-2 | `UiErrorAlert` delegates error-detail safety |
| AR-1 | `role="status"` + `aria-live="polite"` on model3 loading node |
| AR-2 | `UiErrorAlert` `<details>` + existing toggle keyboard behavior |
| PR-1 | Single conditional `queryModel3` call gated on both-success |
