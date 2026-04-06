# Discrepancy Report: Modifications vs Technical Design (Spec-2)

**Design spec**: `.github/specs/001-implement-existing-spec/spec-2-for-call-openai-api-repo.md`  
**Updated on**: 2026-04-06

## Summary

All previously reported discrepancy items are now resolved with executable evidence.

## Closure Evidence

- `npm run typecheck` ✅
- `npm run lint` ✅
- `npm run test:unit` ✅
- `npm run test:integration` ✅
- `npm run test:e2e` ✅
- `npm run test:a11y` ✅

## Resolved Discrepancies

### D-1: E2E and accessibility E2E verification not executable
- **Status**: Resolved
- **Evidence**: Playwright browser dependencies were installed with fallback setup strategy and both e2e suites now pass.

### D-2: Full merge-gate parity was partial
- **Status**: Resolved
- **Evidence**: Full gate sequence passes in order (`typecheck`, `lint`, `unit`, `integration`, `e2e`, `a11y`).

### D-3: Integration test fidelity below route-focused intent
- **Status**: Resolved
- **Evidence**: Route-level integration harness and contract assertions are implemented in:
  - `tests/integration/helpers/route-harness.ts`
  - `tests/integration/models.test.ts`
  - `tests/integration/respond-route.test.ts`

### D-4: UI parity checks not exhaustive
- **Status**: Resolved
- **Evidence**:
  - Unit parity coverage expanded in `tests/unit/app.ui.test.ts`, `tests/unit/models-selector.test.ts`, and `tests/unit/app.a11y.test.ts`.
  - E2E parity coverage expanded in `tests/e2e/app.spec.ts`, `tests/e2e/models-selector.spec.ts`, and `tests/e2e/accessibility.spec.ts`.

## Conclusion

There are no unresolved discrepancies between implemented modifications and the technical design for spec-2.
