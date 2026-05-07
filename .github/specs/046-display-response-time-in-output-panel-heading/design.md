# Design

## Spec 046 — Display Response Time in Output Panel Heading

### Overview

This design extends the existing per-model composable chain to measure, propagate, and display elapsed response time for Model 1 and Model 2 output panel headings. No new components, routes, or data contracts are introduced. The change is confined to three existing files plus their tests.

---

### High-Level Data Flow

```
useModelQuery("model1")
  ├── performance.now() → t0  (at request start)
  ├── fetchModelResponse()
  ├── performance.now() → t1  (on success)
  └── elapsedSeconds.value = (t1 - t0) / 1000   ← new Ref<number | null>

app.vue
  └── passes elapsedSecondsModel1, elapsedSecondsModel2
      into useComparisonUiState(...)

useComparisonUiState
  └── heading computed:
        if status === "success" && elapsed != null
          → `Response from Model 1 (gpt-4.1-mini) in 3.2 seconds`
        else (current behaviour)
          → `Response from Model 1 (gpt-4.1-mini)`
```

---

### Affected Files

| File | Change |
|---|---|
| `app/composables/use-model-query.ts` | Add `elapsedSeconds` ref; capture timing around `fetchModelResponse`; reset on `start()`/`reset()` |
| `app/composables/use-comparison-ui-state.ts` | Accept `elapsedSecondsModel1` and `elapsedSecondsModel2` in options; update heading computeds |
| `app/app.vue` | Pass `elapsedSeconds` from each `useModelQuery` into `useComparisonUiState` |
| `tests/unit/app.ui.test.ts` | Update heading assertions after success to include timing suffix |
| `tests/e2e/app.spec.ts` | Update heading assertions after success to use partial match or updated exact string |
| `tests/e2e/accessibility.spec.ts` | Update heading assertions after success |

---

### `use-model-query.ts` Changes

Add `elapsedSeconds = ref<number | null>(null)` at composable scope.

Inside `query()`:
- Call `elapsedSeconds.value = null` immediately (via `start()` reset or explicit reset).
- Capture `const t0 = performance.now()` before `fetchModelResponse`.
- On success path, after `succeed(result.response)`, set:
  ```ts
  elapsedSeconds.value = (performance.now() - t0) / 1000;
  ```
- On error path, `elapsedSeconds.value` remains `null`.

Inside `reset()`:
- Set `elapsedSeconds.value = null`.

Return value extended:
```ts
return { state, submittedModelId, query, reset, elapsedSeconds };
```

> Requirement traceability: FR-1, FR-5, TR-1, TR-2

---

### `use-comparison-ui-state.ts` Changes

Extend the `UseComparisonUiStateOptions` type with optional fields:
```ts
elapsedSecondsModel1?: Ref<number | null>;
elapsedSecondsModel2?: Ref<number | null>;
```

Update both Model 1 and Model 2 heading computeds. Example for Model 1:
```ts
const model1Heading = computed(() => {
  const modelId = options.submittedModelIdModel1.value;
  const elapsed = options.elapsedSecondsModel1?.value;
  if (options.model1State.status === "success" && elapsed != null) {
    return `Response from Model 1 (${modelId}) in ${elapsed.toFixed(1)} seconds`;
  }
  return `Response from Model 1 (${modelId})`;
});
```

> Requirement traceability: FR-2, FR-3, FR-4, FR-6, TR-3, AR-1

---

### `app.vue` Changes

Destructure `elapsedSeconds` from each `useModelQuery` call (rename for clarity):
```ts
const {
  state: model1RequestState,
  submittedModelId: submittedModelIdModel1,
  query: queryModel1,
  elapsedSeconds: elapsedSecondsModel1,
} = useModelQuery("model1");
const {
  state: model2RequestState,
  submittedModelId: submittedModelIdModel2,
  query: queryModel2,
  elapsedSeconds: elapsedSecondsModel2,
} = useModelQuery("model2");
```

Pass into `useComparisonUiState`:
```ts
useComparisonUiState({
  ...existingOptions,
  elapsedSecondsModel1,
  elapsedSecondsModel2,
});
```

> Requirement traceability: TR-4

---

### Test Design

#### Unit tests (`tests/unit/app.ui.test.ts`)

Tests that assert heading text after a successful response must be updated. Since `elapsedSeconds` is measured with `performance.now()`, the exact elapsed value is non-deterministic in tests. Two strategies:

1. **Preferred — `toContain`**: Change assertions from `toContain("Response from Model 1 (gpt-4.1-mini)")` to `toContain("Response from Model 1 (gpt-4.1-mini) in")` — this validates the timing suffix is present without asserting the exact decimal value.

2. **Alternative — regex**: Use `toMatch(/Response from Model 1 \(gpt-4\.1-mini\) in \d+\.\d seconds/)`.

Use strategy 1 (simpler). Add separate test cases that confirm:
- Heading includes `" in "` and `" seconds"` after success.
- Heading does NOT include `" in "` while loading.
- Heading does NOT include `" in "` in error state.

#### E2E tests (`tests/e2e/app.spec.ts`, `tests/e2e/accessibility.spec.ts`)

Use partial match (regex or `{ exact: false }`) for headings after success, e.g.:
```ts
page.getByRole("heading", { name: /Response from Model 1 \(gpt-4\.1-mini\) in .+ seconds/ })
```

---

### Non-Design Decisions (Explicitly Out of Scope)

- No server changes.
- No styling changes.
- No Model 3 heading changes.
- `performance.now()` is available in all browsers targeted by this app; no polyfill needed.
