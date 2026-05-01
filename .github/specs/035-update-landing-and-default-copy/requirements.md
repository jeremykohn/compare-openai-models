# Requirements

## Functional Requirements

### FR-1: Update main title text
The app shall change the landing page main heading text from `ChatGPT prompt tester` to `Compare OpenAI Models`.

**Acceptance Criteria**
- A visible top-level heading renders exactly `Compare OpenAI Models`.
- `ChatGPT prompt tester` is no longer shown as the main title.

### FR-2: Update subtitle text
The app shall change the subtitle from `Send a prompt and see the response.` to `Send a prompt to two models, and compare the two responses using a third model.`

**Acceptance Criteria**
- Subtitle renders exactly `Send a prompt to two models, and compare the two responses using a third model.`
- Previous subtitle copy is no longer present.

### FR-3: Update default-model helper text under dropdowns
The helper text under model selectors shall change from `Uses gpt-4.1-mini by default if none is selected.` to `Each model is gpt-4.1-mini by default if not otherwise selected.`

**Acceptance Criteria**
- Helper text renders exactly `Each model is gpt-4.1-mini by default if not otherwise selected.`
- Previous helper text is no longer present.

## Technical Requirements

### TR-1: Keep change localized to copy updates and directly impacted tests
Implementation shall only modify UI copy and tests asserting those strings.

**Acceptance Criteria**
- No behavioral logic changes in model query/orchestration paths.
- Only copy-related files/tests are modified for this feature.

### TR-2: Preserve semantic structure and accessibility intent
Text replacements shall keep existing heading/paragraph/label semantics intact.

**Acceptance Criteria**
- Heading level structure remains unchanged.
- Existing accessibility semantics remain valid after copy replacement.

### TR-3: Update automated tests for new copy
All tests asserting old copy must be updated to new exact strings.

**Acceptance Criteria**
- Unit and e2e tests pass with updated copy assertions.
- No residual assertions depend on removed text.

### TR-4: Pass quality gates
All in-scope changes shall pass repository checks.

**Acceptance Criteria**
- `npm run typecheck` passes.
- `npm test` passes.
- `npm run lint` passes.

## Security Requirements

### SR-1: No security behavior change
Copy updates shall not alter data handling, auth, or request security boundaries.

**Acceptance Criteria**
- No new client/server data pathways introduced.
- No secret handling/logging changes introduced.

## Accessibility Requirements

### AR-1: Preserve readable, descriptive copy
Updated copy shall remain clear and descriptive for assistive technology users.

**Acceptance Criteria**
- Title and subtitle remain human-readable and descriptive.
- Existing label/help-text associations remain intact.

## Performance Requirements

### PR-1: No performance regression
Copy-only updates shall not add runtime overhead or requests.

**Acceptance Criteria**
- No additional network calls introduced.
- No measurable rendering workflow changes introduced.

## Out of Scope / Non-Goals

- Any redesign of page layout/components.
- Any model-selection or model-query logic changes.
- Any internationalization framework addition.
