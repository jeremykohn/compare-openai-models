# Implementation Plan to Resolve Discrepancies (Spec-2)

## Sources

- Technical design: `.github/specs/001-implement-existing-spec/spec-2-for-call-openai-api-repo.md`
- Discrepancy report: `.github/specs/001-implement-existing-spec/discrepancy-reports/modifications-vs-design-2.md`

## Objective

Close the reported gaps between current implementation and spec-2 by:

1. Restoring full verification depth (route-level integration + comprehensive UI parity assertions).
2. Enabling executable e2e/a11y e2e in the target dev/CI environment.
3. Achieving full quality-gate parity (`typecheck`, `lint`, `unit`, `integration`, `e2e`, `a11y`).

## TDD Workflow (Mandatory for Every Task)

For each task, follow **red → green → refactor**:

1. **Red**: Write/extend a failing test for one specific requirement.
2. **Green**: Implement the smallest change to pass.
3. **Refactor**: Improve structure/readability without changing behavior.
4. Re-run the smallest impacted suite first, then broader gates.

---

## Phase 0 — Verification Infrastructure and Environment Readiness

### Approach

Eliminate environment-level blockers first with a simple fallback install flow: run `playwright install --with-deps chromium`, and if it fails, immediately run `playwright install chromium`.

### Tasks

- [ ] **P0-T1: Define reproducible Playwright system dependency baseline**
  - Red: Add a setup check that fails when Playwright Chromium cannot be installed.
  - Green: Add documented/install script step: first run `playwright install --with-deps chromium`; on failure, run `playwright install chromium`.
  - Refactor: Consolidate this fallback flow into one reusable setup command or script used locally and in CI.
  - Independently testable: the fallback flow completes and Playwright browser install is available for e2e.

- [ ] **P0-T2: Apply Playwright install fallback in CI and local bootstrap paths**
  - Red: Add a failing CI/local setup step proving e2e prerequisites are not ready when only one install command is attempted.
  - Green: Update CI/bootstrap to execute fallback flow automatically: `playwright install --with-deps chromium || playwright install chromium`.
  - Refactor: Keep the fallback flow in one place to avoid script drift.
  - Independently testable: CI/local setup logs show fallback execution when needed and e2e can start.

- [ ] **P0-T3: Define repository formatting scope policy for quality gate parity**
  - Red: Add quality-gate check that fails when formatting strategy is ambiguous (whole-repo vs changed-files-only).
  - Green: Align lint/prettier policy with team expectation and CI behavior.
  - Refactor: keep policy documented in one location (`README` and/or contributing docs).
  - Independently testable: `npm run lint` passes using agreed scope.

---

## Phase 1 — Integration Test Fidelity Upgrade (Server Route Contracts)

### Approach

Increase confidence from utility-level checks to route-level contract tests that exercise handlers end-to-end with mocked upstream OpenAI responses.

### Tasks

- [ ] **P1-T1: Build reusable integration route test harness**
  - Red: Create failing integration test that invokes `/api/models` via route handler boundary (not just helper function).
  - Green: Add shared test utilities for runtime config injection, mock fetch responses, and response assertions.
  - Refactor: remove duplicated setup across integration test files.
  - Independently testable: one minimal route contract test passes.

- [ ] **P1-T2: Expand `/api/models` integration contracts to full spec coverage**
  - Red: Add failing tests for all key paths: fresh cache hit, stale cache serve + background refresh trigger, fallback config flags, strict output shape.
  - Green: implement route adjustments needed to satisfy contract tests.
  - Refactor: centralize route error-building and response mapping helpers.
  - Independently testable: `tests/integration/models*.test.ts` passes.

- [ ] **P1-T3: Expand `/api/respond` integration contracts to full spec coverage**
  - Red: Add failing tests for omitted model behavior, invalid model (`400`), validation unavailable (`502`), upstream non-2xx passthrough message/details, internal error fallback.
  - Green: implement minimal route changes for any failing paths.
  - Refactor: unify error contract builder across upstream/internal failure branches.
  - Independently testable: `tests/integration/respond-route.test.ts` passes.

- [ ] **P1-T4: Add regression tests for sanitization in route-level error payloads**
  - Red: Add failing tests containing raw tokens/headers in upstream error text.
  - Green: ensure all route error details are sanitized before response.
  - Refactor: keep sanitization call sites explicit and centralized.
  - Independently testable: sanitization-focused integration tests pass.

---

## Phase 2 — UI/UX Parity Assertion Completion

### Approach

Keep implementation changes minimal unless required; first close coverage gaps by asserting all state permutations and exact copy/style semantics required by spec.

### Tasks

- [ ] **P2-T1: Add exhaustive unit/component assertions for prompt field parity**
  - Red: Add failing tests for all prompt semantics (`maxlength`, required, `aria-describedby`, dynamic `aria-invalid`, focus-on-error behavior).
  - Green: adjust component/app markup only where tests fail.
  - Refactor: reduce brittle selectors using stable test IDs/roles.
  - Independently testable: prompt-related unit suite passes.

- [ ] **P2-T2: Add exhaustive `ModelsSelector` state permutation tests**
  - Red: Add failing tests for loading, success-with-models, success-empty, error-with-retry, fallback-note visibility, and ARIA state.
  - Green: fix any rendering/attribute mismatches.
  - Refactor: simplify state-branch logic in component.
  - Independently testable: `models-selector` unit suite passes.

- [ ] **P2-T3: Add full response-state parity tests in app shell**
  - Red: Add failing tests for loading text, success card heading/text formatting, error alert title/details toggle behavior.
  - Green: align app shell behavior/copy with spec exactly.
  - Refactor: extract repeated response-state logic into small helpers if needed.
  - Independently testable: `app.ui.test.ts` passes with full parity assertions.

- [ ] **P2-T4: Add accessibility-specific unit assertions for landmarks and live regions**
  - Red: Add failing tests for skip link target, `main#maincontent`, `role=status`, `role=alert`, response `aria-live` + `aria-atomic`.
  - Green: implement minimal semantic fixes where needed.
  - Refactor: keep ARIA IDs/constants centralized.
  - Independently testable: unit accessibility suite passes.

---

## Phase 3 — End-to-End and Accessibility E2E Completion

### Approach

Once environment and integration parity are stable, validate full user journeys and accessibility in browser-level tests with deterministic mocks.

### Tasks

- [ ] **P3-T1: Harden Playwright route-mocking utilities for deterministic e2e**
  - Red: Add failing e2e test that flakes under current mock timing.
  - Green: centralize route setup/wait helpers and deterministic network stubs.
  - Refactor: move repeated mocking into shared helpers.
  - Independently testable: repeated run (`--repeat-each`) remains stable.

- [ ] **P3-T2: Complete happy-path e2e flow assertions**
  - Red: Add failing assertions for full flow (load models, enter prompt, submit, render response).
  - Green: align behavior/selectors as needed.
  - Refactor: reduce selector fragility via role-based locators.
  - Independently testable: `tests/e2e/app.spec.ts` passes.

- [ ] **P3-T3: Complete error/fallback/retry e2e flow assertions**
  - Red: Add failing tests for models fetch failure + retry, response error with details toggle, fallback note visibility path.
  - Green: patch any app behavior mismatches.
  - Refactor: reuse common e2e setup blocks.
  - Independently testable: `tests/e2e/models-selector.spec.ts` and related flows pass.

- [ ] **P3-T4: Complete accessibility e2e checks across representative states**
  - Red: Add failing axe scans for idle, loading, success, and error states.
  - Green: remediate a11y violations with minimal UI changes.
  - Refactor: add reusable axe helper.
  - Independently testable: `npm run test:a11y:e2e` passes.

---

## Phase 4 — Merge-Gate Parity and Quality Stabilization

### Approach

Treat quality gates as product requirements; move from “tests pass locally sometimes” to deterministic pass conditions matching the design’s merge criteria.

### Tasks

- [ ] **P4-T1: Enforce full gate sequence in one deterministic command path**
  - Red: Add failing orchestrated gate script that reports first failing gate with clear context.
  - Green: align scripts and CI command sequence to pass in expected order.
  - Refactor: eliminate duplicate gate definitions across scripts/docs.
  - Independently testable: single command runs full gate suite successfully.

- [ ] **P4-T2: Resolve lint/prettier parity with agreed repository scope**
  - Red: create failing check for whichever scope is chosen (whole repo or approved ignore list).
  - Green: apply formatting updates or ignore policy changes needed to make `npm run lint` reliably pass.
  - Refactor: keep `.prettierignore` and lint docs in sync.
  - Independently testable: `npm run lint` passes cleanly.

- [ ] **P4-T3: Add post-implementation discrepancy verification tests/checklist**
  - Red: generate checklist run that fails if any discrepancy topic lacks verification evidence.
  - Green: attach evidence mapping (test file + command + result) for each original discrepancy.
  - Refactor: template the checklist for future discrepancy closures.
  - Independently testable: checklist run has zero unresolved items.

---

## Phase 5 — Documentation and Traceability Closure

### Approach

Ensure docs reflect true behavior and verification posture so future contributors can reproduce and maintain parity.

### Tasks

- [ ] **P5-T1: Update README with exact gate expectations and environment prerequisites**
  - Red: doc validation check fails if required commands/prereqs are missing.
  - Green: document full local/CI prerequisites for e2e and a11y runs.
  - Refactor: keep quick-start concise and link to detailed verification section.
  - Independently testable: fresh developer can execute documented steps end-to-end.

- [ ] **P5-T2: Document integration/e2e test architecture and fixtures**
  - Red: docs test fails if key test harness files are undocumented.
  - Green: add concise docs for route-level integration harness and e2e mocks.
  - Refactor: avoid duplication with test file comments.
  - Independently testable: contributors can add one new integration/e2e test using docs only.

- [ ] **P5-T3: Produce final discrepancy closure evidence report**
  - Red: report template marks unresolved items until evidence is provided.
  - Green: record outcomes and close all discrepancy IDs with links to tests/commits/files.
  - Refactor: standardize report format for reuse.
  - Independently testable: all discrepancy items marked resolved with verifiable evidence.

---

## Dependency-Ordered Execution

1. **Phase 0** first (environment/gate prerequisites).
2. **Phase 1** then **Phase 2** (server and UI parity depth).
3. **Phase 3** after Phase 0–2 stability (e2e/a11y completion).
4. **Phase 4** for merge-gate determinism.
5. **Phase 5** for documentation and formal closure evidence.

## Definition of Done

- All discrepancy items in `modifications-vs-design-2.md` are resolved with test evidence.
- Route-level integration tests verify contract paths, not only utility behavior.
- Full UI/UX and accessibility parity assertions are implemented and passing.
- `npm run typecheck`, `npm run lint`, `npm run test:unit`, `npm run test:integration`, `npm run test:e2e`, and `npm run test:a11y` all pass in the target environment.
- Final discrepancy closure report records zero unresolved gaps.
