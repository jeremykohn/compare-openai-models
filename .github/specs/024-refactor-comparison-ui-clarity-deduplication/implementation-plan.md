# Implementation Plan

## Phase 1 — Establish shared comparison UI render abstractions

### Objective
Extract duplicated comparison selector/output render structure into reusable, behavior-equivalent UI abstractions while keeping `app/app.vue` as orchestration owner.

### Tasks
- [x] Extract reusable comparison section wrapper/presenter for repeated panel layout
  - `Task ID: P1-T1`
  - `Description: Identify repeated selector/output panel layout blocks in `app/app.vue` and move them into a reusable component under `app/components/` with explicit typed props/events.`
  - `Dependencies: None`
  - `Validation command: npm run test:unit -- tests/unit/app.ui.test.ts`
  - `Expected result: Repeated comparison layout markup is centralized with no user-visible DOM semantics regression.`

- [x] Keep selector/output component public behavior contracts equivalent
  - `Task ID: P1-T2`
  - `Description: Ensure extracted component boundaries preserve existing labels, control states, loading/error/success/placeholder rendering behavior, and parent event wiring semantics.`
  - `Dependencies: P1-T1`
  - `Validation command: npm run test:unit -- tests/unit/models-selector.test.ts tests/unit/app.ui.test.ts`
  - `Expected result: Existing selectors and output panels behave identically after extraction.`

### Validation
- Confirm no net-new controls, flows, or UX changes are introduced.
- Confirm `app/app.vue` still owns top-level orchestration/query state.

### Exit Criteria
Done when duplicated comparison layout branches are consolidated into reusable component-level abstractions with behavior parity.

## Phase 2 — Centralize repeated UI-only branching/copy helpers

### Objective
Reduce duplicated internal branching logic and display-copy decisions via scoped, side-effect-constrained helper functions/composables.

### Tasks
- [x] Extract repeated comparison UI helper logic into UI-only utility/composable
  - `Task ID: P2-T1`
  - `Description: Move repeated, pure UI decision logic (state branch mapping/display helpers) from templates/script blocks into dedicated typed utility/composable modules used only by comparison UI.`
  - `Dependencies: P1-T2`
  - `Validation command: npm run test:unit -- tests/unit/app.ui.test.ts`
  - `Expected result: Internal branch helper logic is centralized and easier to maintain without behavioral changes.`

- [x] Preserve unchanged request and error-handling boundaries
  - `Task ID: P2-T2`
  - `Description: Verify extracted helpers do not alter request payload/response handling, sanitized error display behavior, or network call orchestration paths.`
  - `Dependencies: P2-T1`
  - `Validation command: npm run test:unit -- tests/unit/app.ui.test.ts tests/unit/app.a11y.test.ts`
  - `Expected result: Security/data contracts and visible error/loading semantics remain unchanged.`

### Validation
- Confirm no new shared mutable state is introduced.
- Confirm no new network calls, polling loops, or async side-channel behavior is added.

### Exit Criteria
Done when duplicated internal comparison UI branching logic is centralized and behavior remains equivalent.

## Phase 3 — Align tests for structure-preserving refactor and run regression gates

### Objective
Adjust tests only where structural selectors/paths require updates, preserve behavioral assertion intent, and verify full repository integration safety.

### Tasks
- [x] Update brittle structural references without weakening behavior assertions
  - `Task ID: P3-T1`
  - `Description: Update unit/e2e selectors only where extraction changes structure, keeping existing behavior expectations and accessibility intent intact.`
  - `Dependencies: P2-T2`
  - `Validation command: npm run test:unit -- tests/unit/models-selector.test.ts tests/unit/app.ui.test.ts tests/unit/app.a11y.test.ts`
  - `Expected result: Targeted unit and a11y tests continue validating existing behavior semantics.`

- [x] Run targeted e2e regression for comparison UI behavior
  - `Task ID: P3-T2`
  - `Description: Execute comparison-focused e2e coverage to verify unchanged user-visible flows and accessibility outcomes after refactor extraction.`
  - `Dependencies: P3-T1`
  - `Validation command: npm run test:e2e -- tests/e2e/models-selector.spec.ts tests/e2e/app.spec.ts tests/e2e/accessibility.spec.ts`
  - `Expected result: E2E behavior parity is validated for selector interactions and output state transitions.`

- [x] Run full repository quality gates
  - `Task ID: P3-T3`
  - `Description: Execute full integration checks for type safety, test suite integrity, and lint compliance.`
  - `Dependencies: P3-T2`
  - `Validation command: npm run typecheck && npm test && npm run lint`
  - `Expected result: All quality gates pass with no regression introduced by refactor.`

### Validation
- Confirm test updates are structural-only and do not relax assertion coverage.
- Confirm behavior invariants (loading/success/error/placeholder/comparison states) remain unchanged.

### Exit Criteria
Done when targeted and full validations pass with behavior-equivalent refactor scope preserved.

## Risks and Mitigations

- **Risk:** Subtle render-state behavior changes during extraction.
  - **Mitigation:** Preserve branch parity first, then run targeted unit/e2e behavior checks before full gates.
- **Risk:** Accessibility regressions from changed DOM nesting.
  - **Mitigation:** Preserve label/role/value semantics and run existing a11y unit/e2e suites.
- **Risk:** Scope creep into non-comparison surfaces.
  - **Mitigation:** Limit edits to `app/app.vue`, related comparison components, and UI-only helper modules.

## Assumptions

- Current comparison UI behavior is canonical and must remain unchanged.
- Existing tests provide sufficient behavior baseline for safe internal refactor.
- Internal symbols/files can be reorganized when public behavior contracts remain equivalent.

## Dependencies

- Existing comparison UI structure in `app/app.vue` and `app/components/`.
- Existing unit/e2e/a11y tests under `tests/unit/` and `tests/e2e/`.

## Traceability

| Phase / Task ID | Requirement(s) | Design Section | Notes |
| --------------- | -------------- | -------------- | ----- |
| Phase 1 | FR-1, FR-2, TR-2 | Architecture; Interfaces | Consolidates repeated selector/output structure into reusable component boundaries. |
| P1-T1 | FR-1, TR-1, TR-2 | Target Structural Shape; Proposed Refactor Boundaries | Extracts repeated layout paths within comparison-UI-only scope. |
| P1-T2 | FR-2, FR-3, AR-1 | Interfaces; Validation and Error Handling; Accessibility | Preserves labels, panel states, and event behavior equivalence. |
| Phase 2 | FR-1, FR-4, TR-2, SR-2, PR-1 | Architecture; Data; Security; Performance | Centralizes duplicated helper logic without changing contracts/overhead. |
| P2-T1 | FR-1, TR-2 | Target Structural Shape; Composable/Utility Contracts | Extracts pure/minimally stateful UI decision helpers. |
| P2-T2 | FR-4, SR-1, SR-2, PR-1 | Validation and Error Handling; Security; Performance | Confirms unchanged payload/response boundaries and sanitized error behavior. |
| Phase 3 | TR-3, TR-4, AR-2 | Testing | Preserves behavior coverage and validates integration safety. |
| P3-T1 | TR-3, AR-2 | Test Strategy; Accessibility | Updates only structural references while keeping assertion intent. |
| P3-T2 | TR-3, AR-1, AR-2 | Test Strategy; Accessibility | Verifies behavior and accessibility parity in e2e flows. |
| P3-T3 | TR-4 | Full Quality Gates | Confirms repo-wide quality compliance post-refactor. |

## Run History

> **Prompt 6 run — 2026-04-29:** No unresolved discrepancies found. Workflow complete.
