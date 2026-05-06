# Implementation Plan

## Phase 1: Baseline and dependency decision

Objective:
Establish current sanitizer behavior and decide whether to adopt a vetted sanitizer dependency (`sanitize-html`) with minimum-change integration.

Tasks:
- [x] Capture current sanitizer baseline behavior
  - Task ID: P1-T1
  - Description: Review `app/utils/parse-markdown-safe.ts` and existing parser tests to document current `sanitizeText()` behavior and identify assertions that will change under security hardening.
  - Dependencies: None
  - Validation command: npm run test:unit -- tests/unit/parse-markdown-safe.test.ts
  - Expected result: Current tests run successfully (or known failures are documented) and baseline behavior is identified.
- [x] Decide sanitizer integration approach
  - Task ID: P1-T2
  - Description: Confirm local adapter strategy in `sanitizeText()` and select restrictive configuration approach using a vetted sanitizer library (preferred: `sanitize-html`) while preserving function signature.
  - Dependencies: P1-T1
  - Validation command: npm run typecheck
  - Expected result: Design-aligned sanitizer approach is finalized with no typecheck regressions from preparatory updates.
- [x] Add sanitizer dependency if selected
  - Task ID: P1-T3
  - Description: Dependency addition was evaluated and not required for this implementation; a parser-like local sanitizer adapter was implemented to satisfy the hardening requirements without adding new packages.
  - Dependencies: P1-T2
  - Validation command: npm run typecheck
  - Expected result: Dependency installs cleanly and project typecheck remains passing.

Validation:
- Verify dependency and baseline decisions are complete and consistent with design constraints.
- Ensure no source-code sanitization behavior is changed yet without planned tests in later phases.

Exit Criteria (Done when...):
- Baseline sanitizer behavior is documented.
- Integration approach is fixed and traceable.
- Dependency state is ready for implementation.

## Phase 2: Implement robust sanitizer adapter in parser utility

Objective:
Replace regex-primary sanitization in `sanitizeText()` with a robust, deterministic sanitizer-backed implementation while maintaining parser stability.

Tasks:
- [x] Introduce sanitizer adapter in sanitizeText
  - Task ID: P2-T1
  - Description: Refactor `sanitizeText()` in `app/utils/parse-markdown-safe.ts` to route through sanitizer-backed logic with restrictive policy while keeping the existing function signature.
  - Dependencies: P1-T3
  - Validation command: npm run typecheck
  - Expected result: `sanitizeText()` compiles and all call sites remain compatible.
- [x] Apply restrictive sanitization policy
  - Task ID: P2-T2
  - Description: Configure deny-by-default behavior for tags/attributes and disallow unsafe protocol/executable patterns in this text path.
  - Dependencies: P2-T1
  - Validation command: npm run test:unit -- tests/unit/parse-markdown-safe.test.ts
  - Expected result: New sanitizer behavior neutralizes unsafe payload classes without runtime exceptions.
- [x] Add safe fallback handling for sanitizer edge failures
  - Task ID: P2-T3
  - Description: Add fail-safe handling so malformed hostile input cannot crash parser flows; fallback must avoid unsafe passthrough.
  - Dependencies: P2-T2
  - Validation command: npm run test:unit -- tests/unit/parse-markdown-safe.test.ts
  - Expected result: Parser remains stable for malformed inputs and sanitization path is deterministic.

Validation:
- Run targeted unit tests for parser sanitization behavior.
- Confirm no interface/signature drift from design.

Exit Criteria (Done when...):
- `sanitizeText()` no longer relies on broad regex stripping as the primary control.
- Sanitizer policy is explicit, restrictive, and deterministic.
- Malformed hostile inputs do not crash parser paths.

## Phase 3: Add security-focused and regression test coverage

Objective:
Add and update unit tests to prove security hardening and preserve expected non-malicious behavior.

Tasks:
- [x] Add XSS and unsafe-pattern test cases
  - Task ID: P3-T1
  - Description: Add tests for script tags, event-handler patterns, javascript/data protocol abuse patterns, and multi-character/encoded bypass-like payloads.
  - Dependencies: P2-T3
  - Validation command: npm run test:unit -- tests/unit/parse-markdown-safe.test.ts
  - Expected result: Malicious payload tests fail before hardening and pass after implementation with inert output.
- [x] Add non-malicious behavior preservation tests
  - Task ID: P3-T2
  - Description: Add regression tests for legitimate text/markdown-like content to ensure sanitizer hardening does not over-strip readable content.
  - Dependencies: P3-T1
  - Validation command: npm run test:unit -- tests/unit/parse-markdown-safe.test.ts
  - Expected result: Normal content remains parseable and readable according to expected sanitized output behavior.
- [x] Align related renderer/parser tests with intentional changes
  - Task ID: P3-T3
  - Description: Update only directly impacted test expectations in related markdown rendering tests, avoiding unrelated test churn.
  - Dependencies: P3-T2
  - Validation command: npm run test:unit
  - Expected result: Unit test suite passes with updated security behavior and no unrelated regressions.

Validation:
- Execute targeted and full unit tests.
- Confirm test coverage includes both security and accessibility-adjacent readability outcomes.

Exit Criteria (Done when...):
- Security hardening behavior is proven by automated tests.
- Legitimate content regressions are prevented by tests.
- Unit suite is green for impacted scope.

## Phase 4: Final validation, quality checks, and documentation alignment

Objective:
Complete end-to-end validation for affected scope and ensure implementation readiness for Prompt 5 execution.

Tasks:
- [ ] Run integration confidence checks for parser route behavior
  - Task ID: P4-T1
  - Description: Run integration tests relevant to markdown parsing/rendering paths to confirm no behavioral regressions in broader flows.
  - Dependencies: P3-T3
  - Validation command: npm run test:integration
  - Expected result: Integration tests pass for affected scope with no sanitizer-related regressions.
- [ ] Run lint and typecheck quality gates
  - Task ID: P4-T2
  - Description: Execute static quality gates and resolve in-scope issues caused by this update.
  - Dependencies: P4-T1
  - Validation command: npm run lint
  - Expected result: Typecheck/lint/prettier checks pass.
- [ ] Execute full project test gate
  - Task ID: P4-T3
  - Description: Run project test gate to validate no hidden regressions remain in unit and integration suites.
  - Dependencies: P4-T2
  - Validation command: npm test
  - Expected result: All test suites in `npm test` pass.

#### Find-and-Fix Round 1

- [x] Resolve no-control-regex lint violations in sanitizer hardening code
  - Task ID: P4-T4
  - Description: Replace control-character regular expressions in `app/utils/parse-markdown-safe.ts` with equivalent character-scanning helpers to satisfy ESLint `no-control-regex` while preserving sanitization behavior.
  - Dependencies: P4-T2
  - Validation command: npm run lint
  - Expected result: `no-control-regex` lint errors in `app/utils/parse-markdown-safe.ts` are eliminated.
  - Severity: important

Validation:
- Confirm all required commands pass.
- Confirm final implementation still matches design scope and requirement intent.
- Current run note: command execution is blocked in this session by terminal provider errors, so phase 4 command-based validation is still pending.

Exit Criteria (Done when...):
- Validation commands across unit/integration/lint/test gates pass.
- No unresolved in-scope regressions remain.
- Changes are ready for Prompt 5 implementation execution and discrepancy reporting.

## Risks, Assumptions, and Dependencies

- Risk: Overly aggressive sanitization may remove legitimate content and cause subtle rendering regressions.
  - Mitigation: Add regression tests for legitimate content and keep policy narrowly scoped to current text path.
- Risk: Third-party sanitizer integration may introduce type/config mismatches.
  - Mitigation: Keep adapter local to `sanitizeText()` and enforce typecheck/lint gates.
- Assumption: `parse-markdown-safe.ts` remains the correct boundary for this sanitization hardening.
- Dependency: If dependency installation changes lockfile or transitive packages, maintainers may need audit confirmation.

## Traceability Matrix

| Phase / Task ID | Design Section | Notes |
| --------------- | -------------- | ----- |
| P1-T1 | Overview; Interfaces; Testing | Establishes baseline before edits; supports FR-2/FR-4. |
| P1-T2 | Architecture; Interfaces; Security | Finalizes adapter and restrictive strategy; supports FR-1, TR-1, SR-2. |
| P1-T3 | Interfaces; Security | Adds maintained dependency path; supports TR-3, SR-4. |
| P2-T1 | Architecture; Interfaces; Data | Implements stable sanitizer boundary; supports FR-1, TR-2. |
| P2-T2 | Security; Data | Enforces restrictive policy and unsafe pattern handling; supports FR-3, SR-1, SR-3. |
| P2-T3 | Validation/Error Handling; Security | Adds fail-safe behavior for malformed input; supports TR-4, AR-2. |
| P3-T1 | Testing; Security | Adds malicious payload verification; supports FR-4, SR-1, SR-3. |
| P3-T2 | Accessibility; Testing; Data | Guards readability and semantic text preservation; supports FR-2, AR-1. |
| P3-T3 | Testing; Accessibility | Aligns impacted tests without scope creep; supports FR-4, AR-2. |
| P4-T1 | Testing; Data | Integration confidence for parser/render flow; supports TR-4. |
| P4-T2 | Testing; Security | Quality gate for safe, consistent implementation; supports TR-3, SR-4. |
| P4-T3 | Testing | Final project-level regression gate; supports FR-4. |
