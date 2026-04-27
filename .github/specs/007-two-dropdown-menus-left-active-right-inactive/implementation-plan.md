# Implementation Plan: Two Dropdown Menus (Left Active, Right Inactive)

**Source design:** `.github/specs/007-two-dropdown-menus-left-active-right-inactive/design.md`
**Output artifact:** `.github/specs/007-two-dropdown-menus-left-active-right-inactive/implementation-plan.md`

## Phase 1 — Add Dual-Dropdown UI Structure and Wiring

### Objective
Render two equally sized model dropdown menus in the selector UI, keep the left dropdown active and bound to current selected-model state, and keep the right dropdown disabled/inactive.

### Tasks
- [x] Add two dropdown controls in `ModelsSelector` layout
  - Task ID: P1-T1
  - Description: Update `app/components/ModelsSelector.vue` to render left and right dropdown controls side-by-side (responsive stack allowed), with equal-size styling on desktop widths.
  - Dependencies: None
  - Validation command: `npm run typecheck`
  - Expected result: Component compiles with two dropdown controls and no type/template errors.

- [x] Bind left dropdown to existing active model selection flow
  - Task ID: P1-T2
  - Description: Keep current left dropdown behavior unchanged for model selection and `update:selectedModelId` emission, preserving existing active control semantics.
  - Dependencies: P1-T1
  - Validation command: `npx vitest run --config vitest.unit.config.ts tests/unit/models-selector.test.ts`
  - Expected result: Tests confirm left dropdown remains enabled and continues to emit selection updates.

- [x] Implement right dropdown as disabled mirrored options control
  - Task ID: P1-T3
  - Description: Add a right dropdown that uses the same model options list/order as left but is disabled/inactive and does not emit selection updates.
  - Dependencies: P1-T1
  - Validation command: `npx vitest run --config vitest.unit.config.ts tests/unit/models-selector.test.ts`
  - Expected result: Tests confirm right dropdown is disabled and displays matching options.

### Validation
- Run `npm run typecheck` after component/template changes.
- Run `tests/unit/models-selector.test.ts` to verify dual-dropdown structure and behavior.

### Exit Criteria (Done when...)
- Two dropdowns are rendered in selector UI.
- Left dropdown remains active and interactive.
- Right dropdown remains disabled and non-interactive.

---

## Phase 2 — Preserve Submit Contract and Behavioral Compatibility

### Objective
Ensure submit and data flow behavior remains unchanged: one request per submit, left-selected model only, no right-dropdown influence.

### Tasks
- [x] Ensure submit payload continues using left dropdown model only
  - Task ID: P2-T1
  - Description: Verify/update `app/app.vue` and related model-selection wiring so only left `selectedModelId` participates in submit payload model selection.
  - Dependencies: P1-T2, P1-T3
  - Validation command: `npx vitest run --config vitest.unit.config.ts tests/unit/app.ui.test.ts`
  - Expected result: App UI tests confirm submit behavior remains single-model and unchanged.

- [x] Verify models loading/error/retry behavior remains intact with dual dropdowns
  - Task ID: P2-T2
  - Description: Validate that model-loading indicator, model-load error rendering, and retry behavior still function correctly with two dropdowns present.
  - Dependencies: P1-T1
  - Validation command: `npx vitest run --config vitest.unit.config.ts tests/unit/models-selector.test.ts tests/unit/app.ui.test.ts`
  - Expected result: Existing and updated tests pass with no regressions in loading/error/retry states.

- [x] Confirm no server/API contract changes are introduced
  - Task ID: P2-T3
  - Description: Ensure no modifications are made to `/api/models` and `/api/respond` contracts or server routes as part of this feature.
  - Dependencies: P2-T1
  - Validation command: `npx vitest run --config vitest.config.ts tests/integration/models.test.ts tests/integration/respond-route.test.ts`
  - Expected result: Integration tests pass unchanged, indicating stable server/API behavior.

### Validation
- Run targeted app/model-selector unit tests.
- Run integration tests for models/respond routes to confirm no contract regressions.

### Exit Criteria (Done when...)
- Submit flow still uses left model source only.
- Model loading/error/retry behavior remains unchanged.
- No server/API contract drift is introduced.

---

## Phase 3 — Accessibility, Security, and End-to-End Validation

### Objective
Validate accessibility and security constraints for dual-dropdown UI and finalize full quality gates.

### Tasks
- [x] Verify accessible labeling and association for both dropdowns
  - Task ID: P3-T1
  - Description: Ensure both dropdown controls have clear labels/associations and maintain proper helper/error text associations (`aria-describedby`) where applicable.
  - Dependencies: P1-T1
  - Validation command: `npx vitest run --config vitest.unit.config.ts tests/unit/models-selector.test.ts tests/unit/app.a11y.test.ts`
  - Expected result: Accessibility-focused tests pass and both controls are discoverable with correct semantics.

- [x] Verify right-dropdown disabled semantics and keyboard behavior
  - Task ID: P3-T2
  - Description: Confirm right dropdown exposes proper disabled semantics and cannot be modified by keyboard/mouse interactions while remaining perceivable in context.
  - Dependencies: P1-T3
  - Validation command: `npx vitest run --config vitest.unit.config.ts tests/unit/models-selector.test.ts tests/unit/app.ui.test.ts`
  - Expected result: Tests confirm right dropdown remains disabled and non-operable.

- [x] Add or adjust E2E assertions for dual-dropdown visibility/disabled state
  - Task ID: P3-T3
  - Description: Update `tests/e2e/*.spec.ts` to verify two dropdowns are visible with right control disabled and left control active in user-visible flow.
  - Dependencies: P1-T1, P1-T3
  - Validation command: `npm run test:e2e`
  - Expected result: E2E suite passes with dual-dropdown assertions.

- [x] Run full project quality gates
  - Task ID: P3-T4
  - Description: Execute full typecheck/test/lint gates after all feature and test updates.
  - Dependencies: P2-T1, P2-T2, P2-T3, P3-T1, P3-T2
  - Validation command: `npm run typecheck && npm test && npm run lint`
  - Expected result: All quality gates pass with no regressions.

### Validation
- Run accessibility-focused and selector-focused unit tests.
- Run e2e and full project quality gates.

### Exit Criteria (Done when...)
- Accessibility requirements for dual dropdowns are satisfied.
- Security constraints are preserved (no new unsafe rendering or trust-boundary changes).
- Full project quality gates pass.

---

## Risks, Assumptions, and Dependencies

- **Risk:** Dual-dropdown introduction could unintentionally alter existing single-model submit behavior.
  - **Mitigation:** Explicitly test payload behavior from left dropdown only and avoid new submit branches.
- **Risk:** Disabled right control may regress accessibility semantics.
  - **Mitigation:** Add dedicated tests for disabled semantics and keyboard interaction expectations.
- **Assumption:** Existing model list state (`useModelsState`) is sufficient for both controls without additional store complexity.
- **Dependency:** Existing unit/integration/e2e harnesses are available and stable on baseline branch.

---

## Traceability

| Phase / Task ID | Design Section | Notes |
| --------------- | -------------- | ----- |
| P1-T1 | Architecture, Data, Accessibility | Implements two-control UI structure with side-by-side equal sizing and label-ready layout. |
| P1-T2 | Interfaces, Data, Validation/Error Handling | Preserves active left-dropdown selection and update flow. |
| P1-T3 | Data, Validation/Error Handling, Accessibility | Adds disabled right dropdown with mirrored options and non-authoritative behavior. |
| P2-T1 | Data, Interfaces, Architecture | Confirms submit contract remains left-model-only and one-request flow unchanged. |
| P2-T2 | Validation/Error Handling, Testing | Verifies loading/error/retry compatibility with dual-dropdown UI. |
| P2-T3 | Interfaces, Architecture, Security | Confirms no server/API contract changes in models/respond routes. |
| P3-T1 | Accessibility, Interfaces | Validates labeling and control associations for both dropdowns. |
| P3-T2 | Accessibility, Validation/Error Handling | Validates disabled semantics and non-operability of right control. |
| P3-T3 | Testing, Data | Adds user-visible e2e checks for dual-dropdown state and behavior. |
| P3-T4 | Testing, Security, Accessibility | Runs final typecheck/test/lint quality gate. |

---

**Next step:** `.github/prompts/prompt-5-implement-from-plan.md` — pass this `implementation-plan.md` to begin implementation.

## Run History

> **Prompt 6 run — 2026-04-24:** No unresolved discrepancies found. Workflow complete.
