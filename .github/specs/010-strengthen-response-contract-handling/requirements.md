# Requirements — Enforce Full `/api/respond` Success Contract (`response` + `model`)

## Context
This update strengthens client-side success-payload validation for `POST /api/respond` so the UI and logic rely on the full server contract (`response` and `model`). The intent is to prevent malformed payloads from being treated as success and ensure displayed model identity reflects server-returned data.

## Functional Requirements

- **FR-1:** The client MUST treat a `/api/respond` payload as success only when both `response` and `model` are present and are strings.
  - **Acceptance criteria:**
    - Payloads missing `response` are rejected as non-success.
    - Payloads missing `model` are rejected as non-success.
    - Payloads with non-string `response` or `model` are rejected as non-success.

- **FR-2:** On successful responses, each side’s UI MUST use the server-returned `model` value for response headings/labels.
  - **Acceptance criteria:**
    - If submitted model differs from server-returned model, heading shows server-returned model.
    - Left/right headings are based on each side’s own resolved server model.

- **FR-3:** Malformed success-shaped payloads MUST be handled through the existing normalized error path instead of being rendered as success.
  - **Acceptance criteria:**
    - Invalid payloads route through existing normalization and error rendering.
    - Error behavior remains side-specific and does not crash rendering.

- **FR-4:** The route contract itself MUST remain unchanged (`{ response, model }`) and no new client-visible contract fields are required for this update.
  - **Acceptance criteria:**
    - Integration behavior for valid route responses remains backward-compatible with existing expected shape.

## Technical Requirements

- **TR-1:** `isRespondSuccessPayload()` in `app/utils/type-guards.ts` MUST validate both `response` and `model` as strings.
  - **Acceptance criteria:**
    - Guard returns `true` only for objects with both required string properties.

- **TR-2:** `runSingleQuery()` in `app/app.vue` MUST propagate both `response` and `model` on success branches.
  - **Acceptance criteria:**
    - Success return type includes server-returned `model`.
    - Side state updates consume the returned `model`.

- **TR-3:** Heading derivation in `app/app.vue` MUST be based on per-side resolved model values, not solely submitted selections.
  - **Acceptance criteria:**
    - UI reads from server-confirmed model state after success resolution.

- **TR-4:** Unit tests in `tests/unit/app.ui.test.ts` MUST cover:
  - valid success payload with both fields,
  - invalid success payload missing `model`,
  - heading correctness when returned model differs from submitted model.
  - **Acceptance criteria:**
    - New/updated tests fail before changes and pass after implementation.

- **TR-5:** Integration tests in `tests/integration/respond-route.test.ts` SHOULD confirm the route continues to return `{ response, model }` for success.
  - **Acceptance criteria:**
    - Existing contract assertions remain green or are updated without widening the route contract.

## Security Requirements

- **SR-1:** The client MUST enforce strict positive validation for success payload shape to reduce trust in malformed external data.
  - **Acceptance criteria:**
    - Success is denied by default unless full expected shape is present.

- **SR-2:** Error handling for malformed payloads MUST continue using existing sanitization/normalization utilities and MUST NOT leak raw sensitive content.
  - **Acceptance criteria:**
    - No direct rendering of unsanitized backend/system error internals is introduced by this update.

## Accessibility Requirements

- **AR-1:** Updating heading source data MUST preserve semantic heading structure and perceivable labeling for both response panels.
  - **Acceptance criteria:**
    - Response headings remain present, readable, and correctly associated with each panel.

- **AR-2:** Accessibility regression tests relevant to response output states MUST remain passing after contract hardening.
  - **Acceptance criteria:**
    - Existing a11y checks for app rendering do not regress due to new validation behavior.

## Out of Scope / Non-Goals

- Changing server-side `POST /api/respond` route behavior or contract shape.
- Implementing retry strategy changes, batching changes, or selector UX redesign.
- Introducing new response metadata fields outside the existing contract.

## Assumptions and Constraints

- The canonical success payload for this feature remains `{ response: string, model: string }`.
- Existing error normalization and logging pipelines are retained.
- This requirements set is scoped to `.github/specs/010/description.md` and its defined target files.
