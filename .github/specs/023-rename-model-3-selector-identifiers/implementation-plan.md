# Implementation Plan

## Phase 1 — Rename Model 3 DOM identifier in active UI

### Objective
Establish `model3-select` as the canonical DOM ID for the Model 3 dropdown in active component markup while preserving all current behavior.

### Tasks
- [x] Rename Model 3 dropdown ID in selector component markup
  - `Task ID: P1-T1`
  - `Description: Update the Model 3 dropdown element ID from `model-comparison-select` to `model3-select` in `app/components/ModelsSelector.vue`.`
  - `Dependencies: None`
  - `Validation command: npm run typecheck`
  - `Expected result: Active UI renders Model 3 dropdown with ID `model3-select` and no runtime/type errors.`

- [x] Keep Model 3 control semantics unchanged after ID rename
  - `Task ID: P1-T2`
  - `Description: Verify Model 3 label, enabled/disabled behavior, and binding semantics remain identical after ID rename.`
  - `Dependencies: P1-T1`
  - `Validation command: npm run test:unit -- tests/unit/models-selector.test.ts tests/unit/app.a11y.test.ts`
  - `Expected result: Existing Model 3 behavior remains unchanged except selector ID value.`

### Validation
- Confirm active markup exposes `#model3-select`.
- Confirm old `#model-comparison-select` ID is absent for the Model 3 dropdown.

### Exit Criteria
Done when UI uses canonical ID `model3-select` for Model 3 dropdown with no behavior regression.

## Phase 2 — Align app/test selector references to canonical Model 3 naming

### Objective
Update references tied specifically to Model 3 dropdown identity across test helpers and tests so all selector usage is consistent.

### Tasks
- [x] Update e2e selector helper(s) for Model 3 dropdown
  - `Task ID: P2-T1`
  - `Description: Update Model 3 selector helper targets in `tests/e2e/helpers/selectors.ts` to resolve to `#model3-select` and keep helper intent unchanged.`
  - `Dependencies: P1-T1`
  - `Validation command: npm run test:e2e -- tests/e2e/models-selector.spec.ts`
  - `Expected result: E2E helper queries the Model 3 dropdown via `#model3-select` successfully.`

- [x] Update direct unit/e2e selector references for Model 3 dropdown
  - `Task ID: P2-T2`
  - `Description: Replace direct references to `#model-comparison-select` for Model 3 dropdown identity in affected test files while preserving assertion intent.`
  - `Dependencies: P2-T1`
  - `Validation command: npm run test:unit -- tests/unit/models-selector.test.ts tests/unit/app.ui.test.ts tests/unit/app.a11y.test.ts`
  - `Expected result: Affected unit tests pass with updated selector naming and unchanged behavior assertions.`

- [x] Remove legacy Model 3 dropdown ID usage from test paths
  - `Task ID: P2-T3`
  - `Description: Ensure no remaining Model 3 dropdown selector dependency on `#model-comparison-select` exists in active test code paths.`
  - `Dependencies: P2-T2`
  - `Validation command: npm run test:e2e -- tests/e2e/models-selector.spec.ts tests/e2e/app.spec.ts tests/e2e/accessibility.spec.ts`
  - `Expected result: Targeted e2e suites pass and rely on canonical Model 3 selector identity.`

### Validation
- Confirm test helpers/selectors are deterministic and readable.
- Confirm existing assertion meaning is preserved.

### Exit Criteria
Done when Model 3 selector references in app/test surfaces consistently use canonical naming and targeted suites pass.

## Phase 3 — Regression verification and quality gates

### Objective
Prove rename-only scope and no-regression behavior with targeted checks plus repository quality gates.

### Tasks
- [x] Run targeted rename/regression suite
  - `Task ID: P3-T1`
  - `Description: Execute targeted unit/a11y/e2e commands validating selector rename and no behavioral changes.`
  - `Dependencies: P2-T3`
  - `Validation command: npm run test:unit -- tests/unit/models-selector.test.ts tests/unit/app.a11y.test.ts tests/unit/app.ui.test.ts && npm run test:e2e -- tests/e2e/models-selector.spec.ts tests/e2e/app.spec.ts tests/e2e/accessibility.spec.ts`
  - `Expected result: Targeted tests confirm Model 3 selector rename with unchanged runtime behavior.`

- [x] Run full repository quality gates
  - `Task ID: P3-T2`
  - `Description: Run full typecheck/test/lint verification to ensure integration safety.`
  - `Dependencies: P3-T1`
  - `Validation command: npm run typecheck && npm test && npm run lint`
  - `Expected result: All repository quality gates pass.`

### Validation
- Verify rename remained limited to Model 3 identity references.
- Verify no new request paths or API contract changes.

### Exit Criteria
Done when targeted and full verification pass with rename-only scope preserved.

## Risks and Mitigations

- **Risk:** Accidental rename of unrelated comparison semantics.
  - **Mitigation:** Restrict edits to references specifically identifying Model 3 dropdown control.
- **Risk:** Missed selector reference in tests causing partial failures.
  - **Mitigation:** Update shared selector helpers first, then direct references, then run targeted suites.
- **Risk:** Hidden regression in accessibility/test discoverability.
  - **Mitigation:** Include unit and e2e accessibility checks in targeted validation.

## Assumptions

- Current Model 3 behavior is correct and must remain unchanged.
- Backward compatibility for old selector ID is not required.

## Dependencies

- Existing component structure in `app/components/ModelsSelector.vue`.
- Existing unit/e2e harnesses and selector helper patterns.

## Traceability

| Phase / Task ID | Design Section | Notes |
| --------------- | -------------- | ----- |
| Phase 1 | Overview; Interfaces; Architecture | Establishes canonical DOM ID `model3-select` (`FR-1`, `TR-2`). |
| P1-T1 | Interfaces; Architecture | Performs selector ID rename in active UI markup. |
| P1-T2 | Validation/Error Handling; Accessibility | Verifies unchanged Model 3 semantics post-rename (`FR-4`, `AR-1`). |
| Phase 2 | Architecture; Interfaces; Testing | Aligns helper/test selector usage with canonical naming (`FR-2`, `FR-3`, `TR-2`, `AR-2`). |
| P2-T1 | Interfaces; Testing | Updates shared e2e selector helper to canonical ID. |
| P2-T2 | Testing; Validation/Error Handling | Updates direct unit/e2e references while preserving assertion intent. |
| P2-T3 | Testing | Removes legacy ID dependency from active test paths. |
| Phase 3 | Testing; Security; Performance | Confirms rename-only implementation and full gate pass (`TR-3`, `TR-4`, `SR-1`, `SR-2`, `PR-1`). |
| P3-T1 | Testing | Executes targeted regression validation. |
| P3-T2 | Testing | Executes full repository quality gates. |

## Prompt 6 Run History

- 2026-04-29: Completed discrepancy review for spec `023-rename-model-3-selector-identifiers`.
- Evidence summary:
  - Active code/test surfaces contain no `model-comparison-select` references under `app/**` and `tests/**`.
  - Canonical Model 3 selector identity is `#model3-select` in app and tests.
- Validation executed:
  - `npm run test:unit -- tests/unit/models-selector.test.ts tests/unit/app.a11y.test.ts tests/unit/app.ui.test.ts` ✅
  - `npm run test:e2e -- tests/e2e/models-selector.spec.ts tests/e2e/app.spec.ts tests/e2e/accessibility.spec.ts` ✅
  - `npm run test:e2e -- tests/e2e/accessibility.spec.ts` ✅ (rerun after transient browser crash)
  - `npm run typecheck && npm test && npm run lint` ✅
- Discrepancy review: No unresolved design/plan discrepancies found for this rename-only scope.
