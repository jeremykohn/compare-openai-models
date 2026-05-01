# Overview

This update decouples selector-ID contract verification from production selector-ID constants so tests can detect DOM contract drift reliably.

Goals:
- Preserve the existing selector DOM ID contract values (`model1-select`, `model2-select`, `model3-select`).
- Keep production constants available for implementation clarity where useful.
- Ensure at least one stable contract-level test path asserts selector IDs explicitly with literals.

Out of scope:
- Feature or UX behavior changes.
- Backend/API changes.
- Broad testing framework or architecture changes.

# Architecture

## High-Level Approach

1. Keep `shared/constants/model-selectors.ts` as implementation-level shared constants.
2. Identify tests that currently assert selector IDs only through imported production constants.
3. Add or adjust contract-level assertions that use explicit literals (`#model1-select`, `#model2-select`, `#model3-select`) in stable smoke/contract paths.
4. Keep non-contract tests free to use helper abstractions/constants where that improves maintainability.

## Affected Files

Primary expected files:
- `tests/unit/models-selector.test.ts`
- `tests/e2e/app.spec.ts`
- `tests/e2e/helpers/selectors.ts` (only if needed to preserve helper clarity while maintaining at least one explicit contract path)

Potentially referenced but not expected to change behavior:
- `app/components/ModelsSelector.vue`
- `shared/constants/model-selectors.ts`

## Design Constraints

- Do not change rendered selector IDs.
- Do not remove meaningful existing behavior assertions.
- Keep contract-level literal assertions explicit and easy to locate.

# Interfaces

## Selector ID Contract

The selector ID contract is treated as external/stable for automation and tests:
- `model1-select`
- `model2-select`
- `model3-select`

Contract-level tests must validate these values literally in at least one stable path.

## Test Interface Expectations

- Unit/e2e tests still validate selector behavior and accessibility semantics.
- Tests should not rely exclusively on production constants for selector-ID contract verification.
- Helpers may still wrap selectors for convenience, but must not be the sole contract assertion path.

# Data

No data model changes.

No changes to:
- API payloads
- response shapes
- state contracts

Only test-assertion strategy is adjusted for contract reliability.

# Validation/Error Handling

Existing validation/error-handling behavior remains unchanged:
- selector error states
- aria-invalid/described-by behavior
- request and output error handling

This update must not alter runtime validation behavior.

# Security

No security boundary changes are introduced.

Security posture remains unchanged:
- no secret handling changes
- no new network surfaces
- no logging behavior changes

# Accessibility

Accessibility relationships tied to selector IDs must remain valid and test-detectable:
- label `for` ↔ input `id`
- `aria-describedby` references involving selector controls

Contract-level assertions should fail if selector ID drift would break accessibility-linked references.

# Testing

## Strategy

- Preserve existing behavior coverage.
- Add/retain explicit literal selector-ID contract assertions in at least one stable unit or e2e smoke path.
- Keep helper/constant-based selectors for non-contract assertions where beneficial.

## Targeted Validation

- `npm run test:unit -- tests/unit/models-selector.test.ts`
- `npm run test:e2e -- tests/e2e/models-selector.spec.ts tests/e2e/app.spec.ts`

## Full Quality Gates

- `npm run typecheck`
- `npm test`
- `npm run lint`

# Open Questions

None blocking.

# Traceability

| Requirement ID | Design Section | Notes |
|----------------|----------------|-------|
| FR-1 | Overview; Interfaces; Testing | Preserves stable selector-ID contract values. |
| FR-2 | Architecture; Interfaces; Testing | Adds contract-level literal assertions independent of production constants. |
| FR-3 | Architecture; Interfaces; Testing | Allows implementation constants while avoiding exclusive test coupling. |
| TR-1 | Architecture | Restricts scope to selector-ID contract validation surfaces. |
| TR-2 | Interfaces; Testing | Preserves assertion strength and contract readability. |
| TR-3 | Testing | Defines targeted and full validation commands. |
| AR-1 | Accessibility; Interfaces; Testing | Preserves ID-linked accessibility semantics. |
| AR-2 | Accessibility; Testing | Ensures test detectability of ID drift affecting accessible references. |
