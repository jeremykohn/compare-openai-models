# Requirements

## Functional Requirements

### FR-1: Toggle displays `comparison-prompt.md` text
When a user expands the `Comparison prompt for Model 3` toggle, the third panel shall display the raw text from `server/assets/prompt-templates/comparison-prompt.md`.

**Acceptance Criteria**
- Expanded toggle content is sourced from `comparison-prompt.md`.
- Displayed content is stable template text, not submission-specific interpolated output.

### FR-2: Runtime Model 3 request prompt remains unchanged
The update shall not change how the actual Model 3 request prompt is generated and sent.

**Acceptance Criteria**
- Existing runtime prompt assembly (`buildSafeComparisonPrompt`) remains in use for the Model 3 query payload.
- Model 3 request behavior and preconditions remain unchanged.

### FR-3: Preserve third-panel lifecycle behavior
Loading/success/error behavior of the third panel shall remain as currently implemented.

**Acceptance Criteria**
- Existing waiting message and spinner behavior remain intact.
- Success response rendering remains intact.
- Error rendering remains intact.

## Technical Requirements

### TR-1: Localized display-source switch
Implementation shall be limited to switching the prompt preview display source and updating directly affected tests.

**Acceptance Criteria**
- No unrelated refactors.
- No API contract changes.

### TR-2: Maintain current accessibility semantics
Toggle interaction and expanded region semantics shall remain keyboard operable and screen-reader compatible.

**Acceptance Criteria**
- Toggle remains a button with current expanded/collapsed behavior.
- Expanded prompt text remains programmatically reachable in the existing region.

### TR-3: Update automated tests for new display source
Tests that currently assert runtime-interpolated prompt content in the toggle region shall be updated to assert template-file content.

**Acceptance Criteria**
- Unit and e2e tests validate template-text display.
- Assertions expecting runtime placeholders/values in toggle preview are removed or updated.

### TR-4: Pass project quality gates
All in-scope changes shall pass repository checks.

**Acceptance Criteria**
- `npm run typecheck` passes.
- `npm test` passes.
- `npm run lint` passes.

## Security Requirements

### SR-1: Preserve prompt-safety protections for runtime request generation
The display-source change shall not weaken existing runtime prompt-safety logic.

**Acceptance Criteria**
- `buildSafeComparisonPrompt` path remains unchanged for actual Model 3 requests.
- No new unsafe interpolation path is introduced.

## Out of Scope / Non-Goals

- Showing both runtime prompt and template text simultaneously.
- Changing model orchestration/request ordering.
- Altering server routes or OpenAI request schema.
- Rewriting prompt template files beyond source-selection usage.
