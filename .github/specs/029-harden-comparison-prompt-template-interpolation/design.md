# Overview

This design implements **Approach C (prompt template + comprehensive safeguards)** for comparison-prompt generation by enforcing a canonical template contract, centralized safe interpolation, deterministic normalization, and explicit trusted/untrusted boundaries.

Goals:
- Use one canonical template for comparison prompt structure.
- Route all untrusted interpolation through one pure utility.
- Reduce prompt-injection leverage while preserving response fidelity.
- Keep UX behavior stable and testable.

Out of scope:
- Mandatory two-stage validator LLM flow (Approach D default).
- Semantic rewriting of user/model content.
- Broad comparison-page redesign.

# Architecture

## High-Level Approach

1. Keep a canonical prompt template in `server/assets/prompt-templates/`.
2. Build prompt text using a single utility (e.g., `buildSafeComparisonPrompt`).
3. For each untrusted input (original prompt, response 1, response 2):
   - normalize line endings,
   - strip disallowed control characters,
   - neutralize markdown fence breakout patterns,
   - wrap with explicit sentinel markers.
4. Inject wrapped values into template placeholders.
5. Use the same safeguarded result for preview and model-3 request payload.

## Affected Files (Expected)

- `server/assets/prompt-templates/prompt-comparison-template.md` (canonical template)
- `app/utils/prompt-template-safety.ts` (central safe interpolation utility)
- `app/composables/use-comparison-ui-state.ts` (integration into existing state flow)
- `app/components/ComparisonOutputPanel.vue` (prompt preview toggle/view remains aligned)
- `tests/unit/prompt-template-safety.test.ts` (unit coverage)
- `tests/unit/app.ui.test.ts`, `tests/e2e/app.spec.ts` (behavior/regression coverage)

# Interfaces

## Safe Builder Interface

```ts
type SafePromptBuildInput = {
  template: string;
  originalPrompt: string;
  response1: string;
  response2: string;
};

function buildSafeComparisonPrompt(input: SafePromptBuildInput): string;
```

### Contract
- Input fields are treated as untrusted by default.
- Output is deterministic for identical input.
- Output contains explicit marker pairs for each untrusted field.

## Normalization Steps (Deterministic Order)

1. Normalize line endings (`\r\n?` -> `\n`).
2. Remove disallowed control chars while retaining expected whitespace.
3. Neutralize markdown fence-breakout pattern(s) used by wrapper strategy.
4. Apply size-limit policy for each untrusted section.
5. Wrap with field-specific sentinel markers.

## Placeholder Contract

Template placeholders:
- `{{ORIGINAL_PROMPT}}`
- `{{RESPONSE_1}}`
- `{{RESPONSE_2}}`

Only these placeholders are replaced by the safe builder.

# Data Flow

1. User submits comparison request.
2. Model-1 and model-2 responses are produced.
3. UI state/composable gathers:
   - original user prompt,
   - response-1 text,
   - response-2 text.
4. Safe builder returns safeguarded comparison prompt.
5. Prompt preview displays safeguarded content.
6. Same safeguarded content is sent to model-3 request path.

# Validation and Error Handling

## Generation Preconditions
- Required fields must be present.
- Missing required fields prevent prompt generation and preserve existing status/error semantics.

## Size-Limit Behavior
- Define deterministic policy when size thresholds are exceeded:
  - either bounded truncation with explicit truncation marker,
  - or explicit generation failure surfaced via existing UI error path.
- Policy must be stable, documented, and tested.

## Boundary Integrity Checks
- Ensure every untrusted field has matching start/end markers.
- Fail generation (or use deterministic fallback) if template placeholders are missing.

# Security Design

- **Boundary isolation**: Trusted instructions remain outside untrusted marker blocks.
- **No ad-hoc interpolation**: All untrusted insertion goes through one utility.
- **No remote template fetch**: Template loaded from local server asset only.
- **No secret exposure**: Secrets remain server-side and are excluded from prompt text.
- **Safe rendering**: Display generated prompt as text, not raw HTML.

Residual risks acknowledged:
- LLMs can still be influenced by adversarial semantics.
- Very long untrusted content can reduce trusted-instruction salience.
- Prompt-injection mitigation is risk reduction, not absolute prevention.

# Accessibility

- Keep prompt preview toggle keyboard operable.
- Preserve `aria-expanded` and control-region association.
- Ensure preview region remains readable and semantically stable.

# Testing Strategy

## Unit Tests
- Marker insertion and ordering.
- Control-character stripping behavior.
- Fence neutralization behavior.
- Determinism for identical inputs.
- Size-limit behavior and edge cases.

## UI/Component Tests
- Prompt preview remains collapsed by default.
- Expand/collapse behavior unchanged.
- Previewed prompt includes expected safeguard markers.

## E2E Tests
- Compare flow still works with model-3 preview path.
- Safeguarded prompt text is visible when expanded.
- Existing output/error/placeholder behavior remains unchanged.

## Quality Gates
- `npm run typecheck`
- `npm test`
- `npm run lint`

# Traceability

| Requirement ID | Design Section | Notes |
|---|---|---|
| FR-1 | Architecture; Placeholder Contract | Canonical template and placeholder-only interpolation. |
| FR-2 | Interfaces; Security Design | Central safe builder as single interpolation path. |
| FR-3 | Interfaces; Validation and Error Handling | Deterministic sentinel boundaries and integrity checks. |
| FR-4 | Normalization Steps; Unit Tests | Deterministic normalization and fence neutralization. |
| FR-5 | Validation and Error Handling; Unit Tests | Deterministic size-limit policy and coverage. |
| FR-6 | Data Flow; UI/Component Tests; E2E Tests | Preview/request alignment and UX stability. |
| TR-1 | Interfaces; Normalization Steps | Pure deterministic utility behavior. |
| TR-2 | Architecture; Affected Files | Scoped changes in existing Nuxt/Vue structure. |
| TR-3 | Testing Strategy | Explicit coverage across unit/UI/e2e. |
| TR-4 | Quality Gates | Required repository checks. |
| SR-1 | Interfaces; Security Design | Treat all source content as untrusted. |
| SR-2 | Security Design | Keep trusted instructions outside untrusted blocks. |
| SR-3 | Security Design; Data Flow | Secret handling and safe rendering constraints. |
| AR-1 | Accessibility | Toggle semantics and keyboard operability retained. |
| PR-1 | Architecture; Normalization Steps | Linear, lightweight default-path processing. |
