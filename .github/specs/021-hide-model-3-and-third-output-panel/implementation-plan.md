# Implementation Plan

## Phase 1 — Remove Model 3 and comparison panel from active rendering

### Objective
Hide/remove the Model 3 dropdown and third comparison output panel from active UI rendering while preserving Model 1/Model 2 behavior.

### Tasks
- [x] Remove Model 3 selector rendering from selector component
  - `Task ID: P1-T1`
  - `Description: Update selector component props/events/template so active rendered UI exposes only Model 1 and Model 2 controls.`
  - `Dependencies: None`
  - `Validation command: npm run typecheck`
  - `Expected result: Selector component compiles with two active selectors and no visible Model 3 field.`
- [x] Remove comparison panel render block from app shell template
  - `Task ID: P1-T2`
  - `Description: Update app template to render only left/right output panels in active UI path and remove third comparison panel markup.`
  - `Dependencies: None`
  - `Validation command: npm run typecheck`
  - `Expected result: App template compiles and no comparison panel markup is rendered in active flow.`
- [x] Keep submit and side-request behavior unchanged
  - `Task ID: P1-T3`
  - `Description: Ensure send action still issues exactly two model queries and preserves existing left/right loading/success/error logic.`
  - `Dependencies: P1-T2`
  - `Validation command: npm run test:unit -- tests/unit/app.ui.test.ts`
  - `Expected result: Existing two-model behavior tests remain green after UI render changes.`

### Validation
- Confirm active UI no longer renders Model 3 selector and comparison panel.
- Confirm no backend/API files are changed.

### Exit Criteria
Done when active UI renders only two selectors and two output panels, with unchanged two-model behavior.

## Phase 2 — Update tests for two-selector/two-panel active UI

### Objective
Align unit and e2e assertions with hidden/removed Model 3 and third panel while preserving behavior coverage for the two-model flow.

### Tasks
- [x] Update unit selector tests for two rendered selectors
  - `Task ID: P2-T1`
  - `Description: Update unit tests that currently query ` + "`#model-comparison-select`" + ` or assert Model 3 label/options; assert only Model 1/Model 2 active controls.`
  - `Dependencies: P1-T1`
  - `Validation command: npm run test:unit -- tests/unit/models-selector.test.ts`
  - `Expected result: Selector unit tests pass with no Model 3 active UI expectations.`
- [x] Update app unit/a11y tests to remove comparison panel assertions
  - `Task ID: P2-T2`
  - `Description: Update tests that assert comparison panel heading/message/loading/error so they match two-panel active UI behavior.`
  - `Dependencies: P1-T2, P1-T3`
  - `Validation command: npm run test:unit -- tests/unit/app.ui.test.ts tests/unit/app.a11y.test.ts`
  - `Expected result: App UI and a11y unit tests pass with two-panel expectations only.`
- [x] Update e2e helper/spec references to Model 3/comparison panel
  - `Task ID: P2-T3`
  - `Description: Update e2e helper/spec files to remove active Model 3 selection steps and third-panel copy assertions while preserving dual-request assertions.`
  - `Dependencies: P1-T1, P1-T2`
  - `Validation command: npx playwright test tests/e2e/app.spec.ts tests/e2e/accessibility.spec.ts tests/e2e/models-selector.spec.ts`
  - `Expected result: Targeted e2e suites pass without third-selector/panel active UI expectations.`

### Validation
- Confirm no tests assert visible/reachable Model 3 or comparison panel in active UI.
- Confirm dual-request behavior assertions remain covered.

### Exit Criteria
Done when relevant unit/e2e tests pass with two-selector/two-panel UI expectations.

## Phase 3 — Final verification and workflow close-out

### Objective
Run regression checks for modified scope and ensure implementation is ready for discrepancy review.

### Tasks
- [x] Run typecheck and test regression gates
  - `Task ID: P3-T1`
  - `Description: Execute typecheck and full test suites relevant to this update after all code/test edits are complete.`
  - `Dependencies: P2-T1, P2-T2, P2-T3`
  - `Validation command: npm run typecheck && npm test`
  - `Expected result: Typecheck and tests pass with no regressions introduced by UI hiding/removal change.`

### Validation
- Verify modified files remain scoped to this update intent.

### Exit Criteria
Done when regression gates pass and implementation is ready for Prompt 6 discrepancy review.

## Risks and Mitigations

- **Risk:** Hidden references to removed selector/panel leave failing tests.
  - **Mitigation:** Use focused grep and targeted test runs for Model 3/comparison selectors and copy.
- **Risk:** Removing UI markup accidentally impacts two-request flow assertions.
  - **Mitigation:** Keep and validate existing request-count/model-target tests.
- **Risk:** Over-removal reduces reversibility.
  - **Mitigation:** Prefer localized render/wiring changes over broad code deletion.

## Assumptions

- This commit intentionally ships a two-model-only UI.
- Future re-enable of Model 3/comparison panel is expected.

## Dependencies

- Existing test harnesses (Vitest/Playwright) remain available.
- Existing two-model data contracts remain unchanged.

## Traceability

| Phase / Task ID | Design Section | Notes |
| --------------- | -------------- | ----- |
| Phase 1 | Architecture; Interfaces; Data | Removes active Model 3/comparison rendering while preserving two-model behavior (`FR-1`, `FR-2`, `FR-3`, `FR-4`). |
| P1-T1 | Interfaces; Accessibility | Ensures active form renders only Model 1/Model 2 selectors (`FR-1`, `TR-2`, `AR-2`). |
| P1-T2 | Architecture; Interfaces | Removes active third comparison panel rendering (`FR-2`). |
| P1-T3 | Data; Validation/Error Handling; Testing | Preserves dual-request and per-side behavior (`FR-3`, `TR-4`). |
| Phase 2 | Testing; Accessibility | Updates unit/e2e coverage to reflect two-selector/two-panel active UI (`TR-3`, `AR-1`, `AR-2`, `AR-3`). |
| P2-T1 | Testing | Aligns selector unit assertions with hidden Model 3 UI. |
| P2-T2 | Testing; Accessibility | Aligns app UI/a11y tests to removed comparison panel active rendering. |
| P2-T3 | Testing | Aligns e2e tests while preserving dual-request assertions. |
| Phase 3 | Testing; Security | Final verification with no contract/security changes (`TR-1`, `TR-4`). |
| P3-T1 | Testing | Full regression/type checks after scoped edits. |

## Run History

> **Prompt 6 run — 2026-04-29:** No unresolved discrepancies found. Workflow complete.
