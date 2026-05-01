# Overview

This update hardens comparison prompt assembly against prompt-injection patterns by treating interpolated user/model text as untrusted data, applying deterministic normalization and delimiter controls, and centralizing interpolation in a dedicated utility.

Goals:
- Use `server/assets/prompt-templates/prompt-comparison-template.md` as canonical template source.
- Prevent delimiter breakouts (for example markdown code-fence escapes) when filling placeholders.
- Preserve current compare-flow behavior and prompt-inspection UI.

Out of scope:
- Provider-side policy changes.
- Full redesign of compare architecture.

# Architecture

## High-Level Approach

1. Introduce canonical comparison template file at `server/assets/prompt-templates/prompt-comparison-template.md`.
2. Add a prompt-assembly utility that:
   - normalizes untrusted text,
   - neutralizes fence-breakout patterns,
   - wraps each inserted segment in explicit untrusted markers,
   - performs deterministic placeholder substitution.
3. Update compare UI state assembly path to call utility instead of raw `replaceAll` chains.
4. Keep existing UI toggle and panel behavior unchanged.
5. Add tests for adversarial input handling and regression coverage.

## Affected Files

- `server/assets/prompt-templates/prompt-comparison-template.md`
- `app/composables/use-comparison-ui-state.ts`
- `app/utils/prompt-template-safety.ts` (new)
- `tests/unit/prompt-template-safety.test.ts` (new)
- `tests/unit/app.ui.test.ts` (adjust expected generated prompt invariants as needed)
- `tests/e2e/app.spec.ts` (ensure behavior still validated)

# Interfaces

## Utility Interface

`buildSafeComparisonPrompt(input)`

Input:
- `template: string`
- `originalPrompt: string`
- `response1: string`
- `response2: string`

Output:
- `string` assembled prompt with bounded untrusted data blocks.

Behavior:
- Normalizes line endings and strips null/control disruption bytes.
- Replaces dangerous code-fence sequences in inserted text with neutralized representation.
- Wraps each inserted value in field-specific markers.
- Substitutes all expected placeholders exactly once in deterministic order.

## UI-State Integration

In `useComparisonUiState`, generated prompt computed path calls the utility with current run values only when outer prerequisites succeed.

# Data Flow

1. User submits prompt and receives Model 1 / Model 2 outputs.
2. `useComparisonUiState` verifies both successful outputs.
3. Composable invokes safe prompt builder with canonical template and untrusted values.
4. Result is exposed to comparison panel for read-only inspection.

# Security

- Apply a defense-in-depth prompt framing rule: all inserted user/model segments are explicitly marked as untrusted data.
- Prevent markdown fence breakout via deterministic neutralization of triple-backtick sequences.
- Keep assembly local; no remote template fetching.
- Avoid adding sensitive prompt payload logging.

# Accessibility

No intentional UI semantic changes. Existing prompt toggle accessibility (`aria-expanded`, `aria-controls`, keyboard operability) remains unchanged and is covered by regression tests.

# Testing

## Unit Tests

- New utility tests verify:
  - untrusted markers are added for each substituted field,
  - triple-backtick patterns are neutralized,
  - adversarial instructions are preserved as data text,
  - deterministic output for same input.

- Existing app UI tests verify generated prompt still appears under toggle and includes expected content fragments.

## Integration/E2E Tests

- Existing e2e coverage for prompt visibility continues to pass.
- If needed, add one assertion that generated prompt contains untrusted markers.

## Validation Commands

- `npm run test:unit -- tests/unit/prompt-template-safety.test.ts`
- `npm run test:unit -- tests/unit/app.ui.test.ts`
- `npm run test:e2e -- tests/e2e/app.spec.ts`
- `npm run typecheck && npm test && npm run lint`

# Risks and Mitigations

- **Risk:** Over-sanitization reduces readability of inspected prompt text.
  - **Mitigation:** Apply minimal, targeted neutralization for known delimiter-breakout patterns only.
- **Risk:** Template path migration breaks existing import.
  - **Mitigation:** Update call site and keep placeholder contract unchanged.
- **Risk:** Tests become brittle against wording tweaks.
  - **Mitigation:** Assert structural safety invariants rather than entire prompt snapshots.

# Traceability

| Requirement ID | Design Section | Notes |
|---|---|---|
| FR-1 | Architecture; Utility Interface; Security | Explicit bounded untrusted insertion for all fields. |
| FR-2 | Utility Interface; Security; Testing | Neutralization and normalization behavior. |
| FR-3 | UI-State Integration; Accessibility; Testing | Preserve compare and toggle behavior. |
| TR-1 | Affected Files; Architecture | Canonical template path migration. |
| TR-2 | Utility Interface; Architecture | Centralized safe interpolation utility. |
| TR-3 | Testing | Unit/e2e coverage for hardening regressions. |
| TR-4 | Validation Commands | Full quality gates. |
| SR-1 | Security; Utility Interface | Untrusted data markers and no raw interpolation. |
| SR-2 | Security | No secret-bearing logging added. |
| AR-1 | Accessibility; Testing | Accessibility semantics preserved. |
| PR-1 | Utility Interface; Risks | O(n) targeted transformations only. |
