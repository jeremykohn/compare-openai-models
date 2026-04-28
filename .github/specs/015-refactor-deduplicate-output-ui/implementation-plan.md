# Implementation Plan: Refactor and Deduplicate Output-Related UI Code

**Source design:** `.github/specs/015-refactor-deduplicate-output-ui/design.md`
**Output artifact:** `.github/specs/015-refactor-deduplicate-output-ui/implementation-plan.md`

## Phase 1 — Deduplicate App-Level Output Panel Rendering

### Objective
Replace repeated output panel markup in `app/app.vue` with data-driven rendering while preserving panel order, ownership, and visible behavior.

### Tasks

- [x] Introduce computed output panel descriptor list
  - `Task ID: P1-T1`
  - `Description: Add a computed array in app/app.vue containing panel descriptor objects for Model 1 and Model 2 (label, heading, status, data, error).`
  - `Dependencies: None`
  - `Validation command: npx vitest run --config vitest.unit.config.ts tests/unit/app.ui.test.ts`
  - `Expected result: App unit tests pass and confirm output behavior remains intact.`

- [x] Replace duplicated `ModelOutputPanel` blocks with `v-for`
  - `Task ID: P1-T2`
  - `Description: Render `ModelOutputPanel` instances via `v-for` over the descriptor list, preserving left-to-right order and unchanged prop values.`
  - `Dependencies: P1-T1`
  - `Validation command: npx vitest run --config vitest.unit.config.ts tests/unit/app.ui.test.ts`
  - `Expected result: Existing output assertions continue to pass with no behavior regression.`

- [x] Confirm no selector/form/request logic drift
  - `Task ID: P1-T3`
  - `Description: Verify diff scope in app/app.vue remains output-rendering-only and does not alter model selection, prompt validation, or submit request logic.`
  - `Dependencies: P1-T2`
  - `Validation command: git diff -- app/app.vue`
  - `Expected result: Diff shows output-rendering dedup only.`

### Validation
- `npx vitest run --config vitest.unit.config.ts tests/unit/app.ui.test.ts`
- `git diff -- app/app.vue`

### Exit Criteria (Done when...)
- App-level output panel duplication is removed.
- Panel order and behavior remain unchanged.
- Non-output logic in `app/app.vue` is untouched.

---

## Phase 2 — Deduplicate Error Details Rows via Reusable Subcomponent

### Objective
Extract repeated error details row markup from `UiErrorAlert.vue` into a reusable output-focused subcomponent and render rows from derived data.

### Tasks

- [x] Add `UiErrorDetailRow.vue` reusable subcomponent
  - `Task ID: P2-T1`
  - `Description: Create a new component that renders a single details row (`dt`/`dd`) with existing row wrapper and text classes.`
  - `Dependencies: None`
  - `Validation command: npx vitest run --config vitest.unit.config.ts tests/unit/ui-error-detail-row.test.ts`
  - `Expected result: New unit tests verify row rendering and class parity.`

- [x] Refactor `UiErrorAlert.vue` to data-driven details rows
  - `Task ID: P2-T2`
  - `Description: Replace repeated conditional row markup with a computed row list and `v-for` rendering using `UiErrorDetailRow`, preserving labels, values, and conditional visibility rules.`
  - `Dependencies: P2-T1`
  - `Validation command: npx vitest run --config vitest.unit.config.ts tests/unit/ui-error-alert.test.ts`
  - `Expected result: Existing alert tests pass with unchanged behavior semantics.`

- [x] Verify details toggle/retry behavior remains unchanged
  - `Task ID: P2-T3`
  - `Description: Ensure refactor does not alter `<details>/<summary>` behavior or retry-button emit semantics.`
  - `Dependencies: P2-T2`
  - `Validation command: npx vitest run --config vitest.unit.config.ts tests/unit/ui-error-alert.test.ts tests/unit/app.a11y.test.ts`
  - `Expected result: Toggle and retry behavior tests remain green with no accessibility regressions.`

### Validation
- `npx vitest run --config vitest.unit.config.ts tests/unit/ui-error-detail-row.test.ts`
- `npx vitest run --config vitest.unit.config.ts tests/unit/ui-error-alert.test.ts tests/unit/app.a11y.test.ts`

### Exit Criteria (Done when...)
- Repeated details row markup is removed from `UiErrorAlert.vue`.
- Error details labels/values and conditional visibility remain behaviorally equivalent.
- Accessibility semantics for alert/details remain intact.

---

## Phase 3 — Regression Coverage, E2E Confidence, and Quality Gates

### Objective
Confirm refactor parity via targeted and full validation and ensure repository quality gates remain green.

### Tasks

- [x] Run focused output-path unit tests
  - `Task ID: P3-T1`
  - `Description: Execute unit suites covering app output rendering, output panel behavior, and refactored error details components.`
  - `Dependencies: P1-T3, P2-T3`
  - `Validation command: npx vitest run --config vitest.unit.config.ts tests/unit/app.ui.test.ts tests/unit/model-output-panel.test.ts tests/unit/ui-error-alert.test.ts tests/unit/ui-error-detail-row.test.ts`
  - `Expected result: Output-focused unit suites pass with no regressions.`

- [x] Run output-related e2e regression suite
  - `Task ID: P3-T2`
  - `Description: Execute browser tests validating output rendering and error-details behavior after refactor.`
  - `Dependencies: P3-T1`
  - `Validation command: npx playwright test tests/e2e/app.spec.ts`
  - `Expected result: Output flow e2e tests pass unchanged.`

- [x] Run full repository quality gates
  - `Task ID: P3-T3`
  - `Description: Run full typecheck, test, and lint to verify integration readiness.`
  - `Dependencies: P3-T1, P3-T2`
  - `Validation command: npm run typecheck && npm test && npm run lint`
  - `Expected result: All gates pass.`

### Validation
- `npx vitest run --config vitest.unit.config.ts tests/unit/app.ui.test.ts tests/unit/model-output-panel.test.ts tests/unit/ui-error-alert.test.ts tests/unit/ui-error-detail-row.test.ts`
- `npx playwright test tests/e2e/app.spec.ts`
- `npm run typecheck && npm test && npm run lint`

### Exit Criteria (Done when...)
- Targeted refactor regressions are green.
- E2E output flow is green.
- Full quality gates pass.

---

## Risks, Assumptions, and Dependencies

- **Risk:** Selector-based tests may be brittle to internal render refactor.
  - **Mitigation:** Keep rendered text/roles/test IDs stable and update tests minimally where selector mechanics change.
- **Risk:** New subcomponent can accidentally alter row class parity.
  - **Mitigation:** Add direct unit tests for class and content parity in `UiErrorDetailRow`.
- **Assumption:** Existing output behavior tests adequately represent parity requirements.
- **Dependency:** Current Vitest/Playwright setup remains stable in this branch.

---

## Traceability

| Phase / Task ID | Design Section | Notes |
| --------------- | -------------- | ----- |
| P1-T1 | Architecture → Target State; Data | Introduces data-driven panel descriptors. |
| P1-T2 | Architecture → Target State; Interfaces | Deduplicates app-level panel markup via `v-for`. |
| P1-T3 | Architecture → Affected Files | Enforces output-only scope in app-level changes. |
| P2-T1 | Interfaces → UiErrorDetailRow.vue | Adds reusable output-focused row component. |
| P2-T2 | Architecture → Target State; Validation / Error Handling | Refactors repeated alert rows with equivalent conditional behavior. |
| P2-T3 | Accessibility | Confirms details/retry semantics preserved. |
| P3-T1 | Testing → Unit | Executes focused output-path unit suites. |
| P3-T2 | Testing → Existing Suites | Validates browser output behavior parity. |
| P3-T3 | Testing → Quality Gates | Ensures full repository integration gates pass. |

---

**Next step:** `.github/prompts/prompt-5-implement-from-plan.md` — pass this `implementation-plan.md` to begin implementation.

## Run History

> **Prompt 5 run — 2026-04-27:** Implementation tasks through `P3-T2` completed and validated. `P3-T3` remained open due a lint gate failure from `server/assets/models/openai-models.json` formatting (`prettier --check`).
>
> **Prompt 5 run — 2026-04-28:** Re-ran formatting and full quality checks; `P3-T3` completed (`npm run typecheck`, `npm test`, `npm run lint` all passing).
