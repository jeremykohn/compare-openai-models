# Implementation Plan

## Phase 1 — Restore Model 3 selector contracts and rendering

### Objective
Re-enable Model 3 selector state, events, and template rendering in selector/app UI.

### Tasks
- [x] Restore Model 3 props/emits/template in selector component
  - `Task ID: P1-T1`
  - `Description: Re-add Model 3 prop default, update emit signature, and restore `#model-comparison-select` field in `app/components/ModelsSelector.vue`.`
  - `Dependencies: None`
  - `Validation command: npm run typecheck`
  - `Expected result: Selector component compiles with visible Model 3 control and update event support.`
- [x] Restore app-shell Model 3 state/binding wiring
  - `Task ID: P1-T2`
  - `Description: Re-add Model 3 refs and selector bindings/events in `app/app.vue` with prior fallback semantics for submitted comparison model.`
  - `Dependencies: P1-T1`
  - `Validation command: npm run test:unit -- tests/unit/models-selector.test.ts`
  - `Expected result: App and selector wiring compile and Model 3 updates propagate correctly.`

### Validation
- Confirm active UI exposes Model 3 selector by role/label and id.

### Exit Criteria
Done when Model 3 selector is restored in active UI with functional state/event wiring.

## Phase 2 — Restore third comparison panel logic and rendering

### Objective
Re-enable third output panel branches and copy in app shell.

### Tasks
- [x] Restore comparison computed state/copy and panel markup
  - `Task ID: P2-T1`
  - `Description: Re-add comparison waiting/error/placeholder computed logic and third panel markup in `app/app.vue` using pre-removal behavior.`
  - `Dependencies: P1-T2`
  - `Validation command: npm run test:unit -- tests/unit/app.ui.test.ts`
  - `Expected result: Third panel renders and transitions through loading/error/non-error branches as expected.`
- [x] Verify no regression of two-request submit behavior
  - `Task ID: P2-T2`
  - `Description: Ensure restoration does not alter existing submit orchestration and that only two `/api/respond` requests remain in flight per submit.`
  - `Dependencies: P2-T1`
  - `Validation command: npm run test:unit -- tests/unit/app.ui.test.ts`
  - `Expected result: Dual-request behavior assertions remain green with restored comparison UI.`

### Validation
- Confirm third panel and Model 1/2 output panels coexist in active flow.

### Exit Criteria
Done when comparison panel is restored and two-request outer behavior remains unchanged.

## Phase 3 — Restore unit/e2e accessibility and UI test expectations

### Objective
Align automated tests with restored three-selector/three-panel behavior.

### Tasks
- [x] Restore unit selector and app tests
  - `Task ID: P3-T1`
  - `Description: Reintroduce Model 3 and comparison panel assertions in `tests/unit/models-selector.test.ts` and `tests/unit/app.ui.test.ts`.`
  - `Dependencies: P1-T1, P2-T1`
  - `Validation command: npm run test:unit -- tests/unit/models-selector.test.ts tests/unit/app.ui.test.ts`
  - `Expected result: Unit suites pass with restored selector/panel expectations.`
- [x] Restore unit a11y and e2e selector/comparison expectations
  - `Task ID: P3-T2`
  - `Description: Restore Model 3/comparison assertions in `tests/unit/app.a11y.test.ts`, `tests/e2e/helpers/selectors.ts`, `tests/e2e/app.spec.ts`, `tests/e2e/models-selector.spec.ts`, and `tests/e2e/accessibility.spec.ts`.`
  - `Dependencies: P3-T1`
  - `Validation command: npx playwright test tests/e2e/app.spec.ts tests/e2e/accessibility.spec.ts tests/e2e/models-selector.spec.ts`
  - `Expected result: Targeted accessibility/e2e suites pass with restored behavior.`

### Validation
- Confirm no test still expects two-model-only UI state.

### Exit Criteria
Done when unit/a11y/e2e expectations match restored Model 3/third-panel behavior.

## Phase 4 — Final verification and Prompt 6 discrepancy review

### Objective
Run final checks and close workflow with discrepancy status.

### Tasks
- [x] Run regression gates and finalize discrepancy status
  - `Task ID: P4-T1`
  - `Description: Execute repo typecheck/test/lint checks, then assess implementation against design/plan and record Prompt 6 run history note.`
  - `Dependencies: P3-T2`
  - `Validation command: npm run typecheck && npm test && npm run lint`
  - `Expected result: Checks pass and Prompt 6 discrepancy status is documented in this plan.`

### Validation
- Verify changes remain scoped to restoration ask.

### Exit Criteria
Done when regression gates pass and Prompt 6 review note is appended.

## Risks and Mitigations

- **Risk:** Partial restoration leaves stale two-model-only assertions.
  - **Mitigation:** Use targeted grep plus focused unit/e2e runs for Model 3/comparison identifiers.
- **Risk:** Restoring panel logic accidentally changes request behavior.
  - **Mitigation:** Preserve and re-run dual-request assertions in unit/e2e suites.
- **Risk:** Accessibility regressions from restored control/panel semantics.
  - **Mitigation:** Run dedicated unit/e2e a11y tests after restoration.

## Assumptions

- Prior implementation behavior is available in repository history.
- Restoring removed paths is lower risk than redesigning.

## Dependencies

- Existing Vitest and Playwright test harnesses.
- Existing model/query composables and contracts.

## Traceability

| Phase / Task ID | Design Section | Notes |
| --------------- | -------------- | ----- |
| Phase 1 | Architecture; Interfaces; Data | Restores Model 3 selector contracts and rendering (`FR-1`, `FR-3`, `TR-2`). |
| P1-T1 | Interfaces; Testing | Reintroduces Model 3 selector field and emit contract. |
| P1-T2 | Interfaces; Data | Reintroduces app-shell Model 3 state and binding semantics. |
| Phase 2 | Architecture; Validation/Error Handling | Restores comparison panel branches while preserving outer flow (`FR-2`, `FR-4`). |
| P2-T1 | Interfaces; Validation/Error Handling | Reinstates comparison waiting/error/placeholder rendering. |
| P2-T2 | Data; Security; Testing | Ensures no regression in two-request contract. |
| Phase 3 | Testing; Accessibility | Re-aligns unit/e2e/a11y coverage to restored UI (`TR-3`, `AR-1`, `AR-2`, `AR-3`). |
| P3-T1 | Testing | Restores selector/app unit expectations. |
| P3-T2 | Testing; Accessibility | Restores app/e2e accessibility and behavior assertions. |
| Phase 4 | Testing; Security | Final verification and discrepancy close-out (`TR-1`, `TR-4`, `SR-1`, `SR-2`, `PR-1`). |
| P4-T1 | Testing | Runs full gates and records Prompt 6 outcome. |

## Prompt 6 Run History

- 2026-04-29: Completed restoration of Model 3 selector and third comparison output panel in app/component code and aligned unit/e2e/a11y expectations.
- Validation executed:
  - `npm run test` ✅
  - `npm run test:e2e -- tests/e2e/app.spec.ts tests/e2e/models-selector.spec.ts tests/e2e/accessibility.spec.ts` ✅
  - `npm run lint` ✅
- Discrepancy review: No design/plan discrepancies remain. Implementation is consistent with requirements/design/plan for spec `022-restore-model-3-and-third-output-panel`.
