# Requirements: Two Active Dropdowns and Two Queries

**Source:** `.github/specs/008-two-active-dropdowns-two-queries/description.md`
**Spec folder:** `.github/specs/008-two-active-dropdowns-two-queries/`

---

## Functional Requirements

### FR-1: Activate Both Model Dropdowns
- The UI SHALL present two active model dropdown controls in the model-selection area.
- The left dropdown SHALL remain interactive.
- The right dropdown SHALL become interactive instead of disabled.
- **Acceptance Criteria:**
  - Both dropdowns are enabled when models are available and the form is otherwise interactive.
  - Users can independently change the selected value in each dropdown.

### FR-2: Rename the Dropdown Labels
- The left dropdown SHALL be labeled `Model 1`.
- The right dropdown SHALL be labeled `Model 2`.
- The visible label text and accessible name for each control SHALL match those labels.
- **Acceptance Criteria:**
  - The left dropdown is discoverable by the label `Model 1`.
  - The right dropdown is discoverable by the label `Model 2`.

### FR-3: Reuse the Same Model List in Both Dropdowns
- Both dropdowns SHALL display the same available model options.
- Option values, ordering, and labels SHALL match between the two controls.
- **Acceptance Criteria:**
  - With a loaded models response, both dropdowns show the same option count.
  - Each option in the left dropdown matches the corresponding option in the right dropdown.

### FR-4: Submit Two Queries from One Send Action
- Clicking `Send` with valid input SHALL submit two ChatGPT queries.
- Both queries SHALL use the same prompt text entered in the prompt text area.
- The first query SHALL use the model selected in the left dropdown.
- The second query SHALL use the model selected in the right dropdown.
- **Acceptance Criteria:**
  - One send action results in two model-targeted request executions.
  - The first request uses the left dropdown's selected model value.
  - The second request uses the right dropdown's selected model value.

### FR-5: Render Independent Output States Per Model
- The left output area SHALL display only the first query's result or error state.
- The right output area SHALL display only the second query's result or error state.
- A success or failure in one query SHALL NOT overwrite or suppress the corresponding result state of the other query.
- **Acceptance Criteria:**
  - If both queries succeed, each output area shows only its own model's response.
  - If one query fails and the other succeeds, one output area shows an error UI and the other shows the successful response.
  - If both queries fail, both output areas show their own error UI.

### FR-6: Rename the Output Headings with Model Names
- The left output heading SHALL display `Response from Model 1 (<model-1-name>)` using the model currently selected in the left dropdown.
- The right output heading SHALL display `Response from Model 2 (<model-2-name>)` using the model currently selected in the right dropdown.
- Output headings SHALL update to reflect the model names used for the displayed results or errors.
- **Acceptance Criteria:**
  - The left output heading includes the left-side selected model name.
  - The right output heading includes the right-side selected model name.
  - The output headings no longer use the generic labels `Output 1` and `Output 2`.

### FR-7: Preserve Existing Prompt Validation Rules
- Existing prompt validation SHALL continue to apply before any queries are submitted.
- If the prompt is invalid, neither query SHALL be sent.
- **Acceptance Criteria:**
  - Empty or otherwise invalid prompt input shows the existing validation feedback.
  - No model request is executed when prompt validation fails.

### FR-8: Preserve Existing Model Loading and Retrieval Behavior
- Existing model-loading, model-load error, and retry behavior SHALL remain available for the two-dropdown UI.
- If models cannot be loaded, the model-selection UI SHALL continue to reflect the existing error/retry state consistently for both dropdown controls.
- **Acceptance Criteria:**
  - The loading state remains visible while models are being fetched.
  - The model-load error UI remains available with retry behavior.
  - Both dropdown controls reflect the loaded or unavailable state consistently.

---

## Technical Requirements

### TR-1: Keep Scope to Existing App Architecture
- The update SHALL extend the current client-side app flow without introducing a new product workflow outside the existing app structure.
- The implementation SHALL continue using the existing app, component, composable, and server-route architecture unless a change is strictly required by the two-query behavior.
- **Acceptance Criteria:**
  - The feature is implemented within the existing Nuxt/Vue app structure.
  - No unrelated architectural refactor is required to support this update.

### TR-2: Represent Two Independent Model Selections in UI State
- The client SHALL maintain independent selected-model state for the left and right dropdowns.
- The selected-model state SHALL remain stable across user interaction, validation, loading, and response rendering for each side.
- **Acceptance Criteria:**
  - Changing the left dropdown does not overwrite the right dropdown value.
  - Changing the right dropdown does not overwrite the left dropdown value.

### TR-3: Support Two Independent Response/Error States
- The client SHALL maintain separate request/result state for the left and right query flows.
- Each side SHALL be able to represent loading, success, and error independently.
- **Acceptance Criteria:**
  - The app can represent mixed outcomes such as left success/right error or left error/right success.
  - Rendering logic uses side-specific state instead of mirroring one result into both areas.

### TR-4: Use Existing Server-Side OpenAI Execution Boundary
- OpenAI API calls SHALL remain server-side.
- The implementation SHALL reuse or extend server routes/utilities in a way that preserves the server-only handling of secrets and upstream API communication.
- **Acceptance Criteria:**
  - No client-side code directly calls the OpenAI API with secrets.
  - Existing server-side runtime-config patterns remain in effect.

### TR-5: Preserve Stable API Contracts or Evolve Them Deliberately
- Any request/response contract changes needed to support two responses SHALL be explicit and consistent across client, server, and tests.
- The implementation SHALL avoid ambiguous partial-response shapes.
- **Acceptance Criteria:**
  - Client and server agree on the request payload shape for the dual-query operation.
  - Client and server agree on the success and error payload shapes used by the UI.

### TR-6: Add Automated Test Coverage for Dual-Query Behavior
- Unit tests SHALL cover:
  - two active dropdowns,
  - independent model selection,
  - two-query submission behavior,
  - independent response and error rendering,
  - output heading text with model names.
- Integration and/or end-to-end tests SHALL verify the user-visible dual-query flow.
- **Acceptance Criteria:**
  - New or updated tests fail before implementation and pass after implementation.
  - Existing related tests remain green unless intentionally updated for the new behavior.

### TR-7: Preserve Project Quality Gates
- The completed update SHALL pass the repository's existing quality checks.
- **Acceptance Criteria:**
  - `npm run typecheck` passes.
  - `npm test` passes.
  - `npm run lint` passes.

---

## Security Requirements

### SR-1: Preserve Secret Handling Boundaries
- The update SHALL NOT expose API keys, tokens, or other secrets to client-side code.
- Both model queries SHALL continue to execute through server-side code paths.
- **Acceptance Criteria:**
  - No client-rendered artifact includes server-only secret values.
  - No client-side request bypasses the server-side runtime-config boundary.

### SR-2: Preserve Sanitized Error Rendering Per Output Area
- Each output area SHALL continue to use sanitized, normalized error data.
- Error rendering SHALL NOT expose secrets, raw authorization headers, stack traces, internal file paths, or unsanitized upstream payload details.
- **Acceptance Criteria:**
  - Side-specific error UIs continue to redact sensitive details.
  - Known structured error fields such as status code, type, code, and param may be displayed only if they pass existing sanitization rules.

### SR-3: Validate and Constrain Dual-Query Request Inputs
- The dual-query request flow SHALL only send prompt and model-selection values needed for the feature.
- Both selected model values SHALL be validated through the existing trusted server-side handling path before upstream use.
- **Acceptance Criteria:**
  - The request payload contains only expected fields required for the two-query operation.
  - Invalid or unsupported model handling continues through server-side validation/error behavior.

### SR-4: Avoid Unsafe HTML Rendering in New Labels or Output Paths
- The implementation SHALL NOT introduce raw HTML rendering for dropdown labels, output headings, responses, or errors.
- **Acceptance Criteria:**
  - New UI text for model labels and output headings is rendered as plain text.
  - No new `v-html` or equivalent raw HTML rendering is introduced for this feature.

---

## Accessibility Requirements

### AR-1: Provide Clear Accessible Names for Both Dropdowns
- Both dropdowns SHALL have clear label associations matching the visible labels `Model 1` and `Model 2`.
- **Acceptance Criteria:**
  - Screen-reader and form-label queries can identify both dropdowns by their visible names.
  - Label-control associations remain valid after the label rename.

### AR-2: Preserve Accessible Prompt and Error Interactions
- Existing prompt validation messaging and error semantics SHALL remain accessible in the dual-query flow.
- Each output area's error UI SHALL remain perceivable and properly structured for assistive technologies.
- **Acceptance Criteria:**
  - Prompt validation continues using the current accessible error semantics.
  - Side-specific error states remain available to assistive technologies in each output region.

### AR-3: Preserve Logical Focus Order and Keyboard Operability
- The addition of an active right-hand dropdown and side-specific output behavior SHALL maintain a logical keyboard navigation order.
- The send workflow SHALL remain keyboard operable.
- **Acceptance Criteria:**
  - Users can tab through prompt, model controls, and submit button in a predictable order.
  - Both dropdowns are operable by keyboard when enabled.

### AR-4: Ensure Output Headings and Regions Stay Understandable
- The updated output headings SHALL clearly identify which model each output region corresponds to.
- The UI SHALL avoid relying on color alone to distinguish the left and right result regions.
- **Acceptance Criteria:**
  - Output headings provide enough text context to distinguish left vs right results.
  - The output areas remain understandable without depending only on visual color differences.

---

## Assumptions and Constraints

- Both queries use the same prompt text from a single prompt input field.
- Both dropdowns continue using the same shared OpenAI model list.
- The app may execute the two queries in parallel or sequentially as long as the user-visible requirements are satisfied.
- This update does not require comparison or aggregation of the two outputs.
- Existing sanitized error-detail behavior remains a required constraint for each output area.

---

## Out of Scope / Non-Goals

- Comparing the two model outputs.
- Adding a third dropdown or third output region.
- Introducing persistent paired-response history.
- Adding a middle comparison panel, summary report, or model-ranking logic.
- Redesigning the app beyond the changes needed to support two active model-driven queries.
