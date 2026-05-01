# Requirements

## Functional Requirements

### FR-1: Use `model-3-prompt-template.md` as the Model 3 template source
The Model 3 prompt-generation flow shall load template content from `server/assets/prompt-templates/model-3-prompt-template.md`.

**Acceptance Criteria**
- The template import/reference used for Model 3 prompt assembly points to `model-3-prompt-template.md`.
- The previous template source `prompt-comparison-template.md` is not referenced by the active Model 3 prompt-generation path.

### FR-2: Preserve Model 3 prompt-generation behavior
Switching template source file shall not alter the surrounding prompt-generation workflow.

**Acceptance Criteria**
- Model 3 prompt generation still occurs only when the existing success preconditions are met.
- Existing interpolation/safety logic (`buildSafeComparisonPrompt`) remains in place.
- Existing prompt payload construction for Model 3 requests remains unchanged except for template source file.

### FR-3: Preserve user-visible Model 3 request lifecycle behavior
The update shall not regress visible UI behavior for Model 3 loading/success/error states.

**Acceptance Criteria**
- Third-panel loading/success/error rendering behavior remains as currently implemented.
- No new UI elements or interactions are introduced by this change.

## Technical Requirements

### TR-1: Apply a minimal, localized code change
Implementation shall be limited to template-source switching and directly impacted tests/docs.

**Acceptance Criteria**
- Change is localized to the template import/reference and any directly affected tests/spec artifacts.
- No unrelated refactors are introduced.

### TR-2: Keep existing prompt-safety boundary and APIs intact
Template-source switch shall not weaken safety checks or change function contracts.

**Acceptance Criteria**
- `buildSafeComparisonPrompt` usage remains unchanged.
- No changes to request/response contracts in app/server APIs.

### TR-3: Maintain deterministic behavior in test coverage
Automated tests shall continue to validate behavior deterministically after the source-file switch.

**Acceptance Criteria**
- Existing tests pass after update.
- Any template-source-specific assertions are updated if needed.

### TR-4: Pass project quality gates
All in-scope changes shall pass repository quality checks.

**Acceptance Criteria**
- `npm run typecheck` passes.
- `npm test` passes.
- `npm run lint` passes.

## Security Requirements

### SR-1: Preserve current prompt injection safeguards
Switching template files shall preserve established untrusted-input handling practices.

**Acceptance Criteria**
- Prompt generation still uses the current safe interpolation utility.
- No new interpolation logic is introduced.

## Accessibility Requirements

### AR-1: No accessibility regression from source switch
Because this change is internal source selection, accessibility behavior shall remain unchanged.

**Acceptance Criteria**
- Existing accessibility test coverage remains passing.

## Performance Requirements

### PR-1: No additional network or compute overhead
Template-source switch shall not add extra requests or repeated template loads beyond existing behavior.

**Acceptance Criteria**
- Number of model API calls per submission remains unchanged.
- No new polling/background operations are introduced.

## Out of Scope / Non-Goals

- Prompt-template content rewrite.
- Prompt-template schema redesign.
- UI behavior redesign for Model 3 panels.
- Model request orchestration changes.
