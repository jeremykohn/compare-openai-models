# Description

## General Description

Measure and display how long it takes for Model 1 and Model 2 to return a response. Display the response time for each model in the heading of its output panel, using this format: "Response from Model {model-number} ({model-name}) in {response-time-in-seconds} seconds"

## Specific Description

### Problem Statement

The output panel headings for Model 1 and Model 2 currently display only the model name (for example, `Response from Model 1 (gpt-4.1-mini)`). Users have no visibility into how long each model took to respond. Because Model 1 and Model 2 are queried concurrently and may resolve at different times, per-panel response timing provides useful, immediately visible performance context.

### Intended Outcome

After this update:
- Each model's response time is measured from the moment its `/api/respond` request is sent until its response is received.
- When a model's response panel transitions to a success state, the heading displays the elapsed time using exactly this format:

  `Response from Model {model-number} ({model-name}) in {response-time-in-seconds} seconds`

  For example: `Response from Model 1 (gpt-4.1-mini) in 3.2 seconds`

- Response time is shown with one decimal place (tenths of a second).
- When a model is loading or in an error state, the heading does not include a response time.
- The change applies to Model 1 and Model 2 output panel headings only; the Model 3 comparison panel heading is not affected.

### Scope Boundaries

In scope:
- Measuring per-model response time (Model 1 and Model 2 only) from request send to response receipt.
- Updating the heading string for successful responses in `use-comparison-ui-state.ts` or the relevant composable.
- Passing the elapsed time through the existing `OutputPanelState` heading field or an equivalent extension.
- Updating affected automated tests that assert output panel heading content.

Out of scope:
- Displaying response time for Model 3 (comparison model).
- Persisting or logging response times to any server or analytics endpoint.
- Showing a running timer or live elapsed time during loading.
- Displaying response time in error state headings.
- Any changes to the server-side API routes or response contracts.
- Any layout or styling changes not required for the text update.

### Key Behaviors and Expected User-Visible Results

- On successful response, the Model 1 panel heading reads:  
  `Response from Model 1 ({model-name}) in {N.N} seconds`
- On successful response, the Model 2 panel heading reads:  
  `Response from Model 2 ({model-name}) in {N.N} seconds`
- Response time is a non-negative number with one decimal place (for example `1.4`, `0.8`, `12.0`).
- While loading, headings continue to display as they do today without a time component.
- Error state headings are unchanged.
- A new submission (re-send) resets and re-measures timing independently for each model.

### Assumptions, Constraints, and Explicit Exclusions

Assumptions:
- Timing is measured entirely client-side using `Date.now()` or `performance.now()`.
- The existing composable structure (`use-model-query.ts`, `use-comparison-ui-state.ts`) can be extended to carry elapsed time without major architectural changes.
- Sub-second precision beyond one decimal place is not required.

Constraints:
- Use the exact heading format provided: `Response from Model {model-number} ({model-name}) in {response-time-in-seconds} seconds`
- Model number is the numeric label (`1` or `2`), not a variable identifier.
- Keep the change minimal and limited to timing measurement, heading string composition, and directly affected tests.

Explicit exclusions:
- No server-side changes.
- No separate timing display component; timing appears only inside the heading string.
- No i18n or pluralization changes.
- No changes to the Model 3 output panel or comparison flow.

## Non-Goals

- Real-time elapsed-time counter during loading.
- Timing benchmarks, analytics, or performance dashboards.
- Displaying network-level breakdown (DNS, TTFB, etc.).
- Refactoring unrelated composable or component logic.
