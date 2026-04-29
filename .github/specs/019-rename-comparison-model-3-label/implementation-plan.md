# Implementation Plan

## Phase 1 — Update the third dropdown label and targeted UI naming

### Objective
Apply the user-visible label change for the third comparison-model dropdown and align directly related UI identifiers without altering behavior, state flow, or public contracts.

### Tasks
- [x] Identify the third dropdown render path
  - `Task ID: P1-T1`
  - `Description: Locate the component, template, and any supporting composables or constants that render or name the dropdown currently labeled Model for comparing outputs.`
  - `Dependencies: None`
  - `Validation command: rg -n "Model for comparing outputs|comparing outputs|comparison model" app tests`
  - `Expected result: Search results identify the UI source of the current label and any directly related identifier names to update.`
- [x] Replace the visible label text
  - `Task ID: P1-T2`
  - `Description: Update the third dropdown’s rendered label text to Model 3 for comparing responses in the responsible UI component or template.`
  - `Dependencies: P1-T1`
  - `Validation command: rg -n "Model 3 for comparing responses|Model for comparing outputs" app`
  - `Expected result: The new label text is present in the intended UI source, and the old label text is removed from active comparison UI files.`
- [x] Align programmatic labeling with visible text
  - `Task ID: P1-T3`
  - `Description: Update any `label`, `aria-label`, `aria-labelledby`, or equivalent naming mechanism associated with the third dropdown so the accessible name matches or includes the new visible label.`
  - `Dependencies: P1-T2`
  - `Validation command: rg -n "aria-label|aria-labelledby|Model 3 for comparing responses|Model for comparing outputs" app`
  - `Expected result: The third dropdown’s programmatic naming reflects the updated visible label without conflicting terminology.`
- [x] Rename only targeted internal identifiers
  - `Task ID: P1-T4`
  - `Description: Update variable names, computed names, helper names, and selector identifiers only where they specifically model the third dropdown and the old terminology reduces clarity.`
  - `Dependencies: P1-T1`
  - `Validation command: npm run typecheck`
  - `Expected result: The targeted naming cleanup compiles successfully and does not introduce behavior changes or unrelated renames.`

### Validation
- Confirm the new label text appears only for the intended third dropdown.
- Confirm accessible labeling remains aligned with visible text.
- Confirm no server, API, or unrelated UI files are changed for this phase.

### Exit Criteria
Done when the third dropdown UI shows `Model 3 for comparing responses`, any associated accessible label uses the same terminology, and targeted internal naming updates pass type checking without behavioral changes.

## Phase 2 — Update automated tests and verify behavior parity

### Objective
Adjust existing automated coverage to the renamed dropdown label and verify that the update preserves third-selector behavior, accessibility-oriented discovery, and comparison flow.

### Tasks
- [x] Update unit or component-level UI assertions
  - `Task ID: P2-T1`
  - `Description: Update any component or unit tests that assert the third dropdown label or query the control by its previous accessible name.`
  - `Dependencies: P1-T2, P1-T3, P1-T4`
  - `Validation command: npm test -- --runInBand tests/unit`
  - `Expected result: Relevant unit/component tests pass using the updated label terminology.`
- [x] Update integration-level queries for the renamed control
  - `Task ID: P2-T2`
  - `Description: Update integration tests that locate the third dropdown by label text, role/name, or helper selectors so they use the renamed control wording while preserving existing behavior assertions.`
  - `Dependencies: P1-T2, P1-T3, P1-T4`
  - `Validation command: npm test -- --runInBand tests/integration`
  - `Expected result: Relevant integration tests pass and continue to verify third-dropdown behavior rather than implementation details.`
- [x] Update end-to-end coverage for accessible discovery
  - `Task ID: P2-T3`
  - `Description: Update any Playwright or end-to-end tests that identify the third dropdown by visible label or accessible name to use Model 3 for comparing responses.`
  - `Dependencies: P1-T2, P1-T3, P1-T4`
  - `Validation command: npm run test:e2e`
  - `Expected result: End-to-end flows pass with the renamed dropdown and unchanged comparison behavior.`
- [x] Run targeted regression checks across the updated scope
  - `Task ID: P2-T4`
  - `Description: Run the most relevant verification commands to ensure the label rename, accessible naming, and targeted identifier updates did not change behavior or public contracts.`
  - `Dependencies: P2-T1, P2-T2, P2-T3`
  - `Validation command: npm run typecheck && npm test`
  - `Expected result: The updated codebase passes type checking and test coverage relevant to the renamed dropdown without new regressions in the targeted scope.`

### Validation
- Confirm tests query the third dropdown by updated visible/accessibility-facing terminology.
- Confirm existing behavior assertions remain intact for visibility, selection, and comparison flow.
- Confirm the old label text is not still referenced by active tests for the targeted control.

### Exit Criteria
Done when relevant unit, integration, and end-to-end tests use the updated dropdown label and pass while preserving the existing comparison experience.

### Completion Notes
- `2026-04-29`: Verified targeted unit coverage with `npm run test:unit -- tests/unit/models-selector.test.ts tests/unit/app.a11y.test.ts tests/unit/app.ui.test.ts` after the rename.
- `2026-04-29`: Verified end-to-end coverage with `npx playwright test tests/e2e/app.spec.ts tests/e2e/accessibility.spec.ts tests/e2e/models-selector.spec.ts`.
- `2026-04-29`: Confirmed `tests/integration` had no label-based references to update for this control and passed `npm run test:integration`.
- `2026-04-29`: Completed broader regression gates with `npm run typecheck && npm test`.

## Risks and Mitigations

- **Risk:** A shared selector component may reuse label text in multiple contexts.
  - **Mitigation:** Limit replacements to the specific third comparison-model control identified in `P1-T1` and verify search results before finalizing changes.
- **Risk:** Accessible names could diverge from visible text after a partial rename.
  - **Mitigation:** Treat visible and programmatic labels as a paired update in `P1-T2` and `P1-T3`.
- **Risk:** Tests may rely on brittle literal strings across multiple layers.
  - **Mitigation:** Update targeted queries in each test layer and keep assertions behavior-focused rather than implementation-focused.

## Assumptions

- The final approved label remains exactly `Model 3 for comparing responses`.
- The third dropdown is already covered by at least one existing relevant test surface.
- No backend or contract updates are required to support the rename.

## Dependencies

- Existing comparison UI components and test suites remain available and runnable in the current workspace.
- The test commands used by the repository continue to cover the targeted UI surfaces.

## Traceability

| Phase / Task ID | Design Section | Notes |
| --------------- | -------------- | ----- |
| Phase 1 | Overview; Architecture; Interfaces; Accessibility | Covers the presentation-layer rename, accessible label alignment, and targeted internal naming updates for `FR-1`, `FR-2`, `TR-1`, `TR-2`, `AR-1`, and `AR-2`. |
| P1-T1 | Architecture; Interfaces | Identifies the exact UI render path and scoped naming surfaces before any changes. |
| P1-T2 | Interfaces | Implements the exact visible label replacement required by `FR-1`. |
| P1-T3 | Accessibility; Interfaces | Aligns programmatic labeling with visible text for `FR-2` and `AR-1`. |
| P1-T4 | Architecture; Data | Keeps internal renaming targeted and avoids state or contract changes for `TR-1` and `TR-4`. |
| Phase 2 | Testing; Validation/Error Handling; Accessibility | Updates automated coverage and verifies behavior parity for `FR-3`, `FR-4`, `TR-3`, and `AR-3`. |
| P2-T1 | Testing | Covers component/unit assertions tied to the renamed dropdown label. |
| P2-T2 | Testing; Interfaces | Updates integration-level queries while preserving behavior-focused assertions. |
| P2-T3 | Testing; Accessibility | Ensures end-to-end tests discover the control using the updated accessible name. |
| P2-T4 | Testing; Data; Security | Verifies no broader regressions or contract changes were introduced by the scoped rename. |

## Run History

> **Prompt 6 run — 2026-04-29:** No unresolved discrepancies found. Workflow complete.