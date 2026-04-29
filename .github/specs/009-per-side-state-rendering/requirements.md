# Requirements — True Per-Side Loading/Success/Error States

## Context
This update ensures the dual-model query experience renders independent left/right request states in real time so one side can show loading, success, or error without being blocked by the other side.

## Functional Requirements

- **FR-1:** The application MUST render two output panels (Model 1 and Model 2) after a valid submission starts, and each panel MUST represent only its own request state.
  - **Acceptance criteria:**
    - After submit, both panels are visible while requests are in flight.
    - Panel content/state on one side does not hide or replace the other side.

- **FR-2:** Each panel MUST support and render side-specific states: `loading`, `success`, and `error`.
  - **Acceptance criteria:**
    - A side in `loading` shows a visible loading indicator/message for that side.
    - A side in `success` shows only that side’s response content.
    - A side in `error` shows only that side’s error UI.

- **FR-3:** The UI MUST allow mixed final states across panels (for example, left `success` while right `error`, or left `success` while right still `loading`).
  - **Acceptance criteria:**
    - Fast-side completion is immediately visible even if the other side is still pending.
    - One side entering `error` does not suppress successful content on the opposite side.

- **FR-4:** Submit behavior MUST remain a single action that triggers two side-specific queries (left and right) and updates both sides independently.
  - **Acceptance criteria:**
    - Exactly one user submit action triggers two side-specific request lifecycles.
    - State transitions for one side are not coupled to the completion of the other side.

- **FR-5:** The submit control MUST remain non-interactive while either side is loading to prevent overlapping dual-request batches.
  - **Acceptance criteria:**
    - While at least one side is `loading`, submit is disabled and exposed as busy.
    - Submit re-enables when both sides are no longer `loading`.

## Technical Requirements

- **TR-1:** `app/app.vue` MUST remove global response rendering gates that block panel visibility based on aggregate loading alone.
  - **Acceptance criteria:**
    - Template logic no longer uses a global `loading` branch that prevents per-panel rendering during partial completion.

- **TR-2:** The rendering model MUST be panel-local, with each panel deriving UI from its own request state object.
  - **Acceptance criteria:**
    - Left panel binds to left request state only.
    - Right panel binds to right request state only.

- **TR-3:** Existing request-state composable patterns for left/right (`useRequestState`) MUST be preserved and used as the single source of truth for side status.
  - **Acceptance criteria:**
    - No duplicate or conflicting side-status source is introduced.
    - State transitions continue to use composable start/succeed/fail paths.

- **TR-4:** Unit and e2e coverage MUST be updated to verify per-side progressive rendering and mixed-state behavior.
  - **Acceptance criteria:**
    - Unit tests assert visible side-specific loading/success/error combinations.
    - E2E tests assert that one side can render completion while the other is still pending.

- **TR-5:** Documentation MUST accurately describe that loading/success/error rendering is per-side and can be mixed concurrently.
  - **Acceptance criteria:**
    - `README.md` descriptions of response-state behavior match implemented behavior.

## Security Requirements

- **SR-1:** The update MUST preserve current request payload boundaries and not introduce new client-originating fields to `/api/respond` beyond the existing contract.
  - **Acceptance criteria:**
    - Request body remains scoped to expected fields (`prompt`, optional `model`).

- **SR-2:** Side-specific error rendering MUST continue to use normalized/sanitized error data and MUST NOT expose unsanitized sensitive details.
  - **Acceptance criteria:**
    - Error UI continues to rely on existing normalization/sanitization pipeline.
    - No secret-bearing raw payloads or headers are rendered directly.

- **SR-3:** Concurrency handling MUST avoid accidental repeated request bursts from rapid re-submission while in-flight.
  - **Acceptance criteria:**
    - Disabled/busy submit state remains enforced while either side is loading.

## Accessibility Requirements

- **AR-1:** Side-specific loading indicators and error states MUST remain perceivable to assistive technologies.
  - **Acceptance criteria:**
    - Loading indicators for in-flight side(s) are exposed with appropriate status semantics.
    - Error messages retain alert semantics where applicable.

- **AR-2:** Rendering changes MUST preserve keyboard operation and visible focus behavior for form controls and interactive error controls.
  - **Acceptance criteria:**
    - Keyboard users can still submit, inspect, and interact with error details as before.
    - Focus indicators remain visible and consistent.

- **AR-3:** Accessibility checks MUST continue to pass for idle, loading, success, and error/mixed-state scenarios relevant to this update.
  - **Acceptance criteria:**
    - Existing unit/e2e a11y suites pass for updated behavior.

## Performance Requirements

- **PR-1:** The UI SHOULD render side-state transitions incrementally without waiting for both requests to complete.
  - **Acceptance criteria:**
    - A completed side updates immediately after its response resolves.

- **PR-2:** The update MUST NOT add extra network calls beyond the existing two `/api/respond` calls per valid submit.
  - **Acceptance criteria:**
    - Network behavior remains two side-specific calls per submission flow.

## Out of Scope / Non-Goals

- Changing the `/api/respond` server contract or route semantics.
- Redesigning the model selector component behavior unrelated to per-side output-state rendering.
- Introducing new retry orchestration or batching mechanics beyond current submit flow.
- Refactoring unrelated tests or UI styling not required for this behavior.

## Assumptions and Constraints

- The feature scope is limited to the existing dual-query architecture in the current branch.
- Existing composables and error-normalization utilities remain the baseline implementation pattern.
- This requirements set is derived from `.github/specs/009/description.md` and does not add unrelated product scope.
