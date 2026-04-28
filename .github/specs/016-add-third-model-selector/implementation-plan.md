# Implementation Plan: Add Third Model Selector for Comparing Outputs

**Source design:** `.github/specs/016-add-third-model-selector/design.md`
**Output artifact:** `.github/specs/016-add-third-model-selector/implementation-plan.md`

## Phase 1 — Add Third Selector Wiring and Responsive Layout

### Objective
Add the third selector to `ModelsSelector.vue` with correct label/id, disabled behavior, and responsive placement while preserving existing selector semantics.

### Tasks

- [x] Add third selector prop and emit contract
  - `Task ID: P1-T1`
  - `Description: Extend ModelsSelector props/emits with third selected-model value (`selectedModelIdModelComparison`) and corresponding update emit.`
  - `Dependencies: None`
  - `Validation command: npm run typecheck`
  - `Expected result: Typecheck passes and component contract supports third selector value binding.`

- [x] Render third `ModelSelectField` with required label and id
  - `Task ID: P1-T2`
  - `Description: Add a third field in ModelsSelector using id `model-comparison-select` and label `Model for comparing outputs`, following existing described-by/invalid conventions.`
  - `Dependencies: P1-T1`
  - `Validation command: npx vitest run --config vitest.unit.config.ts tests/unit/models-selector.test.ts`
  - `Expected result: Selector unit tests can discover third selector with expected label and id.`

- [x] Force third selector to remain disabled
  - `Task ID: P1-T3`
  - `Description: Ensure third selector is always disabled regardless of parent disabled state changes, while retaining existing disabled behavior for first two selectors.`
  - `Dependencies: P1-T2`
  - `Validation command: npx vitest run --config vitest.unit.config.ts tests/unit/models-selector.test.ts tests/unit/app.a11y.test.ts`
  - `Expected result: Tests confirm third selector disabled semantics and non-interactive state.`

- [x] Refactor selector layout for mobile stack and desktop two-row structure
  - `Task ID: P1-T4`
  - `Description: Adjust selector template/container classes so Model 1 and Model 2 remain side-by-side on `md+` with comparison selector in a full-width row below; all three stack on mobile.`
  - `Dependencies: P1-T2`
  - `Validation command: npx vitest run --config vitest.unit.config.ts tests/unit/models-selector.test.ts`
  - `Expected result: Tests and markup inspection confirm expected responsive structure and selector order.`

### Validation
- `npm run typecheck`
- `npx vitest run --config vitest.unit.config.ts tests/unit/models-selector.test.ts tests/unit/app.a11y.test.ts`

### Exit Criteria (Done when...)
- Third selector is rendered with correct id/label.
- Third selector is always disabled.
- Responsive selector layout matches required mobile/desktop behavior.
- Existing selectors remain intact.

---

## Phase 2 — Wire App State Without Query Behavior Change

### Objective
Add third selector app-state binding in `app/app.vue` and keep query orchestration unchanged (still model1/model2 only).

### Tasks

- [x] Add third selector state in app layer
  - `Task ID: P2-T1`
  - `Description: Define `selectedModelIdModelComparison` in `app/app.vue` and bind it to `ModelsSelector` prop/event.`
  - `Dependencies: P1-T1`
  - `Validation command: npm run typecheck`
  - `Expected result: App compiles with third selector binding and no prop/emit type errors.`

- [x] Preserve submit/query ownership behavior
  - `Task ID: P2-T2`
  - `Description: Confirm submit handler and model queries continue using only model1/model2 selected values; no third selector value used in requests.`
  - `Dependencies: P2-T1`
  - `Validation command: npx vitest run --config vitest.unit.config.ts tests/unit/app.ui.test.ts`
  - `Expected result: App UI tests confirm two-query behavior remains unchanged and no third query path exists.`

### Validation
- `npm run typecheck`
- `npx vitest run --config vitest.unit.config.ts tests/unit/app.ui.test.ts`

### Exit Criteria (Done when...)
- Third selector state is wired between app and selector component.
- Existing request behavior remains exactly two-side.

---

## Phase 3 — Update Tests and Helpers for Third Selector Coverage

### Objective
Update tests and helpers to validate third selector presence/semantics while preserving behavior assertions for existing selectors and query flow.

### Tasks

- [x] Extend selector unit tests for third selector presence, label, disabled state, and options parity
  - `Task ID: P3-T1`
  - `Description: Update `tests/unit/models-selector.test.ts` with assertions for third selector id/label/disabled and matching options with selectors 1 and 2.`
  - `Dependencies: P1-T4`
  - `Validation command: npx vitest run --config vitest.unit.config.ts tests/unit/models-selector.test.ts`
  - `Expected result: Selector unit coverage passes with explicit third selector assertions.`

- [x] Extend accessibility unit coverage for third selector semantics
  - `Task ID: P3-T2`
  - `Description: Update `tests/unit/app.a11y.test.ts` to verify programmatic label association and disabled semantics for third selector.`
  - `Dependencies: P1-T3`
  - `Validation command: npx vitest run --config vitest.unit.config.ts tests/unit/app.a11y.test.ts`
  - `Expected result: A11y unit tests pass with third selector assertions.`

- [x] Add e2e selector helper for comparison selector
  - `Task ID: P3-T3`
  - `Description: Update `tests/e2e/helpers/selectors.ts` with a dedicated locator helper for `#model-comparison-select` and adjust any affected imports/usages.`
  - `Dependencies: P1-T2`
  - `Validation command: npm run test:e2e -- tests/e2e/models-selector.spec.ts`
  - `Expected result: E2E selector helper compiles and targeted e2e selector tests pass.`

### Validation
- `npx vitest run --config vitest.unit.config.ts tests/unit/models-selector.test.ts tests/unit/app.a11y.test.ts`
- `npm run test:e2e -- tests/e2e/models-selector.spec.ts`

### Exit Criteria (Done when...)
- Unit/a11y tests cover the third selector adequately.
- E2E selector helper exposes the third selector locator.

---

## Phase 4 — Final Verification and Quality Gates

### Objective
Run full validation to ensure integration readiness and no regressions outside expected scope.

### Tasks

- [x] Run focused regression suites for updated selector and app behavior
  - `Task ID: P4-T1`
  - `Description: Execute focused unit and e2e suites impacted by this update before broad gates.`
  - `Dependencies: P3-T1, P3-T2, P3-T3, P2-T2`
  - `Validation command: npx vitest run --config vitest.unit.config.ts tests/unit/models-selector.test.ts tests/unit/app.ui.test.ts tests/unit/app.a11y.test.ts && npm run test:e2e -- tests/e2e/models-selector.spec.ts`
  - `Expected result: Focused suites pass with no unexpected regressions.`

- [x] Run full repository quality gates
  - `Task ID: P4-T2`
  - `Description: Execute full typecheck, test, and lint checks after implementation is complete.`
  - `Dependencies: P4-T1`
  - `Validation command: npm run typecheck && npm test && npm run lint`
  - `Expected result: All quality gates pass.`

### Validation
- `npm run typecheck && npm test && npm run lint`

### Exit Criteria (Done when...)
- Focused and full quality gates pass.
- Changes remain in scope for selector-layer addition only.

---

## Risks, Assumptions, and Dependencies

- **Risk:** Responsive structure changes can break existing tests that assume only two selectors.
  - **Mitigation:** Update tests to assert intended three-selector structure explicitly.
- **Risk:** Third selector prop/emit additions can introduce type mismatches between `app/app.vue` and `ModelsSelector.vue`.
  - **Mitigation:** Run early `typecheck` after wiring changes.
- **Assumption:** Existing `ModelSelectField` handles disabled semantics correctly and can be reused unchanged.
- **Dependency:** Current Vitest/Playwright harness remains stable for selector-focused suites.

---

## Traceability

| Phase / Task ID | Design Section | Notes |
| --------------- | -------------- | ----- |
| P1-T1 | Interfaces → `ModelsSelector.vue` Props/Emits | Adds third selector contract. |
| P1-T2 | Interfaces → Template/Field Interface | Adds third field id/label bindings. |
| P1-T3 | Accessibility; Interfaces | Enforces disabled semantics for comparison selector. |
| P1-T4 | Architecture → Target State | Implements required responsive selector layout. |
| P2-T1 | Interfaces → App-Level Interface; Data | Wires third selector state in app layer. |
| P2-T2 | Architecture; Security; Data | Preserves two-query ownership and payload behavior. |
| P3-T1 | Testing → Unit | Adds third selector unit assertions. |
| P3-T2 | Accessibility; Testing | Covers label association + disabled semantics in a11y tests. |
| P3-T3 | Testing → E2E | Adds e2e helper for third selector locator. |
| P4-T1 | Testing | Runs focused regression suite for impacted files. |
| P4-T2 | Testing → Quality Gates | Validates full repository gates. |

---

**Next step:** `.github/prompts/prompt-5-implement-from-plan.md` — pass this `implementation-plan.md` to begin implementation.

## Run History

> **Prompt 5 run — 2026-04-28:** Implemented third disabled selector UI, updated app wiring and tests, and passed `npm run typecheck`, `npm test`, and `npm run lint`.
