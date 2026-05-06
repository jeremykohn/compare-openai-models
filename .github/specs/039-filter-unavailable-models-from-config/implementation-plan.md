# Implementation Plan: Filter Dropdown Models by `unavailable-models`

**Source Design:** `.github/specs/039-filter-unavailable-models-from-config/design.md`

**Date:** 2026-05-06

## Phase 1: Update Config Contract and Loader Semantics

### Objective
Refactor config loader to accept only `"unavailable-models"` as the filtering key, preserve graceful fallback behavior, and add required warning/error logs.

### Tasks
- [x] Refactor config type to single-key schema in loader
  - Task ID: P1-T1
  - Description: Replace legacy `OpenAIModelsConfig` structure with `{ "unavailable-models": string[] }` and adjust associated typings.
  - Dependencies: None
  - Validation command: `npm run typecheck`
  - Expected result: Type checks pass with updated config types.

- [x] Implement key-focused validation and root-object checks
  - Task ID: P1-T2
  - Description: Ensure parsed JSON is a non-null object (not array), validate only `"unavailable-models"` as `string[]`, and return invalid result for missing/malformed key.
  - Dependencies: P1-T1
  - Validation command: `npm run test -- tests/unit/openai-models-config.test.ts`
  - Expected result: Loader behaves deterministically for valid, missing-key, malformed-key, and non-object JSON.

- [x] Add warning/error logging behavior in loader
  - Task ID: P1-T3
  - Description: Emit `console.warn` when extra keys are present (listing key names and allowed-key guidance), and emit `console.error` when `"unavailable-models"` is missing/invalid while returning fallback result.
  - Dependencies: P1-T2
  - Validation command: `npm run test -- tests/unit/openai-models-config.test.ts`
  - Expected result: Tests assert logs are emitted with expected contextual content and no thrown errors.

- [x] Update exclusion set builder
  - Task ID: P1-T4
  - Description: Modify `buildExclusionSet` to derive values only from `"unavailable-models"`.
  - Dependencies: P1-T1
  - Validation command: `npm run test -- tests/unit/openai-models-config.test.ts`
  - Expected result: Exclusion set contains only unavailable IDs with deduplication by set semantics.

### Validation
- Run unit tests for loader logic and logging paths.
- Verify no config-loader exceptions are thrown for malformed input scenarios.

### Exit Criteria
Done when config loader and exclusion-set logic match single-key contract and required logging behavior.

## Phase 2: Align API Route Metadata and Filtering Flow

### Objective
Ensure `/api/models` applies new loader semantics while preserving response shape and fallback behavior.

### Tasks
- [x] Align models route filtering decision with new config validity rules
  - Task ID: P2-T1
  - Description: Keep filtering only when loader returns valid `"unavailable-models"`; otherwise pass through upstream models.
  - Dependencies: P1-T2, P1-T4
  - Validation command: `npm run test -- tests/integration/models.test.ts`
  - Expected result: Route returns filtered models only in valid-key scenario.

- [x] Preserve response metadata semantics
  - Task ID: P2-T2
  - Description: Keep `usedConfigFilter` and `showFallbackNote` semantics consistent with requirements and existing response contract.
  - Dependencies: P2-T1
  - Validation command: `npm run test -- tests/integration/models.test.ts`
  - Expected result: Metadata values correctly reflect filtering/fallback scenarios.

- [x] Keep error handling and cache behavior unchanged
  - Task ID: P2-T3
  - Description: Ensure route-level error handling, upstream error mapping, and cache behavior are unaffected by config semantic changes.
  - Dependencies: P2-T1
  - Validation command: `npm run test -- tests/integration/models.test.ts`
  - Expected result: Existing non-config route behaviors remain stable.

### Validation
- Run integration suite for `/api/models`.
- Confirm unchanged response envelope and stable handling of upstream failures.

### Exit Criteria
Done when route behavior reflects new config key semantics with no regressions to core route contract.

## Phase 3: Update and Expand Automated Test Coverage

### Objective
Add and adjust tests to verify new key contract, fallback logic, and logging requirements.

### Tasks
- [x] Update unit tests for loader schema migration
  - Task ID: P3-T1
  - Description: Replace legacy-key expectations with `"unavailable-models"` expectations, including missing file, invalid JSON, non-object, missing key, and malformed key cases.
  - Dependencies: P1-T2
  - Validation command: `npm run test -- tests/unit/openai-models-config.test.ts`
  - Expected result: Unit suite validates all supported config states.

- [x] Add unit assertions for extra-key warning and missing-key error logs
  - Task ID: P3-T2
  - Description: Spy on `console.warn`/`console.error` to assert required logging messages and listed key names.
  - Dependencies: P1-T3
  - Validation command: `npm run test -- tests/unit/openai-models-config.test.ts`
  - Expected result: Logging assertions pass and verify non-disruptive behavior.

- [x] Update integration tests for `/api/models` metadata and filtering
  - Task ID: P3-T3
  - Description: Adapt fixture config payloads and assertions to new key semantics for valid filtering, missing file fallback, missing-key fallback, and extra-key handling.
  - Dependencies: P2-T2
  - Validation command: `npm run test -- tests/integration/models.test.ts`
  - Expected result: Integration tests pass with updated semantics.

- [x] Validate UI notice behavior contract through existing e2e coverage
  - Task ID: P3-T4
  - Description: Ensure tests that assert fallback note visibility still align with `showFallbackNote`-driven behavior.
  - Dependencies: P2-T2
  - Validation command: `npm run test:e2e -- tests/e2e/models-selector.spec.ts`
  - Expected result: Notice visibility scenarios pass without UI regressions.

### Validation
- Run targeted unit, integration, and e2e tests.
- Confirm logs are asserted in test scope and not ignored.

### Exit Criteria
Done when automated coverage confirms filtering, fallback metadata, and logging behavior under all required scenarios.

## Phase 4: Update Config Fixture and Final Quality Validation

### Objective
Align repository config fixture with the new schema and verify full quality gates.

### Tasks
- [x] Update `server/assets/models/openai-models.json` to the new key schema
  - Task ID: P4-T1
  - Description: Replace legacy filtering keys with `"unavailable-models"`, preserving intended exclusion IDs.
  - Dependencies: P1-T1
  - Validation command: `npm run test -- tests/integration/models.test.ts`
  - Expected result: Integration tests pass using schema-aligned fixture.

- [x] Review docs for behavioral contract alignment
  - Task ID: P4-T2
  - Description: Update any relevant docs referencing old key semantics or fallback-note conditions.
  - Dependencies: P2-T2
  - Validation command: `npm run test`
  - Expected result: Documentation reflects current key contract and behavior.

- [x] Run final quality gate
  - Task ID: P4-T3
  - Description: Execute typecheck, lint, and all tests to verify readiness.
  - Dependencies: P3-T1, P3-T2, P3-T3, P3-T4, P4-T1
  - Validation command: `npm run lint && npm run test && npm run test:e2e`
  - Expected result: Full suite passes with no new regressions.

### Validation
- Confirm no legacy filtering key usage remains in active path.
- Confirm fallback note appears only in fallback scenarios.

### Exit Criteria
Done when code, tests, fixture config, and docs are aligned with the `"unavailable-models"` contract and quality gates pass.

## Risks, Assumptions, and Dependencies

### Risks
- Existing tests may implicitly depend on legacy keys and require broad fixture updates.
- Logging assertion brittleness may occur if message text is overly rigid.
- Fixture/schema updates could affect unrelated tests that reuse config assumptions.

### Assumptions
- Existing route and UI metadata plumbing (`showFallbackNote`) remains valid and does not require structural changes.
- Server-side console logging is acceptable for this scope.

### Dependencies
- Existing Vitest integration harness and route mocking utilities.
- Existing e2e API mocking helpers for notice behavior.

## Traceability
| Phase / Task ID | Design Section | Notes |
| --------------- | -------------- | ----- |
| P1-T1 | Interfaces | Migrates loader contract to `"unavailable-models"` schema. |
| P1-T2 | Validation/Error Handling, Data | Adds object/key/type validation and fallback decision logic. |
| P1-T3 | Validation/Error Handling, Security | Implements warning/error logging rules without execution interruption. |
| P1-T4 | Interfaces, Data | Restricts exclusion-set construction to single key source. |
| P2-T1 | Architecture, Validation/Error Handling | Aligns route filtering with new loader validity semantics. |
| P2-T2 | Interfaces | Preserves metadata semantics for `usedConfigFilter`/`showFallbackNote`. |
| P2-T3 | Architecture, Security | Prevents regression in route error and cache behaviors. |
| P3-T1 | Testing | Updates unit tests for all new schema/fallback permutations. |
| P3-T2 | Testing, Security | Verifies warning/error logging behavior and message content. |
| P3-T3 | Testing, Interfaces | Confirms route-level metadata and filtering outcomes. |
| P3-T4 | Testing, Accessibility | Verifies fallback note visibility behavior in UI flows. |
| P4-T1 | Data | Aligns repository config fixture to new contract. |
| P4-T2 | Overview, Interfaces | Keeps docs aligned with behavior and response semantics. |
| P4-T3 | Testing | Full quality gate for release readiness. |

## Remediation Phase 5: Close Prompt 6 Discrepancies

### Objective
Resolve open discrepancies from Prompt 6 by adding missing E2E negative-assertion coverage and completing full quality-gate validation evidence.

### Tasks
- [x] Add explicit E2E assertion for fallback-note absence in non-fallback mode
  - Task ID: P5-T1
  - Description: Update `tests/e2e/models-selector.spec.ts` to assert the fallback note is not visible when mocked `/api/models` returns `showFallbackNote: false`.
  - Dependencies: None
  - Validation command: `npm run test:e2e -- tests/e2e/models-selector.spec.ts`
  - Expected result: E2E suite passes and covers both note-visible and note-hidden states.

- [x] Complete full quality gate for spec 039 changes
  - Task ID: P5-T2
  - Description: Run lint, unit/integration tests, and E2E tests for the full change set and capture successful execution evidence.
  - Dependencies: P5-T1
  - Validation command: `npm run lint && npm run test && npm run test:e2e`
  - Expected result: All quality gates pass with no regressions; remaining open validation tasks are closed.

### Validation
- Confirm discrepancy reports `DISC-1` and `DISC-2` have closure evidence.
- Confirm P3-T4 and P4-T3 are marked complete once evidence is produced.

### Exit Criteria
Done when E2E note-absence coverage exists and full quality-gate execution has passing evidence.

## Resolution Mapping
| Discrepancy ID | Planned Tasks | Validation |
| -------------- | ------------- | ---------- |
| DISC-1 | P5-T1 | `npm run test:e2e -- tests/e2e/models-selector.spec.ts` |
| DISC-2 | P5-T2 | `npm run lint && npm run test && npm run test:e2e` |

## Run History

> **Prompt 5 run — 2026-05-06:** No open tasks found. Forwarding to Prompt 6.
> **Prompt 6 run — 2026-05-06:** No unresolved discrepancies found. Workflow complete.
