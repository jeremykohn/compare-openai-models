# Implementation Plan: Two Active Dropdowns and Two Queries

**Source design:** `.github/specs/008-two-active-dropdowns-two-queries/design.md`
**Output artifact:** `.github/specs/008-two-active-dropdowns-two-queries/implementation-plan.md`

## Phase 1 — Activate Dual Selector Controls and Labels

### Objective

Enable both model dropdown controls, rename labels to `Model 1` and `Model 2`, and preserve shared model-list behavior with accessible semantics.

### Tasks

- [x] Activate right dropdown control and keep shared option source
  - Task ID: P1-T1
  - Description: Update selector component state/props so the right dropdown is interactive (no longer forced disabled) while both dropdowns continue using the same models list/options.
  - Dependencies: None
  - Validation command: `npx vitest run --config vitest.unit.config.ts tests/unit/models-selector.test.ts`
  - Expected result: Unit tests verify both dropdown controls can be enabled and share equivalent option sets.

- [x] Rename selector labels and preserve control associations
  - Task ID: P1-T2
  - Description: Change visible and accessible labels from generic/inactive wording to `Model 1` and `Model 2`, preserving valid label-control wiring and helper text associations.
  - Dependencies: P1-T1
  - Validation command: `npx vitest run --config vitest.unit.config.ts tests/unit/models-selector.test.ts tests/unit/app.a11y.test.ts`
  - Expected result: Tests verify label text and accessibility associations for both controls.

- [x] Add independent right-side model update path
  - Task ID: P1-T3
  - Description: Ensure the selector emits/handles independent model updates for left and right controls without cross-overwriting values.
  - Dependencies: P1-T1
  - Validation command: `npx vitest run --config vitest.unit.config.ts tests/unit/models-selector.test.ts tests/unit/app.ui.test.ts`
  - Expected result: Tests verify model selection changes on one side do not overwrite the other side.

### Validation

- Run selector-focused unit and accessibility tests for active dual-control behavior.

### Exit Criteria (Done when...)

- Both dropdown controls are active when models are available.
- Dropdown labels are `Model 1` and `Model 2`.
- Model options remain identical between left and right dropdowns.
- Accessibility associations remain valid.

---

## Phase 2 — Implement Dual-Query Submit Flow and Side-Specific State

### Objective

Replace mirrored single-query behavior with true two-query submission and independent left/right response state handling.

### Tasks

- [x] Introduce independent left/right selected-model state in app layer
  - Task ID: P2-T1
  - Description: Update app-level state wiring to store and read separate selected model values for left and right controls.
  - Dependencies: P1-T3
  - Validation command: `npx vitest run --config vitest.unit.config.ts tests/unit/app.ui.test.ts`
  - Expected result: Tests verify both selected-model values are tracked independently.

- [x] Update submit logic to execute two model-targeted requests
  - Task ID: P2-T2
  - Description: Modify send flow so one valid submit triggers two server-side query executions using the same prompt with left/right selected models.
  - Dependencies: P2-T1
  - Validation command: `npx vitest run --config vitest.unit.config.ts tests/unit/app.ui.test.ts`
  - Expected result: Tests verify dual-query invocation and model-to-request mapping for both sides.

- [x] Add independent left/right request/result state buckets
  - Task ID: P2-T3
  - Description: Ensure each side can independently represent loading/success/error and render based on its own result state.
  - Dependencies: P2-T2
  - Validation command: `npx vitest run --config vitest.unit.config.ts tests/unit/app.ui.test.ts`
  - Expected result: Tests verify mixed outcomes (left success/right error and left error/right success) render correctly.

- [x] Preserve prompt validation gating for dual-query path
  - Task ID: P2-T4
  - Description: Keep existing prompt validation behavior so invalid prompts block both requests and retain current validation UX.
  - Dependencies: P2-T2
  - Validation command: `npx vitest run --config vitest.unit.config.ts tests/unit/app.ui.test.ts`
  - Expected result: Tests verify no requests are started when prompt validation fails.

### Validation

- Run app UI unit tests focused on dual-query submit flow, independent side outcomes, and validation behavior.

### Exit Criteria (Done when...)

- One send action issues two model-targeted query executions.
- Left and right results/errors render independently.
- Prompt validation still blocks requests consistently when invalid.

---

## Phase 3 — Update Output Headings, Error Safety, and API Contract Alignment

### Objective

Render model-aware output headings and ensure request/response/error contract alignment remains secure and deterministic.

### Tasks

- [x] Render model-aware output headings per side
  - Task ID: P3-T1
  - Description: Replace static output headings with `Response from Model 1 (<model-1-name>)` and `Response from Model 2 (<model-2-name>)`, bound to each side’s submitted model.
  - Dependencies: P2-T3
  - Validation command: `npx vitest run --config vitest.unit.config.ts tests/unit/app.ui.test.ts tests/e2e/app.spec.ts`
  - Expected result: Unit/E2E tests verify heading text includes side and selected model name.

- [x] Ensure side-specific sanitized error rendering
  - Task ID: P3-T2
  - Description: Preserve existing error normalization/sanitization for each side so independent errors remain safe and do not leak sensitive data.
  - Dependencies: P2-T3
  - Validation command: `npx vitest run --config vitest.unit.config.ts tests/unit/app.ui.test.ts tests/unit/ui-error-alert.test.ts`
  - Expected result: Tests verify side-specific error rendering preserves sanitized details behavior.

- [x] Align client-server dual-query payload/response contract
  - Task ID: P3-T3
  - Description: If server contract changes are required, update client and server together for deterministic dual-query request/response shapes.
  - Dependencies: P2-T2
  - Validation command: `npx vitest run --config vitest.config.ts tests/integration/respond-route.test.ts`
  - Expected result: Integration tests verify contract correctness for dual success and mixed/dual error conditions.

### Validation

- Run unit, integration, and e2e checks for headings, contract behavior, and sanitized side-specific errors.

### Exit Criteria (Done when...)

- Output headings include model-aware side labels.
- Side-specific errors remain sanitized and independently rendered.
- Any required API contract updates are fully aligned between client and server.

---

## Phase 4 — End-to-End Accessibility, Security, and Regression Validation

### Objective

Finalize the feature with full regression confidence across accessibility, security expectations, and project quality gates.

### Tasks

- [x] Expand accessibility coverage for dual-active selectors and output regions
  - Task ID: P4-T1
  - Description: Verify keyboard flow, label associations, and perceivable side-specific output semantics for the updated UI.
  - Dependencies: P1-T2, P3-T1
  - Validation command: `npx vitest run --config vitest.unit.config.ts tests/unit/app.a11y.test.ts && npx playwright test tests/e2e/accessibility.spec.ts`
  - Expected result: Accessibility tests pass with no regressions in landmarks, labeling, and perceivable output context.

- [x] Run dual-flow e2e scenarios for success and mixed error outcomes
  - Task ID: P4-T2
  - Description: Extend/verify user-visible flows for two active model selectors, dual-query send behavior, and independent side rendering.
  - Dependencies: P2-T3, P3-T1
  - Validation command: `npx playwright test tests/e2e/app.spec.ts`
  - Expected result: E2E tests pass for dual-response and side-specific error/success scenarios.

- [x] Execute full project quality gates
  - Task ID: P4-T3
  - Description: Run full typecheck, test, and lint gates after all updates to ensure no regressions across project scope.
  - Dependencies: P4-T1, P4-T2
  - Validation command: `npm run typecheck && npm test && npm run lint`
  - Expected result: All quality gates pass with no new regressions.

### Validation

- Run complete quality gates after targeted validation passes.

### Exit Criteria (Done when...)

- Accessibility, security, and side-specific dual-query behavior are validated end-to-end.
- Full project quality gates pass.

---

## Risks, Assumptions, and Dependencies

- **Risk:** Dual-query submit logic may accidentally overwrite one side’s state with the other.
  - **Mitigation:** Explicitly isolate left/right state buckets and add mixed-outcome unit tests.
- **Risk:** Contract changes for dual responses may break existing route integrations.
  - **Mitigation:** Add integration tests for expected dual success and error combinations before UI finalization.
- **Risk:** Label/heading updates may regress accessibility naming or output-context clarity.
  - **Mitigation:** Add/expand a11y tests and side-specific heading assertions.
- **Assumption:** Existing server architecture can support dual-query handling within current route boundaries.
- **Dependency:** Existing test harnesses (Vitest + Playwright) remain stable for expanded dual-flow coverage.

---

## Traceability

| Phase / Task ID | Design Section                           | Notes                                                                 |
| --------------- | ---------------------------------------- | --------------------------------------------------------------------- |
| P1-T1           | Architecture, Interfaces, Data           | Activates right selector while preserving shared options source.      |
| P1-T2           | Accessibility, Interfaces                | Applies `Model 1` / `Model 2` label changes with valid associations.  |
| P1-T3           | Interfaces, Data, Testing                | Adds independent model update paths for both selectors.               |
| P2-T1           | Data, Interfaces                         | Introduces independent left/right selected-model state.               |
| P2-T2           | Architecture, Data, Interfaces           | Implements dual-query submit behavior from one send action.           |
| P2-T3           | Data, Validation/Error Handling          | Introduces independent per-side request/result state rendering.       |
| P2-T4           | Validation/Error Handling                | Preserves existing prompt-validation gate before request execution.   |
| P3-T1           | Validation/Error Handling, Accessibility | Replaces static headings with side/model-aware output titles.         |
| P3-T2           | Security, Validation/Error Handling      | Preserves sanitized side-specific error rendering behavior.           |
| P3-T3           | Interfaces, Data, Testing, Security      | Aligns dual-query payload/response contract and integration behavior. |
| P4-T1           | Accessibility, Testing                   | Validates keyboard flow, labeling, and perceivable output context.    |
| P4-T2           | Testing, Validation/Error Handling       | Verifies full dual-flow user behavior and independent side outcomes.  |
| P4-T3           | Testing                                  | Executes full project quality gates to close implementation.          |

---

**Next step:** `.github/prompts/prompt-5-implement-from-plan.md` — pass this `implementation-plan.md` to begin implementation.

## Run History

> **Prompt 6 run — 2026-04-26:** No unresolved discrepancies found. Workflow complete.
