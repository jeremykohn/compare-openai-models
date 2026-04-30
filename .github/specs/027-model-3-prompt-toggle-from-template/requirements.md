# Requirements

## Functional Requirements

### FR-1: Generate Model 3 comparison prompt from template after successful prerequisite outputs
The application shall generate a Model 3 comparison prompt from `server/assets/prompt-templates/model-3-prompt-template.md` only when Model 1 and Model 2 responses for the current run are both successful and available.

**Acceptance Criteria**
- Prompt generation executes only when Model 1 and Model 2 output text exist for the active run.
- The generated prompt includes substituted values for: original user prompt, Model 1 response text, and Model 2 response text.
- If either prerequisite response is missing or failed, generated prompt content is not shown as if valid.

### FR-2: Provide a third-panel toggle to inspect generated Model 3 prompt
The third output panel shall display a user-facing toggle labeled `Prompt for Model 3` above the existing placeholder/output region.

**Acceptance Criteria**
- The toggle label text is exactly `Prompt for Model 3`.
- The toggle is visible in the third panel whenever the third panel itself is visible.
- The toggle controls visibility of a read-only rendered/generated prompt view.

### FR-3: Default prompt inspection view to collapsed
The generated prompt view controlled by the third-panel toggle shall be collapsed by default on initial render and for new comparison runs.

**Acceptance Criteria**
- On first display of the third panel, generated prompt content is hidden until explicitly expanded.
- Starting a new comparison run resets the toggle to collapsed state.

### FR-4: Preserve existing third-panel output behavior
Adding prompt inspection shall not change existing result/error/placeholder behavior for the third output panel outside the new toggle-controlled prompt view.

**Acceptance Criteria**
- Existing third-panel response rendering remains intact.
- Existing error and empty states remain intact.
- Existing compare flow semantics remain unchanged.

## Technical Requirements

### TR-1: Use server template asset as source of prompt structure
Implementation shall use `server/assets/prompt-templates/model-3-prompt-template.md` as the canonical source for Model 3 prompt structure, without changing template semantics.

**Acceptance Criteria**
- Prompt assembly references the existing template asset path.
- Placeholder replacement logic is deterministic and scoped to expected placeholders.
- The template file content is not rewritten as part of this update unless required by placeholder compatibility.

### TR-2: Keep changes scoped to current UI and comparison state flow
Implementation shall integrate prompt-generation and toggle state into existing Nuxt/Vue comparison state and component structure with minimal surface area changes.

**Acceptance Criteria**
- No backend/provider API contracts are changed.
- No new model selectors or output panels are introduced.
- State changes are localized to existing comparison-related composables/components.

### TR-3: Add or update automated test coverage for prompt generation and toggle behavior
The update shall include automated tests that verify both template-driven prompt generation and the third-panel toggle behavior.

**Acceptance Criteria**
- Unit and/or component tests validate prompt generation with expected substitutions.
- UI tests validate toggle presence, default collapsed state, and expand/collapse behavior.
- Regression checks confirm unchanged third-panel placeholder/error/output behavior.

### TR-4: Keep quality gates green for in-scope changes
In-scope changes shall pass relevant test and static analysis commands.

**Acceptance Criteria**
- Targeted tests for changed units/components pass.
- Repository quality gates used in this project (`typecheck`, tests, lint) pass after updates.

## Security Requirements

### SR-1: Restrict prompt interpolation to trusted in-memory run data
Prompt generation shall use only validated in-memory inputs from the current comparison run and local template content; it shall not fetch external template sources at runtime.

**Acceptance Criteria**
- No user-provided URL or remote source is used for template loading.
- Prompt interpolation inputs are limited to current-run prompt and model output text fields.
- Failed/missing upstream outputs do not produce misleading synthesized prompt content.

### SR-2: Prevent secret exposure in prompt inspection UI
The rendered `Prompt for Model 3` view shall not include server secrets, API keys, or runtimeConfig secret values.

**Acceptance Criteria**
- UI displays only prompt text assembled from user prompt and model outputs.
- No secret-bearing configuration fields are included in rendered prompt content.
- No new logging of sensitive values is introduced.

## Accessibility Requirements

### AR-1: Ensure toggle control is keyboard and assistive-technology accessible
The `Prompt for Model 3` toggle shall be implemented with accessible semantics and keyboard operability.

**Acceptance Criteria**
- Toggle is reachable and operable via keyboard.
- Toggle exposes correct name/role/state to assistive technologies.
- Expanded/collapsed state is programmatically conveyed.

### AR-2: Associate toggle with controlled prompt content region
The toggle and controlled prompt content shall be programmatically associated for assistive technologies.

**Acceptance Criteria**
- Controlled region has a stable ID and is referenced by the toggle (`aria-controls` or equivalent semantic association).
- Hidden state removes non-visible prompt content from inappropriate focus/navigation.
- Prompt text remains readable with sufficient contrast and preserves whitespace meaningfully.

## Assumptions and Constraints

### Assumptions
- `server/assets/prompt-templates/model-3-prompt-template.md` already exists and contains placeholders for user prompt and both model outputs.
- Existing comparison flow already stores Model 1 and Model 2 outputs needed for substitution.

### Constraints
- Keep implementation minimal and aligned with existing Nuxt/Vue architecture and naming conventions.
- Do not alter Model 1/Model 2 prompt authoring behavior.
- Do not introduce heavy new dependencies.

## Out of Scope / Non-Goals

- Editing Model 3 prompt content directly in the UI.
- Persisting generated prompts to storage/history.
- Redesigning the full compare page layout.
- Introducing new provider-side response contracts or API endpoints.
