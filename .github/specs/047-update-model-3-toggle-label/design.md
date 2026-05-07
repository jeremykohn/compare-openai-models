# Design

## Overview

This update performs a copy-only change for the Model 3 prompt toggle label in the comparison output panel. The existing toggle behavior, state management, and prompt content rendering remain unchanged.

## Architecture

No architectural changes are required.

Affected files:
- `app/components/ComparisonOutputPanel.vue`
- `tests/unit/app.ui.test.ts`
- `tests/e2e/app.spec.ts`

## Interfaces

### UI Contract

- Update the visible label text in the Model 3 prompt toggle to:
  - `View the prompt sent to Model 3 for comparing Response 1 and Response 2`
- Keep existing selector and interaction contract intact.

## Data

No data model changes.

No changes to:
- request payloads,
- response payloads,
- prompt-generation inputs/outputs,
- component state shape.

## Validation/Error Handling

No new validation rules.

Existing error and loading behavior remains unchanged.

## Security

- No new inputs, sinks, or transport surfaces are introduced.
- No changes to sanitization, prompt safety, or backend handling.

## Accessibility

- Updated control text is more descriptive and action-oriented.
- Interaction semantics remain unchanged for keyboard and assistive technology users.

## Testing

- Update unit test label assertions that currently expect `Comparison prompt for Model 3`.
- Update E2E test label assertions that currently expect `Comparison prompt for Model 3`.
- Keep all non-label behavior checks unchanged.

## Open Questions

- None.

## Traceability

| Requirement ID | Design Section | Notes |
|----------------|----------------|-------|
| FR-1 | Interfaces, Testing | Exact label replacement in component and assertions. |
| FR-2 | Overview, Architecture, Validation/Error Handling | Behavior explicitly unchanged. |
| FR-3 | Data, Testing | Prompt content path and output unchanged. |
| TR-1 | Architecture, Interfaces | Copy-only component change in existing toggle markup. |
| TR-2 | Testing | Unit and E2E assertions updated to new text. |
| TR-3 | Data, Security | No backend/API modifications. |
| AR-1 | Accessibility, Interfaces | New label remains descriptive for disclosure content. |
