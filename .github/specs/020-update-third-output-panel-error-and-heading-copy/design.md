# Overview

This update changes only the third output panel copy for error and non-error comparison states. The implementation replaces specific heading/message strings while preserving existing state logic, data flow, and conditional rendering.

Goals:
- Apply the exact new error-state heading and message prefix copy.
- Apply the exact new non-error heading copy.
- Preserve all existing comparison state behavior and descriptor assembly.
- Keep test coverage aligned with updated copy.

Out of scope:
- Query behavior changes
- Server/API/data-contract changes
- Copy updates outside the third panel

# Architecture

## High-Level Approach

The change is presentation-only in the app shell where the third output panel is rendered.

1. Update third-panel non-error heading text in the existing comparison panel render branch.
2. Update third-panel error message prefix while preserving existing `erroredModelDescriptors` assembly logic.
3. Add/update third-panel error heading rendering in the existing error branch.
4. Update unit/e2e assertions that verify this copy.

## Affected Surfaces

- `app/app.vue`
  - Third-panel heading in success/non-error branch
  - Third-panel heading/message in error branch
  - Existing computed `comparisonErrorText` string composition
- `tests/unit/app.ui.test.ts`
  - Assertions for third-panel heading and error message copy
- `tests/unit/app.a11y.test.ts` (if it asserts third-panel headings/messages)
- `tests/e2e/app.spec.ts`
  - Assertions covering third-panel non-error and error copy
- `tests/e2e/accessibility.spec.ts` (if it asserts panel copy)

No architectural changes are required.

# Interfaces

## UI Text Contract

Third panel copy must render exactly as follows:

- Error state (when either model query fails):
  - Heading: `Error: Cannot produce comparison`
  - Message prefix: `Unable to compare model outputs due to errors when querying `
  - Suffix: existing descriptor string from current logic (`{models-that-errored}`)

- Non-error comparison-ready state:
  - Heading: `Comparison of responses from Model 1 and Model 2`

## State Branches

Existing branches remain unchanged:
- Waiting/loading branch
- Error branch (`hasAnyOuterError`)
- Non-error branch (`hasBothOuterSuccess`)

# Data

No new data structures are introduced.

Existing computed values remain:
- `hasAnyOuterError`
- `hasBothOuterSuccess`
- `comparisonErrorText` built from `erroredModelDescriptors`

Data handling rule:
- Preserve descriptor formatting and ordering; only change literal copy surrounding it.

# Validation/Error Handling

No validation logic changes are introduced.

Error handling behavior remains the same:
- Third panel continues to show error branch when either outer query is in error state.
- Existing descriptor list generation remains authoritative.

Required textual changes are constrained to rendered copy only.

# Security

Security impact is none for this scoped update.

- No authentication/authorization changes.
- No new input surfaces or injection boundaries.
- No secret or data-handling changes.
- No external integration changes.

# Accessibility

The new copy must remain exposed through existing semantic markup.

- Error heading is rendered as visible heading text in the panel’s existing heading semantics.
- Error message remains visible, readable text in the existing panel error content.
- Non-error heading remains in existing heading semantics.
- No focus/keyboard behavior changes.

Accessibility-focused tests that assert heading/message copy should be updated to the new wording where applicable.

# Testing

## Unit/UI

- Update tests asserting third-panel non-error heading text.
- Update tests asserting third-panel error message prefix.
- Add/update test assertion for new error heading text if not already present.

Target command:
- `npm run test:unit -- tests/unit/app.ui.test.ts tests/unit/app.a11y.test.ts`

## End-to-End

- Update e2e assertions for non-error heading copy.
- Update e2e assertions for error-state message copy and error heading if asserted.

Target command:
- `npx playwright test tests/e2e/app.spec.ts tests/e2e/accessibility.spec.ts`

## Broader Safety Checks

- Confirm type-level safety and no regressions in relevant suite.

Target commands:
- `npm run typecheck`
- `npm test`

# Assumptions

- Existing third-panel error descriptor logic is correct and covered by tests.
- Current comparison panel structure can host an explicit error heading without structural refactor.
- Required strings are exact and final.

# Constraints

- Scope limited to third-panel copy and related tests.
- No behavior, API, or backend changes.
- Minimal diff preferred.

# Open Questions

None.

# Traceability

| Requirement ID | Design Section | Notes |
|----------------|----------------|-------|
| FR-1 | Interfaces; Architecture; Testing | Defines and verifies new error-state heading copy in third panel. |
| FR-2 | Interfaces; Data; Validation/Error Handling; Testing | Updates error message prefix while preserving descriptor assembly. |
| FR-3 | Interfaces; Architecture; Testing | Replaces non-error heading text in comparison-ready branch. |
| FR-4 | Architecture; Data; Validation/Error Handling; Testing | Preserves existing state gating and panel behavior. |
| TR-1 | Architecture; Testing | Keeps changes to third-panel copy surfaces and related tests only. |
| TR-2 | Data; Validation/Error Handling | Retains existing descriptor list logic/order and wraps with new prefix. |
| TR-3 | Testing | Updates and runs relevant unit/e2e assertions. |
| TR-4 | Security; Architecture | Confirms no backend/API/contract changes. |
| AR-1 | Accessibility; Interfaces; Testing | Ensures updated error copy remains visible and programmatically discoverable. |
| AR-2 | Accessibility; Interfaces | Ensures updated non-error heading remains semantically exposed. |
| AR-3 | Accessibility; Testing | Ensures accessibility-oriented tests reflect updated strings. |
