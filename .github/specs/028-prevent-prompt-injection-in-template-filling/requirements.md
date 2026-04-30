# Requirements

## Functional Requirements

### FR-1: Assemble comparison prompt with bounded untrusted segments
The application shall assemble the comparison prompt by inserting user prompt and model responses as explicitly bounded untrusted data segments rather than raw interpolation.

**Acceptance Criteria**
- Inserted values are wrapped with deterministic begin/end markers per field.
- Markers are present for original prompt, response 1, and response 2 in the final generated prompt.
- Prompt generation remains deterministic for the same inputs.

### FR-2: Neutralize template-breakout patterns in inserted content
The application shall neutralize content patterns that can break template delimiting, including markdown code-fence breakout sequences.

**Acceptance Criteria**
- Inserted values containing triple-backtick fences are transformed so they cannot terminate outer data boundaries.
- Control characters that can corrupt prompt structure are normalized or removed.
- The resulting prompt remains readable and parseable as plain text instructions plus data blocks.

### FR-3: Preserve existing compare-flow behavior
Prompt-safety hardening shall not break existing compare-flow behavior for generating and displaying Model 3 prompt content.

**Acceptance Criteria**
- Valid runs still generate prompt text for comparison after successful Model 1 and Model 2 outputs.
- Existing toggle/visibility behavior for `Prompt for Model 3` remains unchanged.
- Existing error and waiting states continue to behave as before.

## Technical Requirements

### TR-1: Use canonical comparison template path
Implementation shall use `server/assets/prompt-templates/prompt-comparison-template.md` as the canonical source template for comparison prompt assembly.

**Acceptance Criteria**
- Prompt assembly reads the canonical template path above.
- Legacy template path usage in assembly logic is removed or redirected to canonical path.
- Template placeholders remain explicitly mapped and deterministic.

### TR-2: Centralize safe interpolation logic
Implementation shall centralize prompt-safe interpolation in a dedicated utility to avoid ad-hoc replacement logic.

**Acceptance Criteria**
- A single utility is responsible for normalization, bounding, and placeholder replacement.
- Assembly call sites use the utility instead of direct chained `replaceAll` calls on untrusted input.
- Utility behavior is covered by unit tests.

### TR-3: Add regression tests for prompt-injection hardening
Automated tests shall verify safe handling of instruction-like and fence-breakout content.

**Acceptance Criteria**
- Tests include adversarial strings such as `ignore previous instructions` and code-fence sequences.
- Tests verify markers and neutralized output patterns in generated prompt text.
- Existing tests for compare-flow prompt generation continue to pass.

### TR-4: Keep quality gates passing
All in-scope changes shall pass repository quality gates.

**Acceptance Criteria**
- `npm run typecheck` passes.
- `npm test` passes.
- `npm run lint` passes.

## Security Requirements

### SR-1: Treat interpolated values as untrusted data
Interpolated values must be treated as data payloads and must not be allowed to modify instruction hierarchy of the assembled prompt.

**Acceptance Criteria**
- Assembled prompt contains an explicit instruction that bounded sections are untrusted data.
- Untrusted sections are delimited with unambiguous markers.
- No raw unbounded insertion of user/model text occurs in prompt assembly.

### SR-2: Prevent sensitive-data leakage through hardening logic
Prompt hardening must not introduce new logging or serialization of secrets.

**Acceptance Criteria**
- No new logs print full prompt payloads containing user/model data.
- No runtimeConfig secrets or API keys are interpolated into generated prompt text by hardening logic.
- Existing redaction/sanitization behavior remains intact.

## Accessibility Requirements

### AR-1: Preserve accessible prompt-inspection controls
Prompt-hardening changes shall not regress accessibility semantics of prompt inspection controls.

**Acceptance Criteria**
- Toggle keeps accessible name `Prompt for Model 3`.
- Toggle still exposes correct `aria-expanded` state and controlled region association.
- Keyboard operation remains functional.

## Performance Requirements

### PR-1: Keep interpolation overhead minimal
Hardening logic shall run in linear time relative to combined inserted text size and avoid heavy dependencies.

**Acceptance Criteria**
- Interpolation complexity is O(n) for inserted content length.
- No additional runtime dependencies are introduced solely for this hardening.
- Prompt generation latency remains within existing UX expectations for normal payload sizes.

## Assumptions and Constraints

### Assumptions
- Template placeholders are `{{ORIGINAL_PROMPT}}`, `{{RESPONSE_1}}`, and `{{RESPONSE_2}}`.
- User prompt and model responses are untrusted strings.

### Constraints
- Keep changes scoped to template assembly and related tests.
- Avoid API contract changes.
- Preserve existing compare-panel rendering and state flow.

## Out of Scope / Non-Goals

- Guaranteeing absolute protection against all model-level injection behavior.
- Adding external moderation services.
- Reworking unrelated UI components or selectors.
