# Requirements

## Spec 046 — Display Response Time in Output Panel Heading

### Functional Requirements

**FR-1 — Measure per-model elapsed time**  
The application MUST measure how long each of Model 1 and Model 2 takes to respond. Timing begins when the `/api/respond` request is sent for that model and ends when a response (success or failure) is received. The elapsed time MUST be measured independently for each model.

**FR-2 — Display elapsed time in heading on success**  
When a model's response panel transitions to the success state, the output panel heading MUST include the elapsed time using exactly this format:

```
Response from Model {model-number} ({model-name}) in {response-time-in-seconds} seconds
```

For example: `Response from Model 1 (gpt-4.1-mini) in 3.2 seconds`

**FR-3 — One decimal place**  
The response time MUST be displayed with exactly one decimal place (for example `1.4`, `0.8`, `12.0`).

**FR-4 — Loading and error headings unchanged**  
While a model is loading or in an error state, the output panel heading MUST NOT include a response time. The heading text in these states is unchanged from the current behaviour.

**FR-5 — Re-send resets timing**  
When the user submits a new prompt, the elapsed time for Model 1 and Model 2 MUST be reset and re-measured from the new request.

**FR-6 — Model 3 heading not affected**  
The response time MUST NOT be displayed in the Model 3 comparison panel heading. Model 3's heading is out of scope for this change.

---

### Technical Requirements

**TR-1 — Client-side timing with `performance.now()`**  
Elapsed time MUST be measured entirely client-side. The `performance.now()` API MUST be used (not `Date.now()`) to ensure monotonic, high-resolution timing.

**TR-2 — Timing in `use-model-query.ts`**  
The elapsed time MUST be captured inside `use-model-query.ts` around the `fetchModelResponse` call. The elapsed time (in seconds, as a `number`) MUST be exposed as a reactive `Ref<number | null>` from `useModelQuery`. It MUST be `null` when idle, loading, or in error state; set to the measured value only on success.

**TR-3 — Elapsed time passed into `use-comparison-ui-state.ts`**  
`useComparisonUiState` MUST accept optional elapsed time refs for Model 1 and Model 2. When a success heading is computed and the elapsed time ref is non-null, the heading string MUST include the timing suffix.

**TR-4 — Wiring in `app.vue`**  
`app.vue` MUST pass the `elapsedSeconds` refs returned from each `useModelQuery` call into `useComparisonUiState`.

**TR-5 — Tests updated**  
All existing automated tests that assert the content of Model 1 or Model 2 output panel headings after a successful response MUST be updated to include the timing suffix. New tests MUST cover the success heading format with timing and confirm unchanged headings during loading and error states.

---

### Accessibility Requirements

**AR-1 — Heading text remains descriptive**  
The updated heading text (including the timing suffix) MUST remain a meaningful, human-readable description that conveys useful context to people using screen readers. The format `Response from Model 1 (gpt-4.1-mini) in 3.2 seconds` satisfies this requirement.

**AR-2 — No dynamic live region required**  
The response time is rendered as part of a static heading that appears when a panel transitions to success state. As the panel itself is already rendered, no additional ARIA live region is required for this change.

---

### Out of Scope

- Displaying response time for Model 3.
- Persisting or logging response times to any server or analytics endpoint.
- Showing a running timer or live elapsed time during loading.
- Displaying response time in error state headings.
- Any changes to server-side API routes or response contracts.
- Any layout or styling changes not required for the text update.
