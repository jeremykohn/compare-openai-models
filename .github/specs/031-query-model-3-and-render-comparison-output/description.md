# Description

## General Description

Currently, if the Model 1 and Model 2 queries succeed, a third output panel is displayed including a toggle that displays a prompt for Model 3. Update the app so that when Model 1 and Model 2 queries succeed, the app sends a Model 3 query using the selected value in the `Model 3 for comparing responses` dropdown, shows waiting state while that query is in flight, and then renders either an error panel (with error details) or the successful Model 3 response in the third panel.

## Specific Description

### Problem Statement

The third panel currently stops at prompt-preview behavior and does not execute the Model 3 comparison query. This leaves the comparison flow incomplete because users cannot receive a generated comparison response from Model 3, and the third panel does not yet reflect loading/error/success outcomes for the Model 3 request.

### Intended Outcome

When Model 1 and Model 2 queries both succeed:
- Submit a Model 3 API request using:
  - the generated Model 3 comparison prompt, and
  - the model selected in the `Model 3 for comparing responses` dropdown.
- While waiting for the Model 3 response:
  - display a loading spinner in the third output panel, and
  - display exactly: `Waiting for Model 3 response...`
- After the Model 3 response resolves:
  - If Model 3 request fails, render the third panel as an error panel similar to existing Model 1/Model 2 error panels, including a `<details>` section for error details.
  - If Model 3 request succeeds, render the Model 3 response text in the third panel directly above the existing prompt toggle that reveals the Model 3 prompt.

### Scope Boundaries

In scope:
- Triggering Model 3 query execution in the Model 1+Model 2 success path.
- Third-panel loading state for in-flight Model 3 query.
- Third-panel success rendering for returned Model 3 response text.
- Third-panel error rendering with `<details>` error details behavior equivalent to existing error-panel patterns.
- Preserving and positioning the existing Model 3 prompt toggle below successful Model 3 response content.

Out of scope:
- Changing Model 1/Model 2 query orchestration logic.
- Altering existing prompt-generation contract beyond what is needed to submit the Model 3 query.
- UI redesign outside requested third-panel loading/error/success behavior.
- Backend contract redesign unrelated to supporting the described query/response handling path.

### Key Behaviors and Expected User-Visible Results

- The third panel only initiates Model 3 query after Model 1 and Model 2 both succeed.
- While Model 3 query is pending, the third panel visibly shows:
  - loading spinner
  - `Waiting for Model 3 response...`
- If Model 3 fails, the third panel behaves like an error panel:
  - user-visible error state
  - `<details>` expandable error details region
  - error-detail presentation consistent with existing Model 1/Model 2 error handling patterns.
- If Model 3 succeeds, the third panel shows:
  - Model 3 response text
  - existing Model 3 prompt toggle below that response text
  - toggle still reveals/hides the generated Model 3 prompt content.

### Assumptions, Constraints, and Explicit Exclusions

Assumptions:
- The app already has a generated Model 3 prompt available when Model 1 and Model 2 are successful.
- Existing query infrastructure can be reused for issuing Model 3 requests and handling normalized errors.

Constraints:
- Keep behavior deterministic and aligned with existing loading/success/error UI patterns.
- Preserve accessibility semantics for loading and error states, including `<details>` behavior.
- Keep Model 3 model selection source of truth in existing dropdown state.

Explicit exclusions:
- No new model selectors.
- No changes to how Model 1 and Model 2 output panels behave outside dependencies required for Model 3 execution flow.
- No unrelated style refactor.

## Non-Goals

- Replacing the Model 3 prompt toggle with a different interaction pattern.
- Adding additional post-processing beyond displaying Model 3 response text in the third panel.
- Implementing multi-step retries, streaming UI, or advanced error recovery beyond existing panel-style parity.
