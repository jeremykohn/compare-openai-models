# Requirements: Enable Comparison Dropdown and Conditional Third Output States

**Source:** `.github/specs/018-enable-comparison-dropdown-and-conditional-third-output/description.md`
**Spec folder:** `.github/specs/018-enable-comparison-dropdown-and-conditional-third-output/`

---

## Functional Requirements

### FR-1: Enable Comparison Model Dropdown
- The application SHALL enable the dropdown labeled `Model for comparing outputs`.
- The enabled dropdown SHALL allow users to select a value from the same model list source used by Model 1 and Model 2 selectors.
- **Acceptance Criteria:**
  - The comparison dropdown is interactive (not disabled) when model list state is interactive.
  - User changes to the comparison dropdown selection persist in UI state.

### FR-2: Preserve Existing Model 1 and Model 2 Query Execution Behavior
- The application SHALL continue submitting only the existing two queries for Model 1 and Model 2 when the form is submitted.
- Enabling the comparison dropdown SHALL NOT introduce a third query in this update.
- **Acceptance Criteria:**
  - One valid submit action issues exactly two `/api/respond` requests for Model 1 and Model 2.
  - Changing the comparison dropdown value does not alter Model 1/Model 2 request routing.

### FR-3: Show Conditional Third-Panel Placeholder on Dual Success
- If both Model 1 and Model 2 query outcomes are successful, the third output area SHALL display italicized placeholder text:
  - `New feature coming soon: Using {model-for-comparing-outputs} to compare responses from {model-1} and {model-2}`
- Placeholder substitutions SHALL use selected model names:
  - `{model-for-comparing-outputs}` = selected comparison model name,
  - `{model-1}` = selected Model 1 name,
  - `{model-2}` = selected Model 2 name.
- **Acceptance Criteria:**
  - After both outer queries succeed, third panel shows exactly the required sentence with runtime substitutions.
  - Placeholder text is rendered italicized.

### FR-4: Show Conditional Third-Panel Error on One-or-More Outer Errors
- If one or both Model 1/Model 2 queries error, the third output area SHALL display an error message beginning with:
  - `Cannot compare model outputs due to errors when querying `
- The message SHALL append a comma-separated list of failing model descriptors using:
  - `Model {number} ({name})`
  - where `{number}` is `1` or `2`, and `{name}` is the corresponding selected model name.
- **Acceptance Criteria:**
  - If only Model 1 errors, third-panel error includes only `Model 1 ({name})`.
  - If only Model 2 errors, third-panel error includes only `Model 2 ({name})`.
  - If both error, third-panel error includes both entries, comma-separated, in this deterministic order: Model 1 comes before Model 2.

### FR-5: Keep Existing Third-Panel Lifecycle Integration
- The third output area SHALL remain part of the existing output lifecycle and render according to existing post-submit visibility flow.
- **Acceptance Criteria:**
  - Third panel behavior remains integrated with current output region lifecycle.
  - Existing Model 1/Model 2 panel rendering remains unchanged by this update.

---

## Technical Requirements

### TR-1: Add Comparison Dropdown State as Active UI State
- App-level state SHALL include an active selected value for `Model for comparing outputs` that participates in selector binding.
- **Acceptance Criteria:**
  - Comparison selector is bound with two-way update flow equivalent to existing selector patterns.

### TR-2: Derive Third-Panel Mode from Existing Outer Request Terminal States
- Third-panel success-placeholder vs error mode SHALL be determined from terminal outcomes of Model 1 and Model 2 request states.
- **Acceptance Criteria:**
  - Logic distinguishes all outcome combinations: success/success, success/error, error/success, error/error.

### TR-3: Construct Dynamic Third-Panel Message Values from Current Selected/Submited Names
- Model names used in third-panel placeholder and error text SHALL be derived from current app state used by output headings/requests.
- **Acceptance Criteria:**
  - Names in third-panel text match selected model identities for the corresponding submission context.

### TR-4: Preserve Existing Network Contract and Query Count
- No client/server API contract change SHALL be introduced for comparison execution in this update.
- **Acceptance Criteria:**
  - No third request payload is generated.
  - Existing dual-request paths and route contracts remain intact.

### TR-5: Update Automated Tests for New Conditional Third-Panel Behavior
- Unit, accessibility, and e2e tests SHALL cover enabled comparison dropdown and conditional third-panel messaging.
- **Acceptance Criteria:**
  - Unit tests validate success placeholder interpolation and error-message construction.
  - Unit/E2E tests validate no third request is made.
  - Accessibility tests validate third-panel error semantics and readable dynamic text.

### TR-6: Pass Project Quality Gates
- The implementation SHALL pass repository verification commands.
- **Acceptance Criteria:**
  - `npm run typecheck` passes.
  - `npm test` passes.
  - `npm run lint` passes.

---

## Security Requirements

### SR-1: No New Secret Exposure Paths
- Enabling the comparison dropdown and conditional third-panel text SHALL NOT expose server secrets or internal sensitive values.
- **Acceptance Criteria:**
  - No API key/token/internal path appears in third-panel content.
;
### SR-2: Preserve Existing Error Sanitization Boundaries
- Third-panel error output SHALL use safe, controlled message composition and SHALL NOT render unsanitized upstream error payloads.
- **Acceptance Criteria:**
  - Third-panel error content includes only fixed prefix and selected model labels/names.

### SR-3: No New Comparison Request Surface in This Update
- The comparison model value SHALL remain non-executable for network requests in this release.
- **Acceptance Criteria:**
  - Changing comparison dropdown value does not trigger requests.
  - Submit still executes only existing two request operations.

---

## Accessibility Requirements

### AR-1: Enabled Comparison Dropdown Must Have Valid Labeling and Keyboard Operability
- The comparison dropdown SHALL retain proper accessible labeling and keyboard operability when enabled.
- **Acceptance Criteria:**
  - Associated label `Model for comparing outputs` remains programmatically tied to control.
  - Keyboard users can focus and change comparison dropdown value.

### AR-2: Third-Panel Conditional Messages Must Be Perceivable and Understandable
- Dynamic third-panel placeholder and error messages SHALL be textually clear and perceivable to assistive technologies.
- **Acceptance Criteria:**
  - Success placeholder sentence is available in accessible text output and includes substituted model names.
  - Error message text is available in accessible text output and includes failing model descriptors.

### AR-3: Existing Output Accessibility Semantics Must Not Regress
- Existing output region semantics and alert/status behavior for Model 1/Model 2 panels SHALL remain intact.
- **Acceptance Criteria:**
  - Current accessibility tests for existing output flow remain passing after changes.

---

## Performance Requirements

### PR-1: No Additional Network Overhead
- This update SHALL maintain existing request volume by avoiding comparison-request execution.
- **Acceptance Criteria:**
  - Per valid submit, request count remains exactly two.

### PR-2: Lightweight Third-Panel Conditional Rendering
- Third-panel message mode selection SHOULD be computed from existing in-memory request state without polling/timers.
- **Acceptance Criteria:**
  - No added polling loops or timer-driven comparison logic is introduced.

---

## Out of Scope / Non-Goals

- Running a real comparison query using the selected comparison model.
- Generating a model-to-model comparison report in this release.
- Adding server endpoints/contracts for comparison workflows.
- Refactoring unrelated selector/output architecture.

---

## Assumptions and Constraints

- Existing Model 1/Model 2 request-state lifecycle remains authoritative for determining terminal outcomes.
- Selected model names are available in app state at the point third-panel text is rendered.
- Third-panel conditional messages are UI-only behavior in this update.
