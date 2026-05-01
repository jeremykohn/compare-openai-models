# Design

## Overview

This change is a targeted UI copy update across three user-visible strings: main title, subtitle, and model-selector helper text. No application behavior changes are introduced.

## Architecture

### Affected UI locations
- `app/app.vue`
  - Main title heading (`h1`)
  - Subtitle paragraph under heading
- `app/components/ModelsSelector.vue`
  - Helper text beneath model dropdowns

### Behavioral impact
- None. Existing model orchestration, prompt handling, and response rendering remain unchanged.

## Interfaces and Contracts

- No component prop/event contracts change.
- No composable/server API contracts change.
- Only static string literals are updated.

## Accessibility

- Preserve existing semantic structure:
  - `h1` remains page title.
  - Subtitle remains descriptive paragraph text.
  - Helper text remains associated contextual guidance under dropdown section.
- No keyboard/focus interaction changes.

## Security

- No input handling, interpolation, or request-path changes.
- No additional security exposure introduced by static copy updates.

## Performance

- Copy updates are static text changes only.
- No additional imports, dynamic computation, or network requests.

## Testing Strategy

Update tests that assert old copy strings:
- `tests/unit/app.ui.test.ts` (main heading)
- `tests/unit/models-selector.test.ts` (helper text)
- `tests/e2e/app.spec.ts` (main heading references)

Then run full checks:
1. `npm run typecheck`
2. `npm test`
3. `npm run lint`

## Traceability

- **FR-1**: `app/app.vue` heading text update + unit/e2e assertions.
- **FR-2**: `app/app.vue` subtitle text update.
- **FR-3**: `app/components/ModelsSelector.vue` helper text update + unit assertion.
- **TR-3/TR-4**: Test assertion updates and full quality-gate execution.
