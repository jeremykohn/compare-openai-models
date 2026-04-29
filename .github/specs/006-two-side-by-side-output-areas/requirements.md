# Requirements: Two Side-by-Side Output Areas

**Source:** `.github/specs/006-two-side-by-side-output-areas/description.md`
**Spec folder:** `.github/specs/006-two-side-by-side-output-areas/`

---

## Functional Requirements

### FR-1: Render Two Output Panels Instead of One
- The app SHALL replace the single response/error output area with two output panels.
- The two panels SHALL be displayed side-by-side in the same row on standard desktop viewport widths.
- The two panels SHALL be equal-width when rendered side-by-side.
- **Acceptance Criteria:**
  - A successful submit renders two output containers.
  - An error submit renders two output containers.
  - At desktop width, both containers appear in one horizontal row and have equal width.

### FR-2: Mirror Success Output in Both Panels
- When `/api/respond` returns a successful response, the app SHALL display identical response content in both output panels.
- The displayed response text in both panels SHALL match the existing single-output response rendering behavior (including line breaks/formatting behavior).
- **Acceptance Criteria:**
  - For one successful request, both panels show the same response text.
  - Both panels preserve existing response formatting semantics used by current UI.

### FR-3: Mirror Error Output in Both Panels
- When `/api/respond` results in an error state, the app SHALL display identical error alert content in both output panels.
- Each panel SHALL include the same error summary message and the same error-details toggle content as the current error UI contract.
- **Acceptance Criteria:**
  - For one failing request, both panels show the same error message text.
  - If details metadata is available, both panels expose equivalent details toggle content and fields.
  - If details metadata is not available, both panels follow the same no-toggle/no-details behavior.

### FR-4: Preserve Existing Submit and Data Flow Behavior
- Clicking "Send" SHALL continue to issue one request through the current submit flow.
- This update SHALL NOT introduce additional requests, request retries, or parallel model calls.
- **Acceptance Criteria:**
  - Network instrumentation confirms one `/api/respond` request per submit action.
  - Existing loading/success/error status transitions continue to function.

### FR-5: Preserve Existing Non-Output UI Behavior
- Prompt validation behavior SHALL remain unchanged.
- Models selector behavior SHALL remain unchanged.
- Existing action controls (e.g., Send button and disabled/busy states) SHALL remain unchanged.
- **Acceptance Criteria:**
  - Existing validation errors still trigger as before.
  - Existing models loading/selection behavior remains intact.
  - Existing loading affordances remain intact during submit.

---

## Technical Requirements

### TR-1: Restrict Changes to Presentation Layer for Output Duplication
- Implementation SHALL be limited to UI composition/layout changes required to render two mirrored output panels.
- Existing request state/composable contracts SHOULD be reused rather than introducing new business logic.
- **Acceptance Criteria:**
  - Server routes and response contracts remain unchanged.
  - No new API endpoint is added.

### TR-2: Reuse Existing Success and Error Rendering Components/Contracts
- Success rendering SHALL use the existing response display semantics.
- Error rendering SHALL continue to use `UiErrorAlert` with the existing `NormalizedUiError` contract.
- **Acceptance Criteria:**
  - No breaking change to `NormalizedUiError` type contract is required solely for this update.
  - Error field visibility behavior remains consistent across both panels.

### TR-3: Deterministic Mirroring
- Both output panels SHALL render from the same resolved request state snapshot for a submit cycle.
- The mirrored render MUST avoid divergent conditions between left and right panels.
- **Acceptance Criteria:**
  - Given a single state transition to success or error, both panels display the same state-driven content.
  - No panel-specific data source or asynchronous branch is introduced.

### TR-4: Add/Update Automated Tests for Dual-Panel Behavior
- Unit/UI tests SHALL verify two-panel rendering for success and error states.
- At least one regression test SHALL verify identical mirrored content in both panels for success.
- At least one regression test SHALL verify identical mirrored content in both panels for error.
- **Acceptance Criteria:**
  - Test suite contains explicit assertions for two output panels and mirrored content.
  - Existing relevant tests remain green after updates.

### TR-5: Maintain Existing Build and Lint Quality Gates
- The updated code SHALL pass current project typecheck, unit/integration tests, and lint pipeline.
- **Acceptance Criteria:**
  - `npm run typecheck` passes.
  - `npm test` passes.
  - `npm run lint` passes.

---

## Security Requirements

### SR-1: No New Sensitive Data Exposure in Mirrored UI
- Mirroring output SHALL NOT bypass existing sanitization/redaction behavior.
- Error details shown in both panels SHALL remain subject to existing sanitization/redaction rules.
- **Acceptance Criteria:**
  - Sensitive token-like data remains redacted in mirrored error details.
  - No new raw upstream payload is rendered beyond current sanitized behavior.

### SR-2: Preserve Existing Trust Boundaries
- The update SHALL NOT move API key usage or upstream OpenAI calls into client-side code.
- **Acceptance Criteria:**
  - OpenAI requests continue to be performed via server routes only.
  - No new client-side secret handling is introduced.

### SR-3: No New Injection Surface in Output Rendering
- Response and error content rendering SHALL continue to avoid unsafe HTML injection patterns.
- **Acceptance Criteria:**
  - No use of `v-html` or equivalent raw HTML insertion is introduced for mirrored panels.

---

## Accessibility Requirements

### AR-1: Preserve Semantic Structure and Readability
- Both output panels SHALL retain clear, perceivable headings/labels that identify panel purpose.
- The overall page SHALL continue to maintain meaningful heading and region structure.
- **Acceptance Criteria:**
  - Screen-reader users can identify each output panel and its content context.
  - Heading order remains logical.

### AR-2: Preserve Alert Semantics for Errors
- Mirrored error panels SHALL preserve `role="alert"` behavior for error notifications.
- Error details toggles (when present) SHALL remain keyboard operable and collapsed by default.
- **Acceptance Criteria:**
  - Error alerts are announced and remain keyboard accessible.
  - Details disclosure controls are focusable and operable with Enter/Space.

### AR-3: Do Not Introduce Duplicate/Confusing Focus Traps
- The two-panel layout SHALL NOT introduce focus traps or non-operable interactive controls.
- **Acceptance Criteria:**
  - Keyboard navigation order remains predictable and complete.
  - No inaccessible interactive-only elements are introduced.

---

## Assumptions and Constraints

- The existing design system/utility classes can represent two equal-width panels without introducing new dependencies.
- Responsive behavior may stack panels on smaller viewports, but equal-width side-by-side layout is required where horizontal space allows.
- Existing API contracts and server behavior remain unchanged for this scope.

---

## Out of Scope / Non-Goals

- Dual independent requests using different models.
- Additional dropdowns or model-selection workflows.
- Any middle/comparison panel behavior.
- Server-side refactors unrelated to this UI layout/output mirroring update.
- Changes to OpenAI API integration behavior.
