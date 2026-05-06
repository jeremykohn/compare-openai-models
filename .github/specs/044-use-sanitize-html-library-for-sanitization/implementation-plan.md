# Implementation Plan

## Phase 1: Baseline and dependency setup

Objective:
Capture current behavior and add `sanitize-html` dependency with minimal integration risk.

Tasks:
- [x] Capture current sanitizer baseline behavior
  - Task ID: P1-T1
  - Description: Review current `sanitizeText()` behavior and existing unit tests to identify expected outputs that must be preserved.
  - Dependencies: None
  - Validation command: npm run test:unit -- tests/unit/parse-markdown-safe.test.ts
  - Expected result: Baseline behavior and relevant tests are identified.
- [x] Add `sanitize-html` dependency
  - Task ID: P1-T2
  - Description: Add `sanitize-html` to dependencies and update lockfile. Dependency and typings are now present in `package.json` and `package-lock.json`.
  - Dependencies: P1-T1
  - Validation command: npm run typecheck
  - Expected result: Dependency is installed and typecheck passes.
- [x] Define sanitizer configuration strategy
  - Task ID: P1-T3
  - Description: Define explicit restrictive sanitizer options for this plain-text parser path.
  - Dependencies: P1-T2
  - Validation command: npm run lint
  - Expected result: Configuration strategy is reflected in code with no lint regressions.

Validation:
- Verify dependency and baseline setup are complete.
- Ensure scope remains limited to sanitization migration.

Exit Criteria (Done when...):
- Baseline context is captured.
- Dependency is integrated.
- Restrictive config direction is in place.

## Phase 2: Implement sanitize-html based sanitization

Objective:
Replace regex-chain primary sanitization with `sanitize-html` while preserving the `sanitizeText()` boundary.

Tasks:
- [x] Refactor sanitizeText to call sanitize-html
  - Task ID: P2-T1
  - Description: Update `sanitizeText()` to use `sanitize-html` as primary sanitizer, keeping function signature intact.
  - Dependencies: P1-T3
  - Validation command: npm run typecheck
  - Expected result: Compilation succeeds and call sites remain compatible.
- [x] Remove regex-primary sanitization path
  - Task ID: P2-T2
  - Description: Remove or demote regex-based sanitization logic so it is no longer the primary security control.
  - Dependencies: P2-T1
  - Validation command: npm run lint
  - Expected result: Regex-chain primary control is eliminated and lint passes.
- [x] Preserve deterministic stable behavior
  - Task ID: P2-T3
  - Description: Ensure sanitization output remains deterministic and parser behavior does not throw on malformed hostile input.
  - Dependencies: P2-T2
  - Validation command: npm run test:unit -- tests/unit/parse-markdown-safe.test.ts
  - Expected result: Targeted unit tests pass with stable behavior.

Validation:
- Run targeted type/lint/unit checks.
- Confirm boundary and scope remain aligned with design.

Exit Criteria (Done when...):
- `sanitize-html` is primary sanitizer in `sanitizeText()`.
- Regex-only primary control is removed.
- Parser stability is preserved.

## Phase 3: Security and regression test updates

Objective:
Prove malicious payload handling and preserve non-malicious behavior through tests.

Tasks:
- [x] Add/adjust malicious payload tests
  - Task ID: P3-T1
  - Description: Add or adjust unit tests for script tags, encoded payloads, mixed-case payloads, and protocol abuse patterns.
  - Dependencies: P2-T3
  - Validation command: npm run test:unit -- tests/unit/parse-markdown-safe.test.ts
  - Expected result: Security-focused sanitizer tests pass.
- [x] Add/adjust non-malicious content preservation tests
  - Task ID: P3-T2
  - Description: Ensure tests validate normal text readability and expected symbols/content preservation.
  - Dependencies: P3-T1
  - Validation command: npm run test:unit -- tests/unit/parse-markdown-safe.test.ts
  - Expected result: Non-malicious content behavior is preserved and covered.
- [x] Align impacted unit tests
  - Task ID: P3-T3
  - Description: Update only directly impacted expectations in parser/renderer tests.
  - Dependencies: P3-T2
  - Validation command: npm run test:unit
  - Expected result: Unit suite passes with intentional sanitizer behavior.

Validation:
- Execute targeted then broader unit tests.
- Confirm test updates remain scoped.

Exit Criteria (Done when...):
- Security and regression test coverage are both present and passing.
- Unit suite passes for impacted scope.

## Phase 4: Final quality gates

Objective:
Run final verification gates for integration and repository quality.

Tasks:
- [x] Run integration test gate
  - Task ID: P4-T1
  - Description: Execute integration tests to confirm no downstream regressions.
  - Dependencies: P3-T3
  - Validation command: npm run test:integration
  - Expected result: Integration tests pass.
- [x] Run lint/type gate
  - Task ID: P4-T2
  - Description: Run lint pipeline and resolve in-scope sanitizer migration issues.
  - Dependencies: P4-T1
  - Validation command: npm run lint
  - Expected result: Lint/type/prettier checks pass.
- [x] Run full project test gate
  - Task ID: P4-T3
  - Description: Run project test command to verify no hidden regressions remain.
  - Dependencies: P4-T2
  - Validation command: npm test
  - Expected result: Test command passes.

Validation:
- Confirm all phase-level validation commands pass.
- Confirm changes remain within defined scope.
- Current run note: dependency installation, lint, and test gates are confirmed via local command results shared by the user.

Exit Criteria (Done when...):
- Integration/lint/full test gates pass.
- No open implementation tasks remain.

## Risks, Assumptions, and Dependencies

- Risk: Sanitizer configuration may over-strip content.
  - Mitigation: Add explicit regression tests for legitimate content.
- Risk: Dependency integration may surface lint/type/test issues.
  - Mitigation: Validate with phased checks and fix only in-scope issues.
- Assumption: `sanitizeText()` remains the canonical sanitizer boundary.
- Dependency: Availability and compatibility of `sanitize-html` in current Node/Nuxt toolchain.

## Traceability Matrix

| Phase / Task ID | Design Section | Notes |
| --------------- | -------------- | ----- |
| P1-T1 | Overview; Testing | Establishes baseline behavior context. |
| P1-T2 | Architecture; Interfaces | Dependency setup for library migration. |
| P1-T3 | Interfaces; Security | Explicit restrictive sanitizer config. |
| P2-T1 | Architecture; Interfaces | `sanitizeText()` migration to `sanitize-html`. |
| P2-T2 | Security; Architecture | Remove regex-primary control. |
| P2-T3 | Data; Validation/Error Handling | Deterministic stable parser behavior. |
| P3-T1 | Security; Testing | Malicious payload handling coverage. |
| P3-T2 | Accessibility; Testing | Preserve readable non-malicious output. |
| P3-T3 | Testing | Align impacted unit expectations. |
| P4-T1 | Testing | Integration confidence gate. |
| P4-T2 | Testing; Security | Lint/type quality gate for migration correctness. |
| P4-T3 | Testing | Final project test gate. |

## Run History

> **Prompt 6 run — 2026-05-06:** No unresolved discrepancies found. Workflow complete.
