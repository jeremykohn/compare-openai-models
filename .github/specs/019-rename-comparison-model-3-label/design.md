# Overview

This update is a narrow UI terminology change for the third comparison-model dropdown. The implementation changes the visible label from `Model for comparing outputs` to `Model 3 for comparing responses` and aligns directly related internal names used by the comparison UI and its tests.

The design preserves all existing behavior, data flow, and rendering logic. No backend, API, or comparison-processing logic changes are required.

## Goals

- Update the third dropdown’s visible label to the approved new text.
- Keep the control’s accessible name aligned with the visible label.
- Improve clarity in directly related UI/test identifiers where current naming still reflects older terminology.
- Preserve existing runtime behavior and coverage.

## Scope

In scope:
- Comparison UI components and templates that render the third dropdown label
- Any UI-level constants, computed properties, or helper names dedicated to that dropdown
- Relevant automated tests that query or describe the control by name

Out of scope:
- Server routes and backend assets
- Request/response contracts
- Comparison business logic and state rules
- Broader copy or naming cleanup beyond this targeted control

# Architecture

## High-Level Approach

The implementation is a presentation-layer rename with limited internal terminology cleanup.

1. Locate the UI component or template that renders the third comparison-model dropdown label.
2. Replace the label string with `Model 3 for comparing responses`.
3. Update any directly associated accessible labeling mechanism to use the same wording.
4. Rename only those internal identifiers that specifically model this third dropdown and whose current names reduce clarity.
5. Update tests and selectors that reference the old wording.

## Affected Areas

Likely affected files are limited to:
- `app/app.vue` if it renders the third selector directly
- Any extracted comparison selector component under `app/components/`
- Any comparison UI composable under `app/composables/` that exposes third-selector-specific names
- UI tests under `tests/` that locate or describe the control by label

## Change Boundaries

- No change to control visibility conditions
- No change to submitted values or state shape
- No change to selection side effects
- No change to server communication

# Interfaces

## User Interface Surface

The user-facing interface change is limited to the label text shown next to or associated with the third dropdown.

- Old label: `Model for comparing outputs`
- New label: `Model 3 for comparing responses`

If the control uses a native `<label>` element, the text content is updated there. If the control uses `aria-label` or `aria-labelledby`, those values must be updated to align with the new visible text.

## Test Interfaces

Tests that query the dropdown by role/name or label text must be updated to the new wording.

Examples of impacted query patterns:
- `getByLabel('Model for comparing outputs')` → updated to use the new text
- `getByRole('combobox', { name: /Model for comparing outputs/i })` → updated to the new accessible name
- Page-object or selector helper names that explicitly encode the old terminology

No API interfaces or external contracts change.

# Data

## State and Data Flow

No new state is introduced.

The existing third-selector state continues unchanged:
- current selected model value
- conditional rendering state for whether the third selector is shown
- any emitted or lifted value used in comparison submission

This update only changes descriptive text and internal naming around that state.

## Data Contract Impact

There is no change to:
- client-side request payloads
- server-side request parsing
- response shapes
- cached assets or config files

# Validation/Error Handling

## Validation Approach

No new validation logic is required.

The updated implementation must preserve all existing validation and control rules for the third selector. Any tests that verify availability or selection behavior remain behaviorally unchanged after updating queries/names.

## Error Handling Approach

No new error paths are introduced.

The update must not modify:
- user-facing error messages
- error boundaries or fallback UI
- logging or diagnostics

The only acceptable behavior change is the updated control label text.

# Security

This change does not alter authentication, authorization, secrets handling, input validation boundaries, or external integrations.

Security design decision:
- Keep the implementation scoped to presentation and test naming updates only.
- Avoid introducing unrelated source changes that could affect request handling or application behavior.

No dedicated security controls or mitigations beyond scope containment are required for this update.

# Accessibility

## Labeling Strategy

The dropdown’s accessible name must remain aligned with its visible label.

Preferred implementation order:
1. Use a visible native `<label>` associated with the dropdown control.
2. If an ARIA-based naming mechanism is already in place, update it so the accessible name contains `Model 3 for comparing responses`.
3. Avoid divergent visible/programmatic naming.

## Interaction Preservation

The rename must not affect:
- tab order
- keyboard operability
- focus visibility
- role exposure of the dropdown control

## Accessibility Test Impact

Existing accessibility-oriented tests should continue to query the dropdown by user-perceivable name. Queries should be updated to the new label rather than switched to brittle implementation selectors.

# Testing

## Test Strategy

Use targeted updates to existing coverage rather than adding broad new test infrastructure.

### Unit/UI tests
- Update assertions for rendered label text in any component-level tests covering the third selector.
- Update queries that use the old label or accessible name.

### Integration tests
- If integration coverage references the third selector by label or role/name, update those queries to the new text.
- Keep assertions focused on behavior parity.

### End-to-end tests
- Update any Playwright flows that target the third dropdown by visible label or accessible name.
- Preserve behavior assertions for visibility, selection, and comparison flow.

## Verification Focus

The implementation is complete when tests show:
- the renamed label is rendered
- the control remains discoverable by accessible name
- existing third-selector behavior remains unchanged

# Assumptions

- The approved final label text is exactly `Model 3 for comparing responses`.
- The target control is the third dropdown used for comparison flows.
- Any internal naming changes are limited to identifiers explicitly tied to this control.

# Constraints

- Do not change behavior, state shape, or API interactions.
- Do not broaden the change into unrelated terminology cleanup.
- Keep source changes minimal and local to the relevant UI/test surfaces.

# Open Questions

None.

# Traceability

| Requirement ID | Design Section | Notes |
|----------------|----------------|-------|
| FR-1 | Interfaces; Testing | Defines exact visible label replacement and verification points. |
| FR-2 | Interfaces; Accessibility; Testing | Covers accessible naming alignment and how tests should verify it. |
| FR-3 | Architecture; Data; Validation/Error Handling; Testing | Preserves existing third-selector behavior and state flow. |
| FR-4 | Interfaces; Testing | Limits updates to relevant selectors and test references. |
| TR-1 | Architecture; Interfaces | Constrains internal renaming to targeted identifiers tied to the control. |
| TR-2 | Architecture; Data; Security | Keeps implementation scoped away from backend, contract, and unrelated UI changes. |
| TR-3 | Testing | Requires behaviorally equivalent regression coverage after rename. |
| TR-4 | Interfaces; Data | Confirms no API, config, or public contract changes. |
| AR-1 | Accessibility; Interfaces | Preserves visible/programmatic label parity. |
| AR-2 | Accessibility | Preserves keyboard access, focus behavior, and role exposure. |
| AR-3 | Accessibility; Testing | Requires accessible-name-based automated queries to use updated terminology. |