# Implementation Plan

## Phase 1 — Update third-panel copy and bindings

### Objective
Replace legacy third-panel success-path copy with the new header and toggle text, including Model 3 name interpolation, while preserving existing visibility/orchestration behavior.

### Tasks

- [ ] Remove legacy placeholder text rendering from third-panel success content
  - `Task ID: P1-T1`
  - `Description: Remove the old placeholder text branch/content in the third output panel success view while preserving existing panel visibility conditions.`
  - `Dependencies: None`
  - `Validation command: npm run test:unit -- tests/unit/app.ui.test.ts`
  - `Expected result: Third-panel success path no longer renders the old placeholder text and no visibility regressions are introduced.`

- [ ] Update third-panel header text to include selected Model 3 name
  - `Task ID: P1-T2`
  - `Description: Replace the header with `Response from Model 3 ({model-3-name}) comparing responses from Model 1 and Model 2`, binding `{model-3-name}` to the existing selected Model 3 label source.`
  - `Dependencies: P1-T1`
  - `Validation command: npm run test:unit -- tests/unit/app.ui.test.ts`
  - `Expected result: Header text matches required copy and displays the selected Model 3 name correctly.`

- [ ] Rename third-panel prompt toggle label
  - `Task ID: P1-T3`
  - `Description: Change toggle label text from `Prompt for Model 3` to `Comparison prompt for Model 3` without changing expand/collapse behavior.`
  - `Dependencies: P1-T1`
  - `Validation command: npm run test:unit -- tests/unit/app.ui.test.ts`
  - `Expected result: Toggle label is updated exactly and interaction behavior remains unchanged.`

### Validation
- Validate third-panel text contract changes through unit assertions.
- Confirm no regressions to third-panel visibility conditions.

### Exit Criteria (Done when...)
- Old placeholder text is absent in third-panel success state.
- Header and toggle labels match new required copy.
- Header correctly interpolates selected Model 3 name.

## Phase 2 — Align third-panel inner spacing with response panels

### Objective
Make third-panel inner margin consistent with Model 1 and Model 2 response panel spacing.

### Tasks

- [ ] Identify and align spacing classes/styles for third-panel content container
  - `Task ID: P2-T1`
  - `Description: Compare spacing definitions used by Model 1/Model 2 output panel content and apply equivalent inner margin to third-panel content container.`
  - `Dependencies: P1-T1`
  - `Validation command: npm run test:unit -- tests/unit/app.ui.test.ts`
  - `Expected result: Third-panel inner spacing is equivalent to Model 1/Model 2 panel content spacing in success state.`

- [ ] Verify no layout regressions caused by spacing normalization
  - `Task ID: P2-T2`
  - `Description: Confirm spacing alignment does not introduce overflow or clipping regressions in normal panel display paths.`
  - `Dependencies: P2-T1`
  - `Validation command: npm run test:e2e -- tests/e2e/app.spec.ts`
  - `Expected result: Third-panel spacing consistency is achieved without introducing visible layout regressions in covered e2e scenarios.`

### Validation
- Validate spacing parity via existing unit/e2e rendering coverage.

### Exit Criteria (Done when...)
- Third-panel inner margin matches Model 1/Model 2 panel inner margin.
- No new layout regressions are detected in covered flows.

## Phase 3 — Update automated coverage and run quality gates

### Objective
Ensure behavior changes are covered and repository quality gates pass.

### Tasks

- [ ] Update unit assertions for new third-panel copy and placeholder removal
  - `Task ID: P3-T1`
  - `Description: Update/add unit tests to assert new header text (with Model 3 name), new toggle label, and absence of old placeholder text.`
  - `Dependencies: P1-T2, P1-T3`
  - `Validation command: npm run test:unit -- tests/unit/app.ui.test.ts`
  - `Expected result: Unit tests reliably verify all requested third-panel copy updates.`

- [ ] Update e2e assertions for user-visible third-panel text changes
  - `Task ID: P3-T2`
  - `Description: Update e2e checks to confirm browser-visible header/toggle copy updates and absence of old placeholder text in the relevant success path.`
  - `Dependencies: P1-T2, P1-T3, P2-T2`
  - `Validation command: npm run test:e2e -- tests/e2e/app.spec.ts`
  - `Expected result: E2E flow assertions pass with updated copy/layout expectations.`

- [ ] Execute repository quality gates
  - `Task ID: P3-T3`
  - `Description: Run project typecheck, full tests, and linting to confirm integration safety of all in-scope changes.`
  - `Dependencies: P3-T1, P3-T2`
  - `Validation command: npm run typecheck && npm test && npm run lint`
  - `Expected result: All required quality gates pass.`

### Validation
- Confirm updated unit/e2e tests pass.
- Confirm quality gates pass.

### Exit Criteria (Done when...)
- Requested behavior changes are covered by tests.
- Typecheck, tests, and lint all pass.

## Risks, Assumptions, and Dependencies

- Risk: Copy updates may miss one rendering path.
  - Mitigation: Add explicit unit/e2e assertions for all user-visible targets.
- Risk: Margin alignment may unintentionally affect other panel states.
  - Mitigation: Limit spacing change to third-panel content container and verify with targeted e2e coverage.
- Assumption: Existing state already exposes selected Model 3 label usable for header interpolation.

## Traceability

| Phase / Task ID | Design Section | Notes |
| --------------- | -------------- | ----- |
| P1-T1 | Architecture; Interfaces; Testing | Removes old placeholder text from third-panel success rendering. |
| P1-T2 | Interfaces; Data; Testing | Implements new header copy and selected Model 3 name interpolation. |
| P1-T3 | Interfaces; Accessibility; Testing | Implements toggle label rename while preserving behavior semantics. |
| P2-T1 | Interfaces; Architecture | Aligns third-panel inner spacing with Model 1/Model 2 response panels. |
| P2-T2 | Testing; Validation/Error Handling | Confirms no layout regressions from spacing normalization. |
| P3-T1 | Testing | Updates unit coverage for new copy and placeholder removal. |
| P3-T2 | Testing | Updates e2e coverage for user-visible third-panel text changes. |
| P3-T3 | Testing | Runs repository quality gates to validate integration safety. |
