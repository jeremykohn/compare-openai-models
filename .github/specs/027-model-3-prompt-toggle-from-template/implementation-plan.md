# Implementation Plan

## Phase 1 — Expose generated Model 3 prompt in comparison state

### Objective
Ensure Model 3 generated prompt text is available to the UI only when prerequisite run data is valid.

### Tasks
- [x] Add or align template-substitution data exposure for Model 3 prompt
  - `Task ID: P1-T1`
  - `Description: Update existing compare-flow state/composable logic to expose a generated Model 3 prompt string derived from template substitution using current run data (user prompt, Model 1 output text, Model 2 output text).`
  - `Dependencies: None`
  - `Validation command: npm run test:unit -- tests/unit/*.test.ts`
  - `Expected result: State layer returns generated Model 3 prompt only when required inputs are available for the active run.`

- [x] Guard prompt exposure when prerequisites are missing
  - `Task ID: P1-T2`
  - `Description: Add guards so prompt inspection content is absent when Model 1/Model 2 output prerequisites are missing or failed, preserving existing error/empty behavior.`
  - `Dependencies: P1-T1`
  - `Validation command: npm run test:unit -- tests/unit/*.test.ts`
  - `Expected result: No misleading generated prompt is surfaced for incomplete/failed upstream states.`

### Validation
- Verify generated prompt includes original prompt + Model 1 + Model 2 substituted content.
- Verify guarded behavior for missing prerequisite data.

### Exit Criteria
Done when generated prompt state is available for valid runs and absent for invalid/incomplete runs.

## Phase 2 — Add third-panel prompt toggle UI with accessible semantics

### Objective
Introduce the `Prompt for Model 3` toggle in the third panel and render a read-only generated prompt view with correct default collapsed behavior.

### Tasks
- [x] Add third-panel toggle control and controlled prompt region
  - `Task ID: P2-T1`
  - `Description: Update `app/components/ComparisonOutputPanel.vue` (and any related child component) to render a visible toggle labeled `Prompt for Model 3` above the third-panel placeholder/output area, controlling a read-only prompt region.`
  - `Dependencies: P1-T1`
  - `Validation command: npm run test:unit -- tests/unit/*.test.ts`
  - `Expected result: Third panel renders toggle and controlled region without altering existing output/placeholder rendering.`

- [x] Implement default-collapsed and run-reset behavior for toggle state
  - `Task ID: P2-T2`
  - `Description: Add prompt-view state initialization/reset logic so the prompt remains collapsed by default and resets to collapsed on new comparison runs.`
  - `Dependencies: P2-T1`
  - `Validation command: npm run test:unit -- tests/unit/*.test.ts`
  - `Expected result: Prompt view is hidden by default and reliably resets between runs.`

- [x] Apply accessibility semantics for toggle and region association
  - `Task ID: P2-T3`
  - `Description: Ensure toggle is keyboard operable and exposes `aria-expanded` and `aria-controls` relationship to a stable prompt region ID; ensure collapsed content is not in inappropriate focus flow.`
  - `Dependencies: P2-T1`
  - `Validation command: npm run test:unit -- tests/unit/app.a11y.test.ts`
  - `Expected result: Toggle/region semantics are valid and accessibility checks pass.`

### Validation
- Verify label is exactly `Prompt for Model 3`.
- Verify default collapsed state and expand/collapse behavior.
- Verify existing third-panel states (placeholder/output/error) remain unchanged.

### Exit Criteria
Done when third panel includes accessible toggle + controlled prompt region with correct default and reset behavior.

## Phase 3 — Add regression coverage and verify quality gates

### Objective
Prove prompt generation and toggle behavior with automated coverage and validate integration safety.

### Tasks
- [x] Add unit/component coverage for prompt generation and toggle behavior
  - `Task ID: P3-T1`
  - `Description: Add or update tests to verify template-driven generated prompt content, toggle rendering, default collapsed state, and expand/collapse interactions.`
  - `Dependencies: P1-T2, P2-T2, P2-T3`
  - `Validation command: npm run test:unit -- tests/unit/*.test.ts`
  - `Expected result: Unit/component tests pass and fail appropriately on regressions in generation/toggle behavior.`

- [x] Add or update e2e coverage for third-panel prompt inspection flow
  - `Task ID: P3-T2`
  - `Description: Update `tests/e2e/app.spec.ts` (or equivalent) to validate third-panel toggle visibility, default hidden prompt text, and post-toggle prompt visibility in compare flow.`
  - `Dependencies: P3-T1`
  - `Validation command: npm run test:e2e -- tests/e2e/app.spec.ts`
  - `Expected result: E2E verifies user-visible prompt-inspection behavior without breaking existing flow.`

- [x] Run full repository quality gates
  - `Task ID: P3-T3`
  - `Description: Run typecheck, full tests, and lint to confirm integration-safe delivery.`
  - `Dependencies: P3-T2`
  - `Validation command: npm run typecheck && npm test && npm run lint`
  - `Expected result: All quality gates pass.`

### Validation
- Confirm tests assert prompt generation correctness and toggle accessibility behavior.
- Confirm no regressions in existing compare output behavior.

### Exit Criteria
Done when targeted tests and full quality gates pass.

## Risks and Mitigations

- **Risk:** Stale prompt content appears from prior run.
  - **Mitigation:** Reset prompt visibility state and rely on current-run source values only.
- **Risk:** Toggle introduces accessibility regressions.
  - **Mitigation:** Use native button semantics with `aria-expanded`/`aria-controls` and include accessibility tests.
- **Risk:** Prompt generation path diverges from canonical template usage.
  - **Mitigation:** Keep `server/assets/prompt-templates/model-3-prompt-template.md` as canonical source and test substitution behavior.

## Assumptions

- Existing compare flow already has access to current-run prompt and model outputs.
- Template placeholders are compatible with current substitution utility/pattern.

## Dependencies

- Existing compare UI components/composables in `app/components/` and `app/composables/`.
- Existing template asset under `server/assets/prompt-templates/`.
- Existing project test/lint/typecheck tooling.

## Traceability

| Phase / Task ID | Design Section | Notes |
| --------------- | -------------- | ----- |
| Phase 1 | Architecture; Interfaces; Data; Validation/Error Handling | Exposes generated prompt state with prerequisite guards. |
| P1-T1 | Architecture; Interfaces; Data | Implements template-derived prompt exposure for active run. |
| P1-T2 | Validation/Error Handling; Security | Prevents misleading prompt visibility when prerequisites fail/missing. |
| Phase 2 | Interfaces; Accessibility; Validation/Error Handling | Adds toggle-controlled, accessible prompt inspection UI. |
| P2-T1 | Interfaces; Architecture | Renders `Prompt for Model 3` control and controlled prompt region. |
| P2-T2 | Interfaces; Validation/Error Handling | Enforces default collapsed and reset-on-new-run behavior. |
| P2-T3 | Accessibility; Interfaces | Implements semantic state/association and keyboard-safe behavior. |
| Phase 3 | Testing | Adds regression coverage and validates integration gates. |
| P3-T1 | Testing; Architecture; Interfaces | Covers generation correctness and toggle interactions in unit/component tests. |
| P3-T2 | Testing; Interfaces | Verifies end-to-end user-visible behavior in compare flow. |
| P3-T3 | Testing | Executes full quality gates for merge readiness. |

## Run History

> **Prompt 6 run — 2026-04-30:** No unresolved discrepancies found. Workflow complete.
