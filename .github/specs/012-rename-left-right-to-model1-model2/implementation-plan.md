# Implementation Plan: Rename Positional Naming to Model 1 / Model 2 Semantics

## Phase 1 — Baseline and Rename Map

### Objective
Create a complete, deterministic rename map for all relevant `left`/`right` identifiers in the dual-model flow and confirm baseline test health before refactoring.

### Tasks
- [x] Build dual-model rename inventory
  - Task ID: P1-T1
  - Description: Enumerate relevant positional identifiers across `app/`, `tests/`, and spec-referenced docs; define one-to-one `model1`/`model2` replacements for state symbols, selector IDs, helper APIs, and component contracts.
  - Dependencies: None
  - Validation command: `grep -RInE "selectedModelIdLeft|selectedModelIdRight|leftRequestState|rightRequestState|models-select-right|getLeftModelSelect|getRightModelSelect" app tests .github/specs/013-rename-left-right-to-model1-model2`
  - Expected result: A complete list of in-scope rename targets is captured and no ambiguous mappings remain.

- [x] Confirm baseline behavior before changes
  - Task ID: P1-T2
  - Description: Run core targeted tests to establish a known-good baseline before semantic refactor.
  - Dependencies: P1-T1
  - Validation command: `npm run test:unit -- tests/unit/models-selector.test.ts tests/unit/app.a11y.test.ts`
  - Expected result: Baseline targeted unit/a11y tests pass before refactor work begins.

### Validation
- Baseline targeted tests pass.
- Rename target list is explicit and consistent with design scope.

### Exit Criteria (Done when...)
- All in-scope rename targets are identified with a deterministic replacement.
- Baseline results are captured and green for targeted tests.

## Phase 2 — App and Component Semantic Refactor

### Objective
Apply `model1`/`model2` naming in production code for page-level symbols, component props/emits, and selector IDs while preserving behavior.

### Tasks
- [ ] Refactor page-level model flow symbols
  - Task ID: P2-T1
  - Description: Update `app/app.vue` state symbols, handler names, and contextual labels from positional names to semantic `model1`/`model2` names without altering request/response logic.
  - Dependencies: P1-T2
  - Validation command: `npm run typecheck`
  - Expected result: Type checking passes with updated page-level names and unchanged runtime semantics.

- [ ] Refactor `ModelsSelector` interface contracts
  - Task ID: P2-T2
  - Description: Rename `ModelsSelector` props/emits and local handlers to `model1`/`model2` terminology and update parent bindings to match.
  - Dependencies: P2-T1
  - Validation command: `npm run test:unit -- tests/unit/models-selector.test.ts`
  - Expected result: Component unit tests pass with renamed props/emits and unchanged UI behavior.

- [ ] Replace positional selector IDs with semantic IDs
  - Task ID: P2-T3
  - Description: Rename dual-model selector IDs (for example, `models-select`/`models-select-right`) to semantic role-based IDs and keep `label[for]` associations correct.
  - Dependencies: P2-T2
  - Validation command: `npm run test:a11y:unit`
  - Expected result: Accessibility-focused unit tests pass and label/control relationships remain valid.

### Validation
- Typecheck passes after production refactor.
- Model selector component tests and unit accessibility tests pass.
- No functional flow changes are introduced.

### Exit Criteria (Done when...)
- Production code uses semantic role-based naming for dual-model flow.
- Component interfaces and bindings are internally consistent and type-safe.
- Selector IDs and label mappings are accessibility-safe.

## Phase 3 — Test and Helper Migration

### Objective
Migrate test helpers/specs to semantic naming and selector contracts; ensure coverage remains behavior-focused.

### Tasks
- [ ] Update shared E2E selector helper APIs
  - Task ID: P3-T1
  - Description: Rename helper functions in `tests/e2e/helpers/selectors.ts` to semantic APIs and update exported locator IDs to new semantic selector IDs.
  - Dependencies: P2-T3
  - Validation command: `npm run test:e2e -- tests/e2e/models-selector.spec.ts`
  - Expected result: Selector-focused E2E spec passes using semantic helper names and IDs.

- [ ] Migrate E2E specs to semantic helper usage
  - Task ID: P3-T2
  - Description: Update relevant E2E specs (including app and accessibility coverage) to use semantic helper names, semantic IDs, and non-positional variable naming.
  - Dependencies: P3-T1
  - Validation command: `npm run test:e2e -- tests/e2e/app.spec.ts tests/e2e/accessibility.spec.ts`
  - Expected result: Targeted E2E behavior and accessibility flows pass with semantic naming.

- [ ] Migrate remaining unit/integration references
  - Task ID: P3-T3
  - Description: Update remaining unit/integration tests for renamed identifiers/selectors and verify no stale positional references remain in in-scope test paths.
  - Dependencies: P3-T2
  - Validation command: `npm run test:integration`
  - Expected result: Integration suite passes, confirming no regression in API-facing behavior and shared contracts.

### Validation
- Targeted E2E selector and flow tests pass.
- Accessibility E2E checks pass for affected screens.
- Integration tests remain green.

### Exit Criteria (Done when...)
- Test helpers and specs are fully aligned with semantic naming.
- No in-scope test relies on deprecated positional selector contracts.
- Integration behavior remains stable.

## Phase 4 — Regression, Security/A11y Confirmation, and Documentation Sync

### Objective
Run full validation, confirm no security/accessibility regressions, and synchronize documentation references impacted by naming updates.

### Tasks
- [ ] Run full regression suite
  - Task ID: P4-T1
  - Description: Execute broad project checks to confirm rename-only refactor did not alter functional behavior.
  - Dependencies: P3-T3
  - Validation command: `npm test && npm run test:e2e`
  - Expected result: Unit, integration, and full E2E suites pass.

- [ ] Verify security and error-handling invariants
  - Task ID: P4-T2
  - Description: Confirm input validation, request handling, and normalized error rendering/logging paths are behaviorally unchanged after renaming.
  - Dependencies: P4-T1
  - Validation command: `npm run test:unit -- tests/unit/error-normalization.test.ts tests/unit/prompt-validation.test.ts tests/integration/respond-route.test.ts`
  - Expected result: Security-relevant and error-handling tests pass with no behavior drift.

- [ ] Sync impacted documentation references
  - Task ID: P4-T3
  - Description: Update any docs/spec notes that reference renamed selectors/symbols and ensure workflow artifacts stay consistent with final naming.
  - Dependencies: P4-T2
  - Validation command: `npm run lint`
  - Expected result: Lint and formatting checks pass; docs/spec references are internally consistent.

### Validation
- Full tests and lint/type checks pass.
- Security and accessibility behavior remains equivalent.
- Documentation references are synchronized with implemented names.

### Exit Criteria (Done when...)
- Full regression is green.
- No unresolved positional naming remains in scope.
- Security, accessibility, and documentation expectations are satisfied.

## Risks and Mitigations
- **Risk:** Missed selector rename breaks tests unexpectedly.
  - **Mitigation:** Rename through shared helper first (`P3-T1`), then migrate call sites (`P3-T2`).
- **Risk:** Contract rename causes type drift across parent/child components.
  - **Mitigation:** Sequence component contract updates before test migration (`P2-T2` then `P3-*`) and enforce typecheck gates.
- **Risk:** Unintentional behavior change hidden in symbol refactor.
  - **Mitigation:** Baseline tests (`P1-T2`) and full regression (`P4-T1`) with targeted security/error tests (`P4-T2`).

## Dependencies
- Existing Nuxt/Vue project scripts and test harnesses are available (`npm`, Vitest, Playwright).
- Current baseline tests remain runnable in the branch before implementation begins.

## Traceability Matrix
| Phase / Task ID | Design Section | Notes |
| --------------- | -------------- | ----- |
| P1-T1 | Architecture; Interfaces; Testing | Builds explicit rename scope for symbols/selectors and helper APIs (FR-1, FR-2, TR-2). |
| P1-T2 | Testing | Captures pre-change baseline for regression confidence (TR-4). |
| P2-T1 | Architecture; Interfaces; Data | Renames page-level symbols while preserving data and state flow (FR-1, TR-1). |
| P2-T2 | Interfaces; Architecture | Migrates component props/emits and parent bindings (FR-3, TR-3). |
| P2-T3 | Interfaces; Accessibility | Applies semantic IDs with preserved label/control associations (FR-2, AR-1). |
| P3-T1 | Interfaces; Testing | Renames shared E2E helper contract to semantic APIs (FR-5, TR-2). |
| P3-T2 | Testing; Accessibility | Migrates E2E specs including accessibility paths (FR-5, AR-2, TR-4). |
| P3-T3 | Testing; Data | Validates integration stability after test and contract migration (TR-4). |
| P4-T1 | Testing | Executes full regression to confirm behavior-preserving refactor (TR-1, TR-4). |
| P4-T2 | Validation/Error Handling; Security | Confirms unchanged validation/error handling and OWASP-aligned safeguards (SR-1). |
| P4-T3 | Architecture; Testing | Synchronizes references in docs/artifacts and validates repo checks (TR-5). |
