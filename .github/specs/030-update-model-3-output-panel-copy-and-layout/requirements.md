# Requirements

## Functional Requirements

### FR-1: Remove legacy placeholder text from the third output panel
When Model 1 and Model 2 query results succeed and the third output panel is displayed, the existing placeholder text (currently beginning with `New feature coming soon`) must not be rendered.

**Acceptance Criteria**
- In the success path where the third panel is shown, the old placeholder text is absent.
- Existing placeholder/error/success text behavior in Model 1 and Model 2 panels is unchanged.

### FR-2: Update third-panel header to include selected Model 3 name
The third output panel header must be updated from `Comparison of responses from Model 1 and Model 2` to `Response from Model 3 ({model-3-name}) comparing responses from Model 1 and Model 2`, where `{model-3-name}` is replaced by the currently selected Model 3 dropdown label.

**Acceptance Criteria**
- Header text matches the new sentence exactly, including `Model 3` and `Model 1 and Model 2` phrasing.
- `{model-3-name}` is rendered as the currently selected Model 3 value label.
- Header updates correctly if selected Model 3 changes before submission.

### FR-3: Rename third-panel prompt toggle label
The third-panel toggle label must be changed from `Prompt for Model 3` to `Comparison prompt for Model 3`.

**Acceptance Criteria**
- Toggle label text is exactly `Comparison prompt for Model 3` wherever shown.
- Toggle interaction behavior (expanded/collapsed semantics and controlled region behavior) remains unchanged.

### FR-4: Align third-panel inner margin with Model 1/Model 2 output panels
The third output panel inner margin must visually and structurally match the inner margin used by the Model 1 and Model 2 response panels.

**Acceptance Criteria**
- Third panel content container uses equivalent inner spacing to Model 1 and Model 2 panels.
- No regression in overflow/scroll behavior due to margin changes.
- Margin consistency holds in the normal success display state.

### FR-5: Preserve existing panel-visibility and orchestration behavior
This update must not change existing conditions for when the third panel appears, nor request orchestration logic for Model 1/Model 2/Model 3.

**Acceptance Criteria**
- Third-panel visibility remains tied to current existing success-path conditions.
- No additional API calls are introduced.
- Existing model-query sequencing and result handling behavior is unchanged.

## Technical Requirements

### TR-1: Keep changes scoped to third-panel presentation surfaces
Implementation must be limited to UI presentation/state surfaces needed for third-panel text and layout updates.

**Acceptance Criteria**
- Changes are confined to relevant app/component/composable files for third-panel rendering and styling.
- No server route or API contract files are modified for this update.

### TR-2: Reuse existing Model 3 selection source of truth
Header interpolation for `{model-3-name}` must use existing state representing the selected Model 3 label/value source and must not duplicate model-selection state.

**Acceptance Criteria**
- Header derives model name from existing Model 3 selection state.
- No parallel or duplicate selection state is introduced solely for the header.

### TR-3: Maintain deterministic text rendering behavior
Text content updates must be deterministic and stable across renders.

**Acceptance Criteria**
- New header and toggle labels are rendered consistently in all applicable success-path renders.
- Legacy placeholder text is not intermittently rendered.

### TR-4: Update and preserve automated coverage
Unit and/or e2e tests must be updated to validate the new third-panel header, toggle label, and placeholder removal while preserving existing behavior checks.

**Acceptance Criteria**
- Tests cover new header text with interpolated Model 3 name.
- Tests cover updated toggle label text.
- Tests verify old placeholder text is not rendered in the third panel success state.

### TR-5: Pass project quality gates
All in-scope changes must pass repository quality gates.

**Acceptance Criteria**
- `npm run typecheck` passes.
- `npm test` passes.
- `npm run lint` passes.

## Accessibility Requirements

### AR-1: Preserve accessible semantics for third-panel toggle
Renaming the toggle label must preserve accessible name, keyboard operability, and expanded/collapsed semantics.

**Acceptance Criteria**
- Toggle remains keyboard operable.
- Accessible name includes `Comparison prompt for Model 3`.
- `aria-expanded`/controlled-region semantics remain correct.

### AR-2: Preserve readable heading hierarchy and panel comprehension
The updated third-panel header must remain perceivable and understandable in the same semantic location as before.

**Acceptance Criteria**
- Third-panel heading remains in expected heading/label position in the panel.
- Screen-reader users can perceive the updated heading text including selected Model 3 name.

## Out of Scope / Non-Goals

- Modifying Model 1/Model 2 output panel copy beyond spacing parity requirements.
- Changing comparison generation logic or prompt-generation behavior.
- Changing API request contracts or backend behavior.
- Introducing new controls or redesigning panel layout beyond the specified text and margin updates.

## Assumptions and Constraints

### Assumptions
- Existing UI state already exposes selected Model 3 information in a form usable for header text.
- Existing third-panel visibility conditions are correct and should remain unchanged.

### Constraints
- Keep updates focused on third-panel copy and spacing consistency.
- Preserve existing interaction and accessibility behavior for the prompt toggle.
