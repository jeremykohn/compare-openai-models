# Requirements: Two Dropdown Menus (Left Active, Right Inactive)

**Source:** `.github/specs/007-two-dropdown-menus-left-active-right-inactive/description.md`
**Spec folder:** `.github/specs/007-two-dropdown-menus-left-active-right-inactive/`

---

## Functional Requirements

### FR-1: Render Two Model Dropdown Menus
- The UI SHALL render two model dropdown menus in the model-selection area.
- The dropdown menus SHALL be visually arranged side-by-side on desktop-width viewports.
- The two dropdown menus SHALL be equally sized when shown side-by-side.
- **Acceptance Criteria:**
  - Two model selection controls are visible in the form.
  - At desktop width, both controls appear in one horizontal row.
  - Both controls use equivalent width styling in side-by-side layout.

### FR-2: Use Identical Model Option Sets in Both Dropdowns
- Both dropdown menus SHALL display the same list of available model options.
- Option ordering and labels SHALL match between the left and right dropdown menus.
- **Acceptance Criteria:**
  - Given a loaded models list, both dropdowns show the same option count.
  - Option values/text in left and right dropdowns match 1:1.

### FR-3: Keep Left Dropdown Active and Query-Controlling
- The left dropdown SHALL remain enabled and user-selectable.
- The selected value from the left dropdown SHALL continue to control the submitted `model` for the ChatGPT query.
- Existing behavior for “no model selected” SHALL remain unchanged.
- **Acceptance Criteria:**
  - User can interact with and change the left dropdown selection.
  - Submit payload uses the left dropdown selected model (or existing default behavior when empty).

### FR-4: Keep Right Dropdown Inactive
- The right dropdown SHALL be rendered in a disabled/inactive state.
- The right dropdown SHALL NOT affect request payload or query execution.
- **Acceptance Criteria:**
  - Right dropdown has disabled semantics and cannot be changed by user interaction.
  - Submitting a query never uses right dropdown as request model input.

### FR-5: Preserve Existing Request and Response Behavior
- This update SHALL NOT change number of requests sent on submit.
- This update SHALL NOT change current response/error rendering behavior beyond what is needed for dropdown layout.
- **Acceptance Criteria:**
  - One submit action still sends one `/api/respond` request.
  - Existing response and error state behavior remains functionally unchanged.

### FR-6: Preserve Existing Models Fetch/Error Behavior
- Existing model loading, models fetch error display, and retry behavior SHALL remain intact.
- If model loading fails, error UI behavior SHALL remain consistent with current implementation.
- **Acceptance Criteria:**
  - Models loading indicator behavior is unchanged.
  - Models fetch error and retry affordances remain available as before.

---

## Technical Requirements

### TR-1: Limit Scope to UI Composition and State Wiring
- Implementation SHALL be constrained to client-side UI/composable updates needed for dual-dropdown rendering and left/right activation behavior.
- Server routes and API contracts SHALL remain unchanged.
- **Acceptance Criteria:**
  - No changes are required in `server/api/*` for this feature.
  - No new endpoint or request schema is introduced.

### TR-2: Reuse Existing Models State Source of Truth
- Both dropdowns SHALL be driven from the same models state source and option data.
- The implementation SHALL avoid duplicating model-fetch requests or introducing separate models stores.
- **Acceptance Criteria:**
  - Models are fetched exactly once per current flow.
  - Both dropdown option sets derive from shared state.

### TR-3: Preserve Existing Submit Handler Contract
- Submit logic SHALL continue to read model selection from the active (left) dropdown pathway.
- Right dropdown value SHALL be ignored by submit logic while inactive.
- **Acceptance Criteria:**
  - Existing submit handler continues to receive one model parameter source.
  - No additional submit branches are introduced for right dropdown.

### TR-4: Add/Update Automated Test Coverage
- Unit tests SHALL verify:
  - Two dropdown controls render.
  - Left dropdown is enabled and right dropdown is disabled.
  - Both dropdowns expose matching model options when models load.
  - Submit behavior continues using left dropdown selection.
- Integration and/or E2E tests SHOULD verify user-visible dual-dropdown behavior in loaded/error states.
- **Acceptance Criteria:**
  - New/updated tests fail before implementation and pass after implementation.
  - Existing related test suites remain green.

### TR-5: Maintain Existing Quality Gates
- The update SHALL pass project quality checks after implementation.
- **Acceptance Criteria:**
  - `npm run typecheck` passes.
  - `npm test` passes.
  - `npm run lint` passes.

---

## Security Requirements

### SR-1: Preserve Existing Secret/Trust Boundaries
- No secret values (e.g., API keys) SHALL be introduced into client UI logic for dual-dropdown behavior.
- OpenAI API calls SHALL remain server-side only.
- **Acceptance Criteria:**
  - No client-side code path accesses secret runtime config.
  - Server-only request flow is unchanged.

### SR-2: Do Not Introduce New Input Injection Paths
- Dropdown option rendering SHALL continue using existing safe text rendering patterns.
- The update SHALL NOT introduce raw HTML rendering (`v-html`) for option labels or model metadata.
- **Acceptance Criteria:**
  - Option labels are rendered as plain text.
  - No new raw HTML rendering constructs are added in affected UI files.

### SR-3: Preserve Error Sanitization Behavior
- Any model-loading or submit-related error content shown with dual-dropdown UI SHALL continue to use existing normalization/sanitization behavior.
- **Acceptance Criteria:**
  - Existing sanitized error rendering tests remain valid and passing.
  - No direct rendering of unsanitized upstream payload fields is introduced.

---

## Accessibility Requirements

### AR-1: Provide Accessible Names and Associations for Both Dropdowns
- Both dropdown controls SHALL have clear, programmatically associated labels.
- Any helper/error descriptions SHALL remain correctly associated via `aria-describedby` where applicable.
- **Acceptance Criteria:**
  - Left and right dropdowns are discoverable by accessible name.
  - Label-control associations are valid for both controls.

### AR-2: Correct Disabled Semantics for Right Dropdown
- The right dropdown SHALL expose proper disabled semantics to assistive technologies.
- Disabled control behavior SHALL be keyboard-consistent (non-interactive while still perceivable in context).
- **Acceptance Criteria:**
  - Right dropdown has disabled state exposed (`disabled`/equivalent semantics).
  - Keyboard users cannot activate or modify the right dropdown.

### AR-3: Maintain Predictable Focus Order and Form Operability
- Introducing the second dropdown SHALL NOT create focus traps or unpredictable tab order.
- Form submission and prompt interactions SHALL remain keyboard operable.
- **Acceptance Criteria:**
  - Tab order through form controls remains logical and stable.
  - Existing keyboard submission behavior remains intact.

### AR-4: Preserve Readability and Error Communication
- Existing model-loading and error messages SHALL remain perceivable and understandable with the dual-dropdown layout.
- The update SHALL avoid relying on color alone to indicate active vs inactive dropdown status.
- **Acceptance Criteria:**
  - Error/loading messaging remains present and accessible in modified layouts.
  - Disabled state is conveyed through semantics and visual styling, not color only.

---

## Assumptions and Constraints

- The existing component/composable architecture can support two dropdown render targets without API changes.
- Responsive layout may stack controls on narrow viewports, while side-by-side equal sizing is required where horizontal space allows.
- This update intentionally keeps only one active model-selection pathway for query execution.

---

## Out of Scope / Non-Goals

- Activating the right dropdown for live query execution.
- Sending two model queries in one submit cycle.
- Changing server routes, OpenAI request contracts, or response schemas.
- Adding third dropdown/comparison workflows.
- Refactoring unrelated output panel logic beyond necessary compatibility with dual-dropdown layout.
