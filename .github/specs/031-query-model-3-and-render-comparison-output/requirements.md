# Requirements

## Functional Requirements

### FR-1: Trigger Model 3 query after Model 1 and Model 2 succeed
When both Model 1 and Model 2 queries succeed for a submission, the app shall issue a Model 3 query using the generated comparison prompt and the model selected in `Model 3 for comparing responses`.

**Acceptance Criteria**
- Model 3 query is initiated only after both Model 1 and Model 2 are in success state for the current submission.
- Model 3 request payload includes the generated Model 3 prompt and the selected Model 3 identifier.
- Existing Model 1/Model 2 request count and orchestration remain unchanged.

### FR-2: Show third-panel loading state while Model 3 query is pending
While the Model 3 query is in flight, the third panel shall display a loading spinner and the exact message `Waiting for Model 3 response...`.

**Acceptance Criteria**
- Third-panel loading spinner is visible during Model 3 pending state.
- Third-panel loading text matches exactly: `Waiting for Model 3 response...`.
- Loading indicator is removed when Model 3 resolves (success or error).

### FR-3: Render third panel as error panel when Model 3 query fails
If Model 3 query returns an error, the third panel shall display an error presentation equivalent to existing Model 1/Model 2 error panels, including expandable error details via `<details>`.

**Acceptance Criteria**
- Third panel displays error state and message when Model 3 fails.
- Third panel includes an interactive `<details>` region for error details.
- Error-details behavior is consistent with existing error-panel patterns for Model 1/Model 2.

### FR-4: Render Model 3 response text on successful Model 3 query
If Model 3 query succeeds, the third panel shall display the Model 3 response text.

**Acceptance Criteria**
- Third panel displays returned Model 3 response text after successful Model 3 resolution.
- Success rendering occurs only after Model 3 success for the current submission.

### FR-5: Keep existing prompt toggle and place it below Model 3 response text
In third-panel success state, the existing Model 3 prompt toggle shall remain available and appear below the Model 3 response text.

**Acceptance Criteria**
- Prompt toggle remains present in third-panel success state.
- Model 3 response text is rendered above the toggle.
- Toggle continues to reveal/hide generated Model 3 prompt content.

### FR-6: Preserve current Model 1/Model 2 output behavior
The update shall not change current user-visible behavior of Model 1 and Model 2 output panels except dependencies required to support Model 3 flow.

**Acceptance Criteria**
- Existing Model 1/Model 2 loading, success, and error behavior remains intact.
- Existing Model 1/Model 2 error detail behavior remains intact.

## Technical Requirements

### TR-1: Reuse existing query and normalization infrastructure for Model 3
Implementation shall reuse existing request/error normalization patterns for issuing Model 3 query and rendering outcomes.

**Acceptance Criteria**
- Model 3 request path uses existing API route conventions and normalized UI error model.
- No duplicate parallel error-normalization implementation is introduced for Model 3.

### TR-2: Keep Model 3 selection as source of truth for request model
Model ID for Model 3 query shall come from existing `Model 3 for comparing responses` dropdown selection state.

**Acceptance Criteria**
- Model 3 request uses current selected Model 3 value.
- No duplicate model-selection state is introduced for the same purpose.

### TR-3: Maintain deterministic state transitions for third-panel lifecycle
Third-panel state transitions (waiting, error, success) shall be deterministic for each submission cycle.

**Acceptance Criteria**
- Third-panel lifecycle follows one of: waiting → success or waiting → error after Model 3 query starts.
- Third-panel state resets correctly on new submission.

### TR-4: Add and update automated test coverage for Model 3 flow
Automated tests shall cover third-panel Model 3 loading, error, and success behavior including toggle placement relative to success content.

**Acceptance Criteria**
- Unit tests assert loading message/spinner, success response rendering, error-panel rendering with `<details>`, and success layout ordering.
- E2E tests validate full user-visible third-panel behavior for Model 3 success and failure paths.

### TR-5: Pass project quality gates
All in-scope changes shall pass repository quality checks.

**Acceptance Criteria**
- `npm run typecheck` passes.
- `npm test` passes.
- `npm run lint` passes.

## Security Requirements

### SR-1: Preserve existing secure request boundaries
Model 3 query implementation shall preserve current server-side API boundary and avoid exposing secrets in client state/rendering.

**Acceptance Criteria**
- No API keys/secrets are added to client-rendered content or logs.
- Model 3 request continues to use existing server API path patterns.

### SR-2: Preserve safe error-detail rendering patterns
Error details shown in third-panel `<details>` shall follow existing sanitization/redaction rules used by current error panels.

**Acceptance Criteria**
- Third-panel error details do not expose unsanitized sensitive content.
- Third-panel error details behavior matches existing normalized error-detail safety handling.

## Accessibility Requirements

### AR-1: Provide accessible waiting-state announcement in third panel
Third-panel waiting state for Model 3 shall remain perceivable and announced consistently for assistive technology users.

**Acceptance Criteria**
- Waiting state uses accessible status semantics consistent with existing panel patterns.
- Waiting message text is programmatically available when shown.

### AR-2: Preserve accessible toggle and error-details interactions
Third-panel prompt toggle and error `<details>` interactions shall remain keyboard-operable and semantically correct.

**Acceptance Criteria**
- Prompt toggle remains focusable and keyboard operable.
- Error `<details>` summary is keyboard operable and exposes expanded/collapsed behavior.
- No focus traps or hidden-focus regressions are introduced.

## Performance Requirements

### PR-1: Add only one additional query in eligible success path
The feature shall introduce exactly one additional Model 3 API query only when both Model 1 and Model 2 succeed.

**Acceptance Criteria**
- No additional Model 3 query is made when either Model 1 or Model 2 fails.
- Exactly one Model 3 request is made per eligible submission cycle.

## Out of Scope / Non-Goals

- Changing Model 1/Model 2 query orchestration design.
- Introducing new model selectors or alternate panel interaction patterns.
- Implementing streaming responses, retry strategy redesign, or unrelated UI restyling.
- Backend/API redesign unrelated to supporting the described Model 3 query and rendering behavior.

## Assumptions and Constraints

### Assumptions
- Generated Model 3 comparison prompt is available in existing app flow when Model 1/Model 2 succeed.
- Existing query utilities/composables can be extended to include Model 3 execution.

### Constraints
- Keep behavior deterministic and aligned with existing panel state semantics.
- Keep update scoped to third-panel query/response rendering behavior and dependent wiring only.
