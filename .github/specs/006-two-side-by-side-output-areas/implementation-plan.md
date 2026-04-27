# Implementation Plan: Two Side-by-Side Output Areas

**Source design:** `.github/specs/006-two-side-by-side-output-areas/design.md`
**Output artifact:** `.github/specs/006-two-side-by-side-output-areas/implementation-plan.md`

## Phase 1 — Implement Mirrored Dual-Panel Output Layout in `app/app.vue`

### Objective
Replace the single response/error output rendering area with two equal-width mirrored output panels while preserving the current submit lifecycle and state logic.

### Tasks
- [x] Add two-panel output container and panel headings
  - Task ID: P1-T1
  - Description: Update the output section in `app/app.vue` to render two output panels in a horizontal, equal-width layout at desktop widths (responsive stack allowed at narrow widths), including clear panel labels/headings.
  - Dependencies: None
  - Validation command: `npm run typecheck`
  - Expected result: Typecheck passes and template compiles with new two-panel structure.

- [x] Mirror success-state rendering into both panels
  - Task ID: P1-T2
  - Description: In `app/app.vue`, render identical success content in both output panels when `state.status === "success"` and `state.data` is present, preserving existing response formatting semantics.
  - Dependencies: P1-T1
  - Validation command: `npx vitest run --config vitest.unit.config.ts tests/unit/app.ui.test.ts`
  - Expected result: Unit tests confirm both panels show the same success response content.

- [x] Mirror error-state rendering into both panels using existing error contract
  - Task ID: P1-T3
  - Description: Render identical `UiErrorAlert` instances in both output panels for `state.status === "error"` using the same `state.error` object and existing alert props/behavior.
  - Dependencies: P1-T1
  - Validation command: `npx vitest run --config vitest.unit.config.ts tests/unit/app.ui.test.ts tests/unit/ui-error-alert.test.ts`
  - Expected result: Unit tests confirm mirrored error message and details-toggle behavior in both panels.

### Validation
- Run `npm run typecheck` after template/layout changes.
- Run targeted unit tests for app UI and error alert behavior.

### Exit Criteria (Done when...)
- `app/app.vue` renders two output panels instead of one.
- Success and error views are mirrored across both panels.
- Existing submit/request flow logic remains unchanged.

---

## Phase 2 — Add/Update Automated Tests for Mirrored Panel Behavior

### Objective
Ensure explicit, regression-proof automated coverage for two-panel mirrored success and error rendering.

### Tasks
- [x] Add unit test assertions for dual success output panels
  - Task ID: P2-T1
  - Description: Update `tests/unit/app.ui.test.ts` to assert two output panels exist in success state and both include the same response content.
  - Dependencies: P1-T2
  - Validation command: `npx vitest run --config vitest.unit.config.ts tests/unit/app.ui.test.ts`
  - Expected result: New/updated success-panel assertions pass.

- [x] Add unit test assertions for dual mirrored error panels
  - Task ID: P2-T2
  - Description: Update `tests/unit/app.ui.test.ts` to assert two mirrored error panels render in error state with identical message and matching details-toggle presence/behavior.
  - Dependencies: P1-T3
  - Validation command: `npx vitest run --config vitest.unit.config.ts tests/unit/app.ui.test.ts tests/unit/ui-error-alert.test.ts`
  - Expected result: New/updated error-panel assertions pass.

- [x] Add optional end-to-end mirrored-output verification
  - Task ID: P2-T3
  - Description: Update `tests/e2e/app.spec.ts` with at least one success-path scenario asserting two visible output regions contain identical response text.
  - Dependencies: P1-T2
  - Validation command: `npm run test:e2e`
  - Expected result: E2E suite passes with mirrored-output assertion.

### Validation
- Run targeted unit tests for panel mirroring checks.
- Run E2E test(s) for user-visible mirrored layout behavior.

### Exit Criteria (Done when...)
- Unit tests explicitly verify mirrored success and error panel rendering.
- E2E coverage includes mirrored success output check (if P2-T3 implemented).

---

## Phase 3 — Security/Accessibility Consistency and Final Quality Gates

### Objective
Confirm the mirrored layout preserves existing security boundaries, sanitization behavior, accessibility semantics, and project quality gates.

### Tasks
- [x] Verify no new unsafe rendering paths or trust-boundary changes
  - Task ID: P3-T1
  - Description: Confirm no use of unsafe HTML insertion (for example `v-html`) was introduced and no server/client trust boundary changes were made while implementing mirrored panels.
  - Dependencies: P1-T2, P1-T3
  - Validation command: `npx vitest run --config vitest.unit.config.ts tests/unit/error-normalization.test.ts tests/unit/ui-error-alert.test.ts`
  - Expected result: Existing sanitization/error-display tests pass and no unsafe rendering path is introduced.

- [x] Verify accessibility semantics in mirrored panel layout
  - Task ID: P3-T2
  - Description: Ensure mirrored panel headings/labels are present and keyboard/alert/disclosure behavior remains operable and predictable across both panels.
  - Dependencies: P1-T1, P1-T3
  - Validation command: `npx vitest run --config vitest.unit.config.ts tests/unit/app.a11y.test.ts tests/unit/app.ui.test.ts tests/unit/ui-error-alert.test.ts`
  - Expected result: Accessibility-oriented unit checks pass with no semantic regressions.

- [x] Run full project quality gate
  - Task ID: P3-T3
  - Description: Run full compile, test, and lint gates after all implementation and test updates.
  - Dependencies: P2-T1, P2-T2, P3-T1, P3-T2
  - Validation command: `npm run typecheck && npm test && npm run lint`
  - Expected result: All gates pass with no regressions.

### Validation
- Run security/accessibility-focused unit suites.
- Run full typecheck, tests, and lint.

### Exit Criteria (Done when...)
- No new security exposure is introduced by mirrored rendering.
- Accessibility semantics remain valid and operable.
- Full project quality gates pass.

---

## Risks, Assumptions, and Dependencies

- **Risk:** Mirroring output blocks may duplicate or desynchronize conditional rendering branches.
  - **Mitigation:** Render both panels from the same shared state conditions and assert equivalence in tests.
- **Risk:** Two-panel layout may regress readability/focus flow at narrow widths.
  - **Mitigation:** Use responsive layout classes and run existing a11y/unit checks.
- **Assumption:** Current request state and error contracts are sufficient for mirrored rendering with no schema changes.
- **Dependency:** Existing test harnesses (`vitest`, `playwright`) remain available and green for baseline branch.

---

## Traceability

| Phase / Task ID | Design Section | Notes |
| --------------- | -------------- | ----- |
| P1-T1 | Architecture, Data, Accessibility | Implements two-panel equal-width layout and panel labeling semantics. |
| P1-T2 | Data, Interfaces | Mirrors success rendering from one state snapshot with existing response semantics. |
| P1-T3 | Validation/Error Handling, Interfaces, Security, Accessibility | Mirrors error rendering via existing `UiErrorAlert` and `NormalizedUiError` contract. |
| P2-T1 | Testing | Adds explicit unit regression coverage for mirrored success output. |
| P2-T2 | Testing, Validation/Error Handling | Adds explicit unit regression coverage for mirrored error output and details-toggle parity. |
| P2-T3 | Testing | Adds user-visible E2E confirmation of mirrored success panel behavior. |
| P3-T1 | Security, Validation/Error Handling | Verifies sanitization/trust boundaries and no unsafe rendering introduction. |
| P3-T2 | Accessibility, Data | Verifies preserved alert/disclosure/heading semantics with mirrored layout. |
| P3-T3 | Testing | Runs final compile/test/lint quality gates. |

---

**Next step:** `.github/prompts/prompt-5-implement-from-plan.md` — pass this `implementation-plan.md` to begin implementation.

---

## Run History

> **Prompt 6 run — 2026-04-24:** No unresolved discrepancies found. Workflow complete.
