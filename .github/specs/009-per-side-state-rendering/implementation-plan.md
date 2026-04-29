# Implementation Plan — True Per-Side Loading/Success/Error States

## Phase 1 — Per-Side Rendering Refactor

### Objective
Replace aggregate loading-gated output rendering with panel-local state rendering so left and right output panels can show independent `loading`, `success`, and `error` states concurrently.

### Tasks
- [x] Refactor response region to render per-side state
  - Task ID: P1-T1
  - Description: Update `app/app.vue` template logic so output panels remain visible after submit starts and each panel renders its own state branch (`loading`, `success`, `error`) from its own request state object.
  - Dependencies: None
  - Validation command: `npm run test:unit -- tests/unit/app.ui.test.ts`
  - Expected result: Unit tests run and include no regressions in response-region rendering basics.

- [x] Preserve aggregate submit control behavior while decoupling panel visibility
  - Task ID: P1-T2
  - Description: Keep aggregate `isLoading` for submit button disabled/busy behavior only; ensure this aggregate state no longer suppresses per-panel visibility.
  - Dependencies: P1-T1
  - Validation command: `npm run test:unit -- tests/unit/app.ui.test.ts`
  - Expected result: Submit button remains disabled while either side is loading; panels still show side-local states.

- [x] Ensure side-local error rendering remains normalized and isolated
  - Task ID: P1-T3
  - Description: Verify left/right error branches remain side-specific and continue using existing normalized error objects and `UiErrorAlert` behavior.
  - Dependencies: P1-T1
  - Validation command: `npm run test:unit -- tests/unit/app.ui.test.ts`
  - Expected result: One side error does not suppress opposite side success content; no raw error leakage is introduced.

### Validation
- `npm run test:unit -- tests/unit/app.ui.test.ts`

### Exit Criteria
Done when per-side state rendering is implemented in `app/app.vue`, submit disabled/busy behavior is preserved, and mixed-state behavior is no longer blocked by aggregate loading gates.

---

## Phase 2 — Test Coverage for Progressive and Mixed States

### Objective
Add and align automated coverage proving side-local incremental rendering and mixed outcomes, including browser-level behavior.

### Tasks
- [x] Add/adjust unit tests for progressive mixed-state visibility
  - Task ID: P2-T1
  - Description: Update `tests/unit/app.ui.test.ts` to assert scenarios such as left success + right loading, left error + right success, and right error + left success.
  - Dependencies: P1-T1
  - Validation command: `npm run test:unit -- tests/unit/app.ui.test.ts`
  - Expected result: Unit tests fail without correct progressive rendering and pass with correct side-local rendering.

- [x] Add/adjust e2e assertions for partial completion visibility
  - Task ID: P2-T2
  - Description: Update `tests/e2e/app.spec.ts` to validate browser behavior where one side resolves before the other and UI reflects the partial completion immediately.
  - Dependencies: P1-T1
  - Validation command: `npm run test:e2e -- tests/e2e/app.spec.ts`
  - Expected result: E2E verifies that one panel can show completion while the other remains in-flight.

- [x] Preserve and verify accessibility semantics in updated states
  - Task ID: P2-T3
  - Description: Update/confirm a11y tests (`tests/unit/app.a11y.test.ts` and/or `tests/e2e/accessibility.spec.ts`) for side-specific loading and mixed-state output semantics.
  - Dependencies: P1-T1
  - Validation command: `npm run test:a11y`
  - Expected result: No accessibility regressions in idle/loading/success/error/mixed scenarios.

### Validation
- `npm run test:unit -- tests/unit/app.ui.test.ts`
- `npm run test:e2e -- tests/e2e/app.spec.ts`
- `npm run test:a11y`

### Exit Criteria
Done when unit, e2e, and a11y suites explicitly prove side-local incremental rendering and pass reliably.

---

## Phase 3 — Documentation and Final Verification

### Objective
Align docs with implemented behavior and run final targeted and broad validation to ensure requirements coverage across technical, security, accessibility, and performance concerns.

### Tasks
- [x] Update README behavior description for side-local state rendering
  - Task ID: P3-T1
  - Description: Update `README.md` wording to clearly state that both response panels can show independent loading/success/error states concurrently.
  - Dependencies: P1-T1
  - Validation command: `npm run lint`
  - Expected result: Documentation text is accurate and lint/prettier checks pass.

- [x] Run focused regression checks for affected behavior
  - Task ID: P3-T2
  - Description: Execute focused test commands for unit/e2e/a11y coverage tied to this change set.
  - Dependencies: P2-T1, P2-T2, P2-T3
  - Validation command: `npm run test:unit -- tests/unit/app.ui.test.ts && npm run test:e2e -- tests/e2e/app.spec.ts && npm run test:a11y`
  - Expected result: All focused suites pass without flaky side-state failures.

- [x] Run final quality gates
  - Task ID: P3-T3
  - Description: Run full repository quality gates to ensure integration readiness.
  - Dependencies: P3-T1, P3-T2
  - Validation command: `npm run typecheck && npm test && npm run lint`
  - Expected result: Typecheck, tests, and lint all pass.

### Validation
- `npm run typecheck && npm test && npm run lint`

### Exit Criteria
Done when docs match behavior, targeted coverage passes, and full quality gates pass.

---

## Risks, Assumptions, and Dependencies
- Risk: Template conditional complexity may reintroduce hidden-state bugs.
  - Mitigation: Keep panel-local rendering branches explicit and covered with progressive-state tests.
- Risk: Accessibility regressions in loading/error semantics.
  - Mitigation: Preserve status/alert roles and validate with existing a11y suites.
- Assumption: Existing `useRequestState` contracts remain unchanged and sufficient.
- Dependency: Existing dual-request submit flow remains the source of panel state transitions.

## Traceability
| Phase / Task ID | Design Section | Notes |
| --------------- | -------------- | ----- |
| P1-T1 | Architecture; Interfaces; Data | Implements panel-local rendering model for left/right state independence. |
| P1-T2 | Architecture; Data; Security | Preserves aggregate in-flight submit disablement while decoupling visibility. |
| P1-T3 | Validation/Error Handling; Security | Maintains normalized side-local error behavior without cross-panel suppression. |
| P2-T1 | Testing; Data | Adds unit proof for progressive and mixed-state transitions. |
| P2-T2 | Testing; Interfaces | Verifies browser-level partial completion visibility. |
| P2-T3 | Accessibility; Testing | Preserves status/alert semantics and accessibility regression coverage. |
| P3-T1 | Overview; Testing | Aligns README behavior description with implemented rendering model. |
| P3-T2 | Testing; Performance | Confirms incremental rendering behavior and mixed-state stability under focused suites. |
| P3-T3 | Testing; Assumptions and Constraints | Final readiness via repository-wide quality gates. |

## Run History

> **Prompt 6 run — 2026-04-26:** No unresolved discrepancies found. Workflow complete.
