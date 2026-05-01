# Overview

This update adds an inspectable, toggle-controlled view of the generated Model 3 comparison prompt in the third output panel, using the existing template asset and current comparison run data.

Goals:
- Generate Model 3 prompt text from `server/assets/prompt-templates/model-3-prompt-template.md` after Model 1 and Model 2 succeed.
- Expose that generated prompt behind an in-panel toggle labeled `Prompt for Model 3`.
- Keep existing third-panel output/error/placeholder behavior unchanged.

Out of scope:
- Editing template semantics/content.
- New provider API contracts.
- Broader compare-page redesign.

# Architecture

## High-Level Approach

1. Reuse the existing Model 3 prompt-generation path (template + placeholder substitution) in current comparison state flow.
2. Ensure generated Model 3 prompt text is stored in comparison UI state for the active run when prerequisites are met.
3. Add third-panel local UI state (or composable state scoped to the panel) for prompt-view expanded/collapsed behavior.
4. Render a toggle control above the third-panel placeholder/output area to show/hide read-only generated prompt text.
5. Reset toggle state to collapsed when a new run starts or when panel context changes.

## Affected Files

Expected primary files:
- `app/components/ComparisonOutputPanel.vue` (third-panel toggle UI and prompt region rendering)
- `app/composables/use-comparison-ui-state.ts` (prompt text derivation/exposure and toggle reset hooks if centrally managed)
- `server/assets/prompt-templates/model-3-prompt-template.md` (read-only source; no semantic changes expected)
- `tests/unit/*` and/or `tests/unit/models-selector.test.ts` adjacent compare-ui tests if panel behavior coverage exists there
- `tests/e2e/app.spec.ts` (toggle behavior + generated prompt visibility path)

Possible supporting files (if existing architecture already owns this concern):
- `server/api/*` or `server/utils/*` where template substitution for compare flow is performed
- `types/*` only if a new explicit UI-state field type is needed

## Design Constraints

- Keep the feature additive; no regressions to existing compare flow.
- Do not add heavy dependencies.
- Preserve existing names and contracts unless required by in-scope requirements.

# Interfaces

## UI Interface

Third panel must include:
- A visible control labeled `Prompt for Model 3`.
- Programmatic expanded/collapsed state.
- A controlled read-only region that displays generated prompt text when expanded.

Preferred semantic pattern:
- `<button>` with `aria-expanded` and `aria-controls` targeting a stable prompt-region ID.
- Prompt region hidden/collapsed when toggle is off.

## State Interface

Comparison UI state should expose:
- `generatedModel3Prompt` (string | null) for current run.
- `isModel3PromptExpanded` (boolean) if centralized, or equivalent local state in the third panel.
- A reset path setting expansion to `false` on new run start.

## Template Substitution Interface

Prompt generation consumes:
- `userPrompt`
- `model1ResponseText`
- `model2ResponseText`

Generation output:
- Fully substituted model-3 prompt string.

If any required value is missing, the interface returns no generated prompt for display.

# Data

No persistent data-model changes.

Runtime-only data additions:
- Generated model-3 prompt string for the active session/run.
- Toggle boolean state for prompt visibility.

No API schema changes expected.

# Validation/Error Handling

- Guard prompt generation on required inputs (user prompt + model1/model2 response text).
- If required values are missing or upstream failed, do not display a fabricated prompt.
- Preserve existing third-panel error/placeholder states and precedence rules.
- Reset expanded state safely when run context changes to avoid stale prompt visibility.

# Security

- Template source remains local repository asset; no runtime remote template fetching (mitigates SSRF-style risks for this path).
- Prompt-view rendering uses plain text rendering, not untrusted HTML injection.
- Do not include runtime secret/config values in prompt content.
- No new sensitive logging introduced.

# Accessibility

- Use a native button for toggle interaction to ensure keyboard operability.
- Expose toggle state with `aria-expanded`.
- Associate toggle and content region with `aria-controls` + stable region `id`.
- Keep hidden prompt region out of keyboard focus when collapsed.
- Ensure readable contrast and preserved whitespace formatting for prompt text.

# Testing

## Unit/Component Coverage

Add or update tests to verify:
- Generated Model 3 prompt includes substituted original prompt/model1/model2 content.
- Toggle labeled `Prompt for Model 3` is rendered in third panel.
- Default state is collapsed.
- Toggle expands/collapses controlled prompt view.
- Missing prerequisite data does not display misleading prompt content.

## End-to-End Coverage

Add/update `tests/e2e/app.spec.ts` (or equivalent) to verify:
- Third panel shows `Prompt for Model 3` toggle.
- Prompt text is hidden by default and visible after toggle activation.
- Existing third-panel output behavior still works in compare flow.

## Validation Commands

- Run targeted unit/component tests for changed files.
- Run targeted e2e tests touching third-panel compare flow.
- Run project quality gates: `npm run typecheck`, `npm test`, `npm run lint`.

# Open Questions

None blocking.

# Traceability

| Requirement ID | Design Section | Notes |
|----------------|----------------|-------|
| FR-1 | Architecture; Interfaces; Validation/Error Handling; Testing | Defines prerequisite-gated template generation and substitution data. |
| FR-2 | Interfaces; Accessibility; Testing | Defines `Prompt for Model 3` toggle and controlled prompt region behavior. |
| FR-3 | Interfaces; Validation/Error Handling; Testing | Sets collapsed default and reset behavior for new runs. |
| FR-4 | Architecture; Validation/Error Handling; Testing | Preserves existing third-panel output/error/placeholder semantics. |
| TR-1 | Architecture; Interfaces; Security | Uses canonical template asset path and deterministic substitution. |
| TR-2 | Architecture; Data | Keeps changes localized to current UI/state flow without API contract changes. |
| TR-3 | Testing | Adds automated verification for generation + toggle behavior. |
| TR-4 | Testing | Requires targeted and full quality gate execution. |
| SR-1 | Security; Validation/Error Handling | Uses local template + current-run data only, with guarded rendering. |
| SR-2 | Security | Prevents secret/config leakage in prompt inspection view and logs. |
| AR-1 | Accessibility; Interfaces | Ensures keyboard-operable, semantically correct toggle state exposure. |
| AR-2 | Accessibility; Interfaces; Validation/Error Handling | Programmatic association and hidden-state behavior for controlled region. |
