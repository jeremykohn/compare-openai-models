# Implementation Plan: Prevent Overflow in Output Areas

**Source design:** `.github/specs/013-prevent-overflow-in-output-areas/design.md`
**Output artifact:** `.github/specs/013-prevent-overflow-in-output-areas/implementation-plan.md`

## Phase 1 — Harden Outer Output Panel Wrapping and Containment

### Objective
Update the outer output panel component so headings, loading text, and response text wrap safely within panel bounds, remain width-constrained by layout, and grow vertically with content.

### Tasks

- [x] Add overflow-safe panel container behavior in `ModelOutputPanel`
  - Task ID: P1-T1
  - Description: Update the outer `<article>` container in `app/components/ModelOutputPanel.vue` so it can shrink within the parent grid, stay width-constrained, and grow vertically based on content.
  - Dependencies: None
  - Validation command: `npm run test:unit -- tests/unit/app.ui.test.ts`
  - Expected result: Output panels render normally and remain layout-constrained without introducing regressions.

- [x] Apply heading wrapping behavior for long panel titles
  - Task ID: P1-T2
  - Description: Add wrapping/min-width-safe styles to the panel heading element so long headings remain visible within panel bounds and do not force horizontal growth.
  - Dependencies: P1-T1
  - Validation command: `npm run test:unit -- tests/unit/app.ui.test.ts tests/unit/app.a11y.test.ts`
  - Expected result: Long headings wrap within the panel and accessibility semantics remain unchanged.

- [x] Apply response-text wrapping behavior for long content
  - Task ID: P1-T3
  - Description: Update the success-state response text element in `app/components/ModelOutputPanel.vue` to preserve whitespace while also wrapping long content and preventing horizontal overflow.
  - Dependencies: P1-T1
  - Validation command: `npm run test:unit -- tests/unit/app.ui.test.ts`
  - Expected result: Long response text stays inside the panel, wraps correctly, and panel height grows vertically as needed.

### Validation
- `npm run test:unit -- tests/unit/app.ui.test.ts`
- `npm run test:unit -- tests/unit/app.a11y.test.ts`

### Exit Criteria (Done when...)
- Outer output panels remain width-constrained by layout.
- Long headings and response text wrap inside panel bounds.
- Panels grow vertically rather than horizontally when content is long.

---

## Phase 2 — Contain Nested Error Alert and Expanded Details Content

### Objective
Update the nested error alert so the message, toggle, and structured error details remain fully contained within the parent output panel and wrap correctly at long lengths.

### Tasks

- [x] Add containment behavior to `UiErrorAlert` outer container
  - Task ID: P2-T1
  - Description: Update `app/components/UiErrorAlert.vue` so the alert container can shrink within the outer panel, does not overflow horizontally, and expands vertically with content.
  - Dependencies: None
  - Validation command: `npm run test:unit -- tests/unit/app.ui.test.ts`
  - Expected result: Error alert remains visually contained inside the outer panel even with long content.

- [x] Ensure summary/toggle text wraps safely
  - Task ID: P2-T2
  - Description: Update the `<summary>` presentation so long toggle text stays readable and contained without horizontal overflow.
  - Dependencies: P2-T1
  - Validation command: `npm run test:a11y:unit`
  - Expected result: The details toggle remains keyboard operable and its text stays contained.

- [x] Wrap structured error detail labels and values inside metadata grid
  - Task ID: P2-T3
  - Description: Adjust the `dl` / `dt` / `dd` layout in `app/components/UiErrorAlert.vue` so long error metadata values wrap within the available width instead of stretching the alert or panel horizontally.
  - Dependencies: P2-T1
  - Validation command: `npm run test:unit -- tests/unit/app.ui.test.ts tests/unit/app.a11y.test.ts`
  - Expected result: Long `error.message`, `error.type`, `error.code`, `error.param`, and `error.details` remain readable and contained after expansion.

### Validation
- `npm run test:unit -- tests/unit/app.ui.test.ts tests/unit/app.a11y.test.ts`

### Exit Criteria (Done when...)
- Nested error alert stays inside the outer panel.
- Expanded error details remain contained and readable.
- No accessibility regression is introduced for `<details>` / `<summary>` behavior.

---

## Phase 3 — Confirm Parent Layout Supports Independent Vertical Sizing

### Objective
Ensure the parent output grid allows each output panel to keep its own content-driven height without equal-height forcing or new horizontal overflow.

### Tasks

- [x] Verify and adjust parent output grid only if needed
  - Task ID: P3-T1
  - Description: Review `app/app.vue` output region classes and make only minimal containment-support updates if the parent grid or section layout reintroduces overflow or prevents correct shrinking behavior.
  - Dependencies: P1-T3, P2-T3
  - Validation command: `npm run test:unit -- tests/unit/app.ui.test.ts`
  - Expected result: Left and right panels can differ in height naturally and no parent layout rule forces horizontal expansion.

- [x] Preserve loading/success/error branch behavior while refining layout
  - Task ID: P3-T2
  - Description: Confirm that layout-focused changes do not alter status rendering branches, per-panel ownership, or error handling behavior.
  - Dependencies: P3-T1
  - Validation command: `npm run test:unit -- tests/unit/app.ui.test.ts`
  - Expected result: Existing dual-output behavior remains functionally unchanged.

### Validation
- `npm run test:unit -- tests/unit/app.ui.test.ts`

### Exit Criteria (Done when...)
- Parent layout supports independent panel heights.
- No change is introduced to dual-output request/response/error semantics.

---

## Phase 4 — Add Long-Content Regression Coverage

### Objective
Add targeted automated coverage proving long headings, long response text, and long error details stay visible and contained.

### Tasks

- [x] Add unit tests for long output and error content cases
  - Task ID: P4-T1
  - Description: Extend `tests/unit/app.ui.test.ts` with long-content fixtures for headings, response text, and expanded error details, asserting the updated overflow-safe class behavior and branch rendering.
  - Dependencies: P1-T3, P2-T3
  - Validation command: `npm run test:unit -- tests/unit/app.ui.test.ts`
  - Expected result: Unit tests fail before overflow-safe changes and pass after them.

- [x] Update accessibility unit coverage if needed
  - Task ID: P4-T2
  - Description: Extend `tests/unit/app.a11y.test.ts` only where necessary to ensure no regression in alert/details semantics after long-content layout updates.
  - Dependencies: P2-T3
  - Validation command: `npm run test:a11y:unit`
  - Expected result: Accessibility unit coverage remains green with overflow-focused fixtures as needed.

- [x] Add or update E2E scenarios for long content
  - Task ID: P4-T3
  - Description: Update `tests/e2e/app.spec.ts` and `tests/e2e/accessibility.spec.ts` as needed with long response/error fixtures that verify content remains visible, details can expand, and output stays in the expected panel.
  - Dependencies: P4-T1, P4-T2
  - Validation command: `npm run test:e2e -- tests/e2e/app.spec.ts && npm run test:e2e -- tests/e2e/accessibility.spec.ts`
  - Expected result: Browser-level checks confirm overflow-safe behavior under long-content conditions.

### Validation
- `npm run test:unit -- tests/unit/app.ui.test.ts`
- `npm run test:a11y:unit`
- `npm run test:e2e -- tests/e2e/app.spec.ts`
- `npm run test:e2e -- tests/e2e/accessibility.spec.ts`

### Exit Criteria (Done when...)
- Long-content regression coverage exists for output and error cases.
- Updated unit/E2E/a11y tests pass.

---

## Phase 5 — Final Verification and Quality Gates

### Objective
Run focused and full-project validation to confirm the overflow-prevention update is stable, secure, and accessible.

### Tasks

- [x] Run focused overflow-related regression checks
  - Task ID: P5-T1
  - Description: Execute the targeted unit, a11y, and E2E commands for all affected surfaces after implementation is complete.
  - Dependencies: P4-T3
  - Validation command: `npm run test:unit -- tests/unit/app.ui.test.ts tests/unit/app.a11y.test.ts && npm run test:e2e -- tests/e2e/app.spec.ts tests/e2e/accessibility.spec.ts`
  - Expected result: All focused suites pass and confirm no overflow-related regressions remain.

- [ ] Run repository quality gates
  - Task ID: P5-T2
  - Description: Execute the full project checks required by the spec.
  - Dependencies: P5-T1
  - Validation command: `npm run typecheck && npm test && npm run lint`
  - Expected result: Typecheck, full tests, and lint all pass.

### Validation
- `npm run typecheck && npm test && npm run lint`

### Exit Criteria (Done when...)
- Focused overflow-related checks pass.
- Full repository quality gates pass.
- The change remains styling/layout-scoped with no functional regressions.

---

## Risks, Assumptions, and Dependencies

- **Risk:** A wrapping fix applied too broadly could affect readability or spacing in short-content states.
  - **Mitigation:** Apply utility classes narrowly to output-specific containers/text nodes and validate with existing tests.
- **Risk:** Nested metadata grid changes could unintentionally affect `<details>` readability or semantics.
  - **Mitigation:** Preserve markup structure and validate with unit + a11y tests.
- **Risk:** Parent grid behavior may mask component-level fixes.
  - **Mitigation:** Review `app/app.vue` only after component-level updates and keep parent changes minimal.
- **Assumption:** Current `ModelOutputPanel.vue` and `UiErrorAlert.vue` remain the correct implementation surfaces.
- **Dependency:** Existing test harnesses (Vitest, Playwright, accessibility tests) remain available and green for baseline flows.

---

## Traceability

| Phase / Task ID | Design Section | Notes |
| --------------- | -------------- | ----- |
| P1-T1 | Architecture; Interfaces; CSS / Layout Interface | Hardens outer panel containment and width-constrained behavior. |
| P1-T2 | Interfaces; Accessibility | Applies long-heading wrapping while preserving heading semantics. |
| P1-T3 | Interfaces; Validation/Error Handling | Handles long response content with vertical growth instead of width growth. |
| P2-T1 | Architecture; Interfaces | Keeps nested alert container contained inside outer panel. |
| P2-T2 | Accessibility; Validation/Error Handling | Preserves operable, readable error-details toggle behavior. |
| P2-T3 | Validation/Error Handling; Security | Wraps structured error metadata safely without exposing new content. |
| P3-T1 | Architecture; Assumptions and Constraints | Confirms parent layout supports independent panel heights. |
| P3-T2 | Data; Validation/Error Handling; Security | Ensures layout changes do not alter functional branch behavior. |
| P4-T1 | Testing | Adds unit regression coverage for long content scenarios. |
| P4-T2 | Accessibility; Testing | Confirms no accessibility regression in error/details rendering. |
| P4-T3 | Testing; Accessibility | Adds browser-level verification for long content and containment. |
| P5-T1 | Testing | Runs focused regression suites across affected surfaces. |
| P5-T2 | Testing; Performance | Executes full quality gates required by the spec. |

---

**Next step:** `.github/prompts/prompt-5-implement-from-plan.md` — pass this `implementation-plan.md` to begin implementation.

## Run History

> **Prompt 6 run — 2026-04-27:** No unresolved discrepancies found. Workflow complete.
