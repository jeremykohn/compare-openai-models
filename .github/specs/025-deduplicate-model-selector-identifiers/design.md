# Overview

This update deduplicates repeated selector identifier literals (including `model1-select`, `model2-select`, and `model3-select`) and related duplicated identifier usage in directly coupled UI/test surfaces.

Goals:
- Reduce repeated hardcoded selector identifiers.
- Introduce clearer single-source identifier definitions for maintainability.
- Preserve existing selector behavior, accessibility semantics, and user-visible outcomes.

Out of scope:
- New features or UI behavior changes.
- Backend/API changes.
- Broad refactors unrelated to selector identifier deduplication.

# Architecture

## Approach

1. Identify repeated selector identifier literals and duplicated identifier fragments in selector components and directly coupled test/helper files.
2. Introduce centralized identifier definitions (constant map/object) in the selector UI layer, and reuse those definitions in template bindings where practical.
3. Align test helpers/selectors to reduce duplicated identifier string literals while preserving test intent.
4. Keep emitted events, labels, described-by relationships, and rendering behavior equivalent.

## Affected Areas

Expected primary touch points:
- `app/components/ModelsSelector.vue`
- `app/components/ModelSelectField.vue` (if key-generation or id-related duplication cleanup is needed)
- `tests/e2e/helpers/selectors.ts`
- `tests/unit/models-selector.test.ts`

Possible secondary touch points (only if needed for consistency):
- `tests/unit/app.ui.test.ts`
- `tests/e2e/models-selector.spec.ts`
- `tests/e2e/app.spec.ts`

# Interfaces

## Component Interface Expectations

`ModelsSelector` public props and emits remain behaviorally unchanged:
- `selectedModelIdModel1`, `selectedModelIdModel2`, `selectedModelIdModel3`
- `update:selectedModelIdModel1`, `update:selectedModelIdModel2`, `update:selectedModelIdModel3`, `retry`

Refactor expectations:
- Internal identifier usage (`id`, helper constants, and repeated string fragments) is centralized.
- Template bindings continue to produce equivalent DOM ids.
- `label[for]` and selector ids remain matched.

## Test Interface Expectations

- Existing locator ids (`#model1-select`, `#model2-select`, `#model3-select`) remain stable unless explicitly migrated in all dependent tests/helpers in the same change.
- Test coverage intent remains behavioral, not weakened.

# Data

No API/data-model changes are introduced.

Data/flow invariants:
- No request payload changes.
- No response handling changes.
- No new stateful business logic.

Only internal identifier definitions and references are deduplicated.

# Validation/Error Handling

Validation and error-handling behavior remain unchanged:
- Selector disabled/error states remain equivalent.
- Existing `aria-invalid` and `aria-describedby` behavior remains equivalent.
- Existing error alert and retry behavior remains equivalent.

# Security

No new security-sensitive pathways are introduced.

Security invariants:
- No secret handling changes.
- No new logging of sensitive data.
- No change to server/API interaction boundaries.

# Accessibility

Because AR requirements are in scope, accessibility outcomes are preserved as first-class constraints:
- `id`/`for` associations remain valid.
- `aria-describedby` target ids remain valid.
- Keyboard and assistive-technology behavior remains equivalent.

If identifier centralization modifies where ids are defined, resulting DOM ids must remain stable and valid.

# Testing

## Strategy

- Update tests only where structural identifier references are deduplicated.
- Preserve all existing behavior assertions.
- Run focused selector tests first, then broader quality gates.

## Validation Commands

Targeted:
- `npm run test:unit -- tests/unit/models-selector.test.ts`
- `npm run test:e2e -- tests/e2e/models-selector.spec.ts tests/e2e/app.spec.ts`

Broader:
- `npm run typecheck`
- `npm test`
- `npm run lint`

# Open Questions

None blocking.

# Traceability

| Requirement ID | Design Section | Notes |
|----------------|----------------|-------|
| FR-1 | Overview; Architecture; Interfaces | Centralizes duplicated selector identifiers into single-source definitions. |
| FR-2 | Interfaces; Validation/Error Handling; Accessibility | Preserves selector runtime behavior and semantics while refactoring identifier usage. |
| FR-3 | Interfaces; Testing | Keeps test intent while allowing structural identifier-reference updates. |
| TR-1 | Architecture | Constrains edits to selector identifier surfaces and directly coupled tests/helpers. |
| TR-2 | Architecture; Interfaces | Uses deterministic identifier mapping patterns to reduce drift risk. |
| TR-3 | Testing | Requires targeted + full quality validation after behavior-preserving refactor. |
| AR-1 | Accessibility; Interfaces | Preserves valid id/label/described-by relationships after deduplication. |
| AR-2 | Accessibility; Testing | Preserves keyboard and assistive-technology behavior and validates through tests. |
