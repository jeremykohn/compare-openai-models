# Implementation Plan

## Phase 1 — Establish canonical safe assembly contract

### Objective
Ensure the comparison prompt is always assembled from one canonical template through a centralized safe builder.

### Tasks
- [x] Add/confirm canonical comparison template source
  - `Task ID: P1-T1`
  - `Description: Ensure `server/assets/prompt-templates/prompt-comparison-template.md` is the single template source for this flow and that it clearly separates trusted instructions from placeholder insertion regions.`
  - `Dependencies: None`
  - `Validation command: npm run test:unit -- tests/unit/app.ui.test.ts`
  - `Expected result: Prompt-generation flow references one canonical template path with stable placeholder contract.`

- [x] Centralize interpolation in one safe builder utility
  - `Task ID: P1-T2`
  - `Description: Implement/confirm a single pure utility (e.g., `buildSafeComparisonPrompt`) in `app/utils/prompt-template-safety.ts` that performs placeholder replacement for untrusted fields only.`
  - `Dependencies: P1-T1`
  - `Validation command: npm run test:unit -- tests/unit/prompt-template-safety.test.ts`
  - `Expected result: All untrusted insertion is routed through one deterministic utility function.`

- [x] Integrate safe builder into comparison UI state path
  - `Task ID: P1-T3`
  - `Description: Wire `app/composables/use-comparison-ui-state.ts` so both prompt-preview content and request payload use the same safeguarded generated prompt output.`
  - `Dependencies: P1-T2`
  - `Validation command: npm run test:unit -- tests/unit/app.ui.test.ts`
  - `Expected result: No preview/request mismatch; ad-hoc interpolation paths removed from comparison flow.`

### Exit Criteria
Done when prompt generation and consumption paths consistently use canonical template + centralized safe builder.

## Phase 2 — Enforce comprehensive safeguards

### Objective
Implement deterministic hardening controls on untrusted input sections without changing intended content semantics.

### Tasks
- [x] Implement deterministic trusted/untrusted boundaries
  - `Task ID: P2-T1`
  - `Description: Wrap each untrusted field (original prompt, response 1, response 2) with unique deterministic sentinel start/end markers.`
  - `Dependencies: P1-T2`
  - `Validation command: npm run test:unit -- tests/unit/prompt-template-safety.test.ts`
  - `Expected result: Generated prompts always contain complete, correctly ordered marker pairs for each untrusted field.`

- [x] Apply normalization and fence-neutralization safeguards
  - `Task ID: P2-T2`
  - `Description: Enforce deterministic normalization (line endings, disallowed control-character stripping, fence-breakout neutralization) in the safe builder.`
  - `Dependencies: P2-T1`
  - `Validation command: npm run test:unit -- tests/unit/prompt-template-safety.test.ts`
  - `Expected result: Untrusted content is structurally hardened with deterministic output for identical input.`

- [x] Add deterministic size-limit behavior for untrusted sections
  - `Task ID: P2-T3`
  - `Description: Define and implement explicit section-size limits with a predictable handling policy (e.g., deterministic truncation marker or explicit generation failure) and preserve existing UX semantics.`
  - `Dependencies: P2-T2`
  - `Validation command: npm run test:unit -- tests/unit/prompt-template-safety.test.ts tests/unit/app.ui.test.ts`
  - `Expected result: Oversized payload handling is bounded, deterministic, and covered by tests.`

### Exit Criteria
Done when markering, normalization, fence neutralization, and size-limit policy are implemented deterministically.

## Phase 3 — Validate behavior, accessibility, and quality gates

### Objective
Confirm hardening behavior and existing compare UX remain correct through unit/UI/e2e coverage and repository quality gates.

### Tasks
- [x] Extend unit tests for safeguard invariants
  - `Task ID: P3-T1`
  - `Description: Ensure unit tests validate marker integrity, control-character handling, fence neutralization, determinism, and size-limit behavior in `tests/unit/prompt-template-safety.test.ts`.`
  - `Dependencies: P2-T3`
  - `Validation command: npm run test:unit -- tests/unit/prompt-template-safety.test.ts`
  - `Expected result: Safeguard invariants are explicitly covered and stable.`

- [x] Verify UI/e2e behavior remains intact with safeguarded prompt
  - `Task ID: P3-T2`
  - `Description: Update/confirm `tests/unit/app.ui.test.ts` and `tests/e2e/app.spec.ts` for prompt-preview toggle semantics, marker visibility, and unchanged output/error/placeholder behavior.`
  - `Dependencies: P1-T3, P3-T1`
  - `Validation command: npm run test:unit -- tests/unit/app.ui.test.ts && npm run test:e2e -- tests/e2e/app.spec.ts`
  - `Expected result: Existing UX behavior persists while safeguarded prompt structure is visible when expected.`

- [x] Run full quality gates
  - `Task ID: P3-T3`
  - `Description: Run project quality gates for in-scope changes.`
  - `Dependencies: P3-T1, P3-T2`
  - `Validation command: npm run typecheck && npm test && npm run lint`
  - `Expected result: Typecheck, tests, and lint pass with no in-scope regressions.`

### Exit Criteria
Done when all safeguard and regression tests pass and quality gates are green.

## Risks and Mitigations

- **Risk:** Over-sanitization could reduce fidelity.
  - **Mitigation:** Restrict transformations to structural safeguards only; avoid semantic rewriting.
- **Risk:** Size-limit behavior may surprise users if not transparent.
  - **Mitigation:** Use deterministic, explicit behavior and assert it in tests.
- **Risk:** Divergence between preview and request payload.
  - **Mitigation:** Share one generated prompt source in state and assert parity in tests.

## Traceability

| Phase / Task ID | Requirement Coverage |
|---|---|
| P1-T1 | FR-1, SR-2 |
| P1-T2 | FR-2, TR-1, SR-1 |
| P1-T3 | FR-6, TR-2 |
| P2-T1 | FR-3, SR-1, SR-2 |
| P2-T2 | FR-4, TR-1, SR-1, PR-1 |
| P2-T3 | FR-5, TR-3, PR-1 |
| P3-T1 | TR-3, FR-3, FR-4, FR-5 |
| P3-T2 | FR-6, TR-3, AR-1 |
| P3-T3 | TR-4 |

## Run History

> **Prompt 6 run — 2026-04-30:** No unresolved discrepancies found. Workflow complete.
