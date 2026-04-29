# Implementation Plan

## Phase 1 — Update third-panel copy in UI rendering

### Objective
Apply the required heading/message copy changes in the third output panel while preserving all existing branch logic and descriptor assembly behavior.

### Tasks
- [x] Locate third-panel heading and error message render paths
  - `Task ID: P1-T1`
  - `Description: Identify the exact non-error heading, error heading/message rendering locations, and computed message composition used by the third output panel in the app UI.`
  - `Dependencies: None`
  - `Validation command: rg -n "Comparison between responses of Models 1 and 2|Cannot compare model outputs due to errors when querying|comparison-output" app/app.vue tests`
  - `Expected result: The concrete render/computed surfaces to update are identified without ambiguity.`
- [x] Update error-state heading and message prefix copy
  - `Task ID: P1-T2`
  - `Description: In the third panel error branch, render heading ` + "`Error: Cannot produce comparison`" + ` and update error message prefix to ` + "`Unable to compare model outputs due to errors when querying `" + ` while preserving existing descriptor assembly.`
  - `Dependencies: P1-T1`
  - `Validation command: npm run typecheck`
  - `Expected result: Updated error heading/message compile successfully and continue using existing descriptor content.`
- [x] Update non-error comparison heading copy
  - `Task ID: P1-T3`
  - `Description: Replace the non-error third-panel heading text with ` + "`Comparison of responses from Model 1 and Model 2`" + `.`
  - `Dependencies: P1-T1`
  - `Validation command: npm run typecheck`
  - `Expected result: The non-error heading text is updated and compilation remains green.`

### Validation
- Confirm old strings are removed from active third-panel render paths.
- Confirm descriptor composition logic is unchanged apart from new message prefix.
- Confirm no unrelated app behavior branches were modified.

### Exit Criteria
Done when third-panel error/non-error copy matches requested exact strings and typecheck passes with no behavioral branch changes.

## Phase 2 — Update tests and verify parity

### Objective
Update relevant unit/e2e assertions to the new copy and verify the third-panel behavior remains unchanged apart from text.

### Tasks
- [x] Update unit test assertions for third-panel copy
  - `Task ID: P2-T1`
  - `Description: Update unit/UI tests that assert third-panel error/non-error heading/message strings to match the new copy.`
  - `Dependencies: P1-T2, P1-T3`
  - `Validation command: npm run test:unit -- tests/unit/app.ui.test.ts tests/unit/app.a11y.test.ts`
  - `Expected result: Targeted unit tests pass with updated copy assertions.`
- [x] Update e2e assertions for third-panel copy
  - `Task ID: P2-T2`
  - `Description: Update Playwright tests that assert third-panel non-error heading and error message/heading copy to match new strings.`
  - `Dependencies: P1-T2, P1-T3`
  - `Validation command: npx playwright test tests/e2e/app.spec.ts tests/e2e/accessibility.spec.ts`
  - `Expected result: Targeted e2e tests pass with updated third-panel copy expectations.`
- [x] Run targeted regression checks across updated scope
  - `Task ID: P2-T3`
  - `Description: Run typecheck and repository test suites required by current scope to confirm no regressions from this copy update.`
  - `Dependencies: P2-T1, P2-T2`
  - `Validation command: npm run typecheck && npm test`
  - `Expected result: Typecheck and tests pass for updated copy behavior without unrelated regressions introduced by this change.`

### Validation
- Confirm tests validate new copy in both error and non-error panel states.
- Confirm previous behavior assertions (state gating, descriptor content) remain intact.
- Confirm old copy strings are no longer expected by active tests for this panel.

### Exit Criteria
Done when relevant unit/e2e assertions use updated copy and all targeted regression checks pass.

## Risks and Mitigations

- **Risk:** Missing one render branch for third-panel heading/message copy.
  - **Mitigation:** Locate all references first (`P1-T1`) and verify with string search after updates.
- **Risk:** Accidentally changing descriptor list logic while updating error message copy.
  - **Mitigation:** Restrict edits to literal message prefix and preserve existing descriptor assembly code path.
- **Risk:** Tests may assert old string literals across multiple files.
  - **Mitigation:** Update targeted test files and verify by searching for old literals in active panel tests.

## Assumptions

- Existing tests already cover the relevant third-panel branches.
- Requested string literals are exact and final.

## Dependencies

- Existing app comparison panel branch structure and test harness remain intact.
- Local test commands continue to run in current workspace.

## Traceability

| Phase / Task ID | Design Section | Notes |
| --------------- | -------------- | ----- |
| Phase 1 | Architecture; Interfaces; Data; Validation/Error Handling | Implements scoped third-panel copy updates while preserving behavior for `FR-1`, `FR-2`, `FR-3`, `FR-4`, `TR-2`. |
| P1-T1 | Architecture; Interfaces | Identifies exact third-panel update points before changes. |
| P1-T2 | Interfaces; Data; Validation/Error Handling | Updates error heading/message prefix without changing descriptor logic (`FR-1`, `FR-2`, `TR-2`, `AR-1`). |
| P1-T3 | Interfaces; Accessibility | Updates non-error heading copy (`FR-3`, `AR-2`). |
| Phase 2 | Testing; Accessibility; Security | Updates validation surfaces and confirms no contract/security impact (`TR-1`, `TR-3`, `TR-4`, `AR-3`). |
| P2-T1 | Testing | Aligns unit/a11y copy assertions to new text. |
| P2-T2 | Testing; Accessibility | Aligns e2e assertions with user-visible/a11y-facing copy. |
| P2-T3 | Testing; Security | Runs regression/type checks to confirm safe, scoped change. |

## Run History

> **Prompt 6 run — 2026-04-29:** No unresolved discrepancies found. Workflow complete.
