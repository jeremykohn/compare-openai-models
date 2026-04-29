# Implementation Plan: Enable Comparison Dropdown and Conditional Third Output States

**Source design:** `.github/specs/018-enable-comparison-dropdown-and-conditional-third-output/design.md`
**Output artifact:** `.github/specs/018-enable-comparison-dropdown-and-conditional-third-output/implementation-plan.md`

## Phase 1 — Enable Comparison Selector and Preserve Existing Submit Flow

### Objective

Enable the `Model for comparing outputs` selector as interactive UI state while preserving existing two-request submit behavior and request payload boundaries.

### Tasks

- [x] Enable comparison selector interaction in selector component
  - Task ID: P1-T1
  - Description: Update selector rendering/props so `Model for comparing outputs` is interactive and remains correctly label-associated.
  - Dependencies: None
  - Validation command: `npm run test:unit -- tests/unit/models-selector.test.ts tests/unit/app.a11y.test.ts`
  - Expected result: Comparison selector is enabled, keyboard operable, and remains properly labeled.

- [x] Preserve two-way state binding for comparison selector in app layer
  - Task ID: P1-T2
  - Description: Ensure `selectedModelIdModelComparison` remains bound and updates from selector events without affecting Model 1/Model 2 state paths.
  - Dependencies: P1-T1
  - Validation command: `npm run test:unit -- tests/unit/app.ui.test.ts tests/unit/models-selector.test.ts`
  - Expected result: Comparison selector changes persist in app state and do not overwrite Model 1/Model 2 selections.

- [x] Guard submit flow to keep exactly two query executions
  - Task ID: P1-T3
  - Description: Verify/adjust submit orchestration so enabling comparison selector does not create a third request or mutate existing dual-query payload behavior.
  - Dependencies: P1-T2
  - Validation command: `npm run test:unit -- tests/unit/app.ui.test.ts`
  - Expected result: Valid submit issues exactly two `/api/respond` requests and comparison selector value is not sent.

### Validation

- `npm run test:unit -- tests/unit/models-selector.test.ts tests/unit/app.ui.test.ts tests/unit/app.a11y.test.ts`

### Exit Criteria (Done when...)

- Comparison selector is enabled and accessible.
- Selector state updates correctly in app state.
- Submit behavior remains exactly two requests with unchanged network contract.

---

## Phase 2 — Implement Conditional Third-Panel Messaging Logic

### Objective

Implement deterministic third-panel branch logic so terminal outcomes of Model 1/Model 2 drive either interpolated italic placeholder text (dual success) or deterministic error text (any error).

### Tasks

- [x] Add derived outcome state for third-panel mode selection
  - Task ID: P2-T1
  - Description: Add computed values for `hasAnyOuterError`, `hasBothOuterSuccess`, and errored side tracking from existing outer request terminal states.
  - Dependencies: P1-T3
  - Validation command: `npm run test:unit -- tests/unit/app.ui.test.ts`
  - Expected result: Third-panel mode correctly resolves across success/success, success/error, error/success, and error/error.

- [x] Implement dual-success dynamic placeholder sentence
  - Task ID: P2-T2
  - Description: Build and render exact placeholder sentence with runtime substitutions for comparison model, Model 1, and Model 2 names, and render it italicized.
  - Dependencies: P2-T1
  - Validation command: `npm run test:unit -- tests/unit/app.ui.test.ts`
  - Expected result: Third panel shows exact interpolated sentence and italic style when both outer queries succeed.

- [x] Implement any-error deterministic comparison-blocked message
  - Task ID: P2-T3
  - Description: Build error message prefix plus comma-separated `Model {number} ({name})` descriptors for failing sides in deterministic order (Model 1 before Model 2 when both fail).
  - Dependencies: P2-T1
  - Validation command: `npm run test:unit -- tests/unit/app.ui.test.ts`
  - Expected result: Third panel error message matches required format for one-side and two-side error scenarios.

- [x] Preserve third-panel lifecycle integration and outer panel isolation
  - Task ID: P2-T4
  - Description: Ensure new branch logic integrates with existing post-submit lifecycle and does not suppress or alter Model 1/Model 2 panel content.
  - Dependencies: P2-T2, P2-T3
  - Validation command: `npm run test:unit -- tests/unit/app.ui.test.ts`
  - Expected result: Third panel follows existing lifecycle and outer panels remain unchanged in behavior.

### Validation

- `npm run test:unit -- tests/unit/app.ui.test.ts`

### Exit Criteria (Done when...)

- Third-panel message mode is derived deterministically from outer outcomes.
- Dual-success placeholder and any-error message formats are correct.
- Existing outer panel rendering remains unchanged.

---

## Phase 3 — Expand Automated Coverage (Unit, Accessibility, E2E)

### Objective

Add and align tests for enabled comparison selector, conditional third-panel messaging, deterministic error descriptor ordering, and no-third-request guarantees.

### Tasks

- [x] Update unit tests for conditional third-panel branches and interpolation
  - Task ID: P3-T1
  - Description: Extend app UI unit tests for success/success placeholder interpolation, one-side error lists, both-side error deterministic ordering, and two-request assertion.
  - Dependencies: P2-T4
  - Validation command: `npm run test:unit -- tests/unit/app.ui.test.ts`
  - Expected result: Unit tests fail without branch logic correctness and pass with correct conditional behavior.

- [x] Update selector unit tests for enabled comparison control behavior
  - Task ID: P3-T2
  - Description: Ensure selector tests assert enabled comparison control and proper update event flow while existing selector behavior remains stable.
  - Dependencies: P1-T2
  - Validation command: `npm run test:unit -- tests/unit/models-selector.test.ts`
  - Expected result: Selector tests confirm enabled comparison control and stable model-option behavior.

- [x] Update accessibility tests for enabled selector and conditional text readability
  - Task ID: P3-T3
  - Description: Add/adjust a11y assertions for comparison selector operability/label association and for perceivable third-panel conditional text.
  - Dependencies: P2-T4
  - Validation command: `npm run test:unit -- tests/unit/app.a11y.test.ts`
  - Expected result: Accessibility tests pass with no regressions in output-region semantics.

- [x] Update e2e coverage for conditional third-panel behavior and request count
  - Task ID: P3-T4
  - Description: Extend browser flow tests for enabled comparison selector interaction, success placeholder interpolation, error text composition, and no third request.
  - Dependencies: P2-T4
  - Validation command: `npm run test:e2e -- tests/e2e/app.spec.ts`
  - Expected result: E2E scenarios pass and confirm no comparison request is sent.

### Validation

- `npm run test:unit -- tests/unit/models-selector.test.ts tests/unit/app.ui.test.ts tests/unit/app.a11y.test.ts`
- `npm run test:e2e -- tests/e2e/app.spec.ts`

### Exit Criteria (Done when...)

- Unit/a11y/e2e coverage validates all required third-panel branches and selector behavior.
- Tests explicitly prove no third request is introduced.

---

## Phase 4 — Final Verification and Delivery Readiness

### Objective

Run full project gates and verify final consistency with design requirements across security, accessibility, and performance constraints.

### Tasks

- [x] Run full repository quality gates
  - Task ID: P4-T1
  - Description: Execute complete verification pipeline after all updates.
  - Dependencies: P3-T1, P3-T2, P3-T3, P3-T4
  - Validation command: `npm run typecheck && npm test && npm run lint`
  - Expected result: Typecheck, test suites, and lint all pass.

- [x] Verify security/accessibility/performance constraint conformance
  - Task ID: P4-T2
  - Description: Confirm implemented behavior preserves no-new-request surface, sanitized third-panel error composition boundaries, accessible enabled selector behavior, and lightweight computed rendering.
  - Dependencies: P4-T1
  - Validation command: `npm run test:unit -- tests/unit/app.ui.test.ts tests/unit/app.a11y.test.ts`
  - Expected result: Constraint-focused checks remain green and aligned with design/requirements.

### Validation

- `npm run typecheck && npm test && npm run lint`

### Exit Criteria (Done when...)

- Full gates pass.
- Behavior aligns with requirements and design, including security/a11y/performance constraints.

---

## Risks, Assumptions, and Dependencies

- Risk: Conditional branch logic may conflict with existing waiting-state behavior in the third panel.
  - Mitigation: Keep branch order explicit and test each terminal combination.
- Risk: Dynamic string interpolation may drift from exact required sentence format.
  - Mitigation: Assert exact string outputs in unit and e2e tests.
- Risk: Enabling comparison selector could unintentionally alter request payload construction.
  - Mitigation: Keep payload construction isolated to Model 1/Model 2 submit path and test request count/body behavior.
- Assumption: Current model-name state is available where third-panel messages are composed.
- Dependency: Existing dual-query request-state lifecycle remains unchanged.

---

## Traceability

| Phase / Task ID | Design Section | Notes |
| --------------- | -------------- | ----- |
| P1-T1 | Architecture; Interfaces; Accessibility | Enables comparison selector with correct labeling/operability. |
| P1-T2 | Data; Interfaces | Preserves active app-level comparison selector state binding. |
| P1-T3 | Interfaces; Security; Performance | Preserves two-request submit contract and no third request. |
| P2-T1 | Data; Validation/Error Handling | Adds deterministic mode selection from outer terminal outcomes. |
| P2-T2 | Data; Interfaces; Validation/Error Handling | Implements exact dual-success interpolated italic placeholder sentence. |
| P2-T3 | Data; Validation/Error Handling; Security | Implements deterministic any-error message composition with ordered descriptors. |
| P2-T4 | Architecture; Validation/Error Handling | Preserves third-panel lifecycle integration and outer-panel isolation. |
| P3-T1 | Testing; Data; Validation/Error Handling | Validates branch correctness, interpolation, ordering, and request-count safety. |
| P3-T2 | Testing; Interfaces | Confirms enabled comparison selector behavior and stable selector flows. |
| P3-T3 | Accessibility; Testing | Verifies accessible selector interaction and perceivable conditional text. |
| P3-T4 | Testing; Interfaces; Performance | Verifies browser-level outcomes and no third network request. |
| P4-T1 | Testing | Runs full project quality gates. |
| P4-T2 | Security; Accessibility; Performance; Testing | Final conformance check against SR/AR/PR-driven design constraints. |

---

## Run History

- ✅ `npm run test:unit -- tests/unit/models-selector.test.ts tests/unit/app.ui.test.ts tests/unit/app.a11y.test.ts`
  - Focused unit and a11y tests passed (31 tests).
- ✅ `npm run test:e2e -- tests/e2e/app.spec.ts`
  - Updated e2e coverage passed (6 tests).
- ⚠️ `npm run typecheck && npm test && npm run lint`
  - Typecheck and tests passed; lint failed on Prettier checks for `server/assets/models/openai-models.json`, `server/assets/prompt-templates/prompt-comparison-template.md`, and `tests/unit/app.ui.test.ts`.
- ✅ `npx prettier --write server/assets/models/openai-models.json server/assets/prompt-templates/prompt-comparison-template.md tests/unit/app.ui.test.ts`
  - Formatting drift fixed.
- ✅ `npm run lint`
  - Lint/typecheck/prettier checks passed.
- ⚠️ `npm run typecheck && npm test && npm run lint`
  - Typecheck and tests passed; lint failed due Prettier drift in `server/assets/models/openai-models.json` after test run.
- ✅ `npx prettier --write server/assets/models/openai-models.json && npm run lint`
  - Formatting re-applied and lint/typecheck/prettier checks passed.

> **Prompt 6 run — 2026-04-28:** No unresolved discrepancies found. Workflow complete.

**Next step:** `.github/prompts/prompt-6-validate-implementation-vs-plan.md` — run discrepancy validation for this spec.
