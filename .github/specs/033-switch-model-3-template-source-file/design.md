# Design

## Overview

This change switches the template file used by the Model 3 prompt-generation path from `prompt-comparison-template.md` to `model-3-prompt-template.md`, while preserving existing prompt-safety handling and runtime behavior.

## Architecture

### Current Flow
1. `useComparisonUiState` imports a raw Markdown prompt template.
2. When Model 1 and Model 2 succeed, it calls `buildSafeComparisonPrompt` with:
   - template text,
   - original prompt,
   - response 1,
   - response 2.
3. Generated prompt is used as the payload for the Model 3 request path.

### Change
- Update only the template import in `app/composables/use-comparison-ui-state.ts`:
  - **from**: `../../server/assets/prompt-templates/prompt-comparison-template.md?raw`
  - **to**: `../../server/assets/prompt-templates/model-3-prompt-template.md?raw`

No other component/composable API is changed.

## Interfaces

### `useComparisonUiState`
- Public return contract remains unchanged.
- Internal variable naming may be updated for clarity, but no external consumers are affected.

### `buildSafeComparisonPrompt`
- Function call signature and behavior remain unchanged.

## Data and State

- No new state fields are introduced.
- No lifecycle transitions are modified.
- Generated Model 3 prompt remains computed under existing success preconditions.

## Validation and Error Handling

- Existing null/empty checks before prompt generation remain unchanged.
- Existing normalized error behavior remains unchanged.

## Security

- Existing safety model is preserved by continuing to route template filling through `buildSafeComparisonPrompt`.
- Untrusted payload boundaries and marker handling remain unchanged.

## Accessibility

- No user-interaction change introduced.
- Accessibility behavior and test expectations remain unchanged.

## Performance

- Template source substitution is constant-time and does not alter request counts or orchestration.

## Testing Strategy

1. Run `npm run typecheck` to validate import path and compile integrity.
2. Run `npm test` to ensure unit/integration behavior remains stable.
3. Run `npm run lint` to ensure style/type/lint conformance.

## Traceability

- **FR-1 / TR-1**: Import path switch in `use-comparison-ui-state.ts`.
- **FR-2 / TR-2 / SR-1**: Unchanged `buildSafeComparisonPrompt` usage and contracts.
- **TR-4 / AR-1 / PR-1**: Full quality gates and no behavior regressions.
