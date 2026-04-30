# Requirements

## Functional Requirements

### FR-1: Use one canonical template for comparison-prompt generation
The application shall generate the comparison prompt from a single canonical template asset and shall not use ad-hoc prompt construction for this flow.

**Acceptance Criteria**
- Prompt generation references one canonical template path under `server/assets/prompt-templates/`.
- The generated prompt is assembled by replacing only supported placeholders.
- No alternate inline template strings are used in comparison UI logic.

### FR-2: Route all untrusted interpolation through one safe builder
The application shall use one centralized utility to insert untrusted content into the canonical template.

**Acceptance Criteria**
- The utility accepts exactly the untrusted fields required for this flow: original prompt, model-1 response, model-2 response.
- Placeholder replacement for these fields occurs only inside this utility.
- The same utility output is used for both prompt preview and request path.

### FR-3: Mark untrusted sections with deterministic sentinel boundaries
The application shall wrap each untrusted value with explicit start/end markers unique to that field.

**Acceptance Criteria**
- Each field has unique marker names (e.g., `UNTRUSTED_ORIGINAL_PROMPT`, `UNTRUSTED_RESPONSE_1`, `UNTRUSTED_RESPONSE_2`).
- Generated output always includes matching start/end marker pairs for each untrusted field.
- Marker order is deterministic and stable across runs for identical input.

### FR-4: Apply deterministic normalization and fence neutralization
The application shall normalize untrusted text before insertion to reduce structural prompt-injection leverage.

**Acceptance Criteria**
- Line endings are normalized consistently.
- Disallowed control characters are removed deterministically.
- Markdown fence-breakout sequences are neutralized deterministically.
- Normalization is idempotent for already-normalized input.

### FR-5: Enforce section-size safeguards for untrusted inputs
The application shall enforce explicit size limits for untrusted sections and use predictable handling when limits are exceeded.

**Acceptance Criteria**
- A documented max size exists for each untrusted section.
- Oversized input behavior is deterministic (e.g., truncation marker or explicit generation error).
- The chosen behavior is covered by automated tests.

### FR-6: Preserve current comparison UX while showing safeguarded prompt
The existing prompt-preview toggle and comparison flow shall remain intact, but always display safeguarded generated prompt content.

**Acceptance Criteria**
- Prompt preview remains collapsed by default and can be expanded by user action.
- Prompt preview content includes expected safeguard markers.
- Existing result/error/placeholder behavior for comparison output remains unchanged.

## Technical Requirements

### TR-1: Keep prompt assembly deterministic and side-effect free
Prompt assembly shall be implemented as a pure utility function with deterministic output.

**Acceptance Criteria**
- For identical inputs, output is byte-for-byte identical.
- Utility does not read mutable global state or perform network I/O.
- Utility behavior is unit-testable without framework bootstrapping.

### TR-2: Keep implementation scoped to existing architecture
The change shall use existing Nuxt/Vue composables and components with minimal surface-area expansion.

**Acceptance Criteria**
- No breaking changes to existing API contracts.
- No new heavy dependencies.
- State changes remain localized to comparison-related files.

### TR-3: Maintain and extend automated test coverage
Tests shall validate safeguard behavior and ensure no regressions in existing prompt-preview behavior.

**Acceptance Criteria**
- Unit tests cover marker insertion, control-character handling, fence neutralization, determinism, and size-limit behavior.
- UI/unit and e2e tests verify safeguarded prompt visibility and expected toggle behavior.
- Existing tests for comparison flow continue passing.

### TR-4: Pass repository quality gates
All in-scope changes shall pass the project quality gates.

**Acceptance Criteria**
- `npm run typecheck` passes.
- `npm test` passes.
- `npm run lint` passes.

## Security Requirements

### SR-1: Treat user prompt and model outputs as untrusted data
All user-provided prompt text and model response text shall be handled as untrusted before interpolation.

**Acceptance Criteria**
- Untrusted fields are always wrapped in sentinel markers.
- Untrusted fields are always normalized before insertion.
- No path bypasses the safe builder for these fields.

### SR-2: Keep trusted instructions outside untrusted blocks
System instructions and template-controlled guidance shall remain outside marked untrusted regions.

**Acceptance Criteria**
- Template structure clearly separates trusted instructions from untrusted inserts.
- Trusted sections are not composed from user/model text.
- Tests verify expected trusted/untrusted boundary structure.

### SR-3: Prevent secret exposure and unsafe rendering
The prompt-preview output shall not expose secrets and shall render untrusted content safely.

**Acceptance Criteria**
- Prompt preview includes only template text plus normalized user/model content.
- No runtime secret values are interpolated or logged in this feature path.
- UI rendering uses text-safe rendering patterns for model-generated content.

## Accessibility Requirements

### AR-1: Preserve keyboard and assistive-tech operability of prompt preview toggle
The prompt preview toggle shall remain keyboard operable and expose correct state semantics.

**Acceptance Criteria**
- Toggle is focusable and operable via keyboard.
- Toggle state is conveyed programmatically (expanded/collapsed).
- Controlled region is correctly associated with the toggle.

## Performance Requirements

### PR-1: Keep safeguard processing lightweight for typical payloads
Safeguard transformations shall add minimal overhead to prompt generation for normal comparison inputs.

**Acceptance Criteria**
- Prompt generation remains synchronous and bounded by linear processing over input text.
- No additional LLM call is required for the default path.
- UI interactions remain responsive for typical usage.

## Assumptions and Constraints

### Assumptions
- Existing comparison flow already provides current original prompt plus model-1/model-2 response text.
- Canonical template placeholders remain stable and documented.

### Constraints
- Maintain fidelity of user/model text except structural safety transforms.
- Do not make Approach D validator-call mandatory in this spec.
- Keep changes compatible with current Nuxt/Vue + TypeScript conventions.

## Out of Scope / Non-Goals

- Replacing the template approach with ad-hoc dynamic prompt construction.
- Introducing a mandatory validator LLM pass for every request.
- Adding unrelated UI features or redesigning comparison layout.
- Semantically rewriting or summarizing responses as part of safeguard logic.
