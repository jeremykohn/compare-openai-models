# Execution Checklist — Resolve Discrepancies (Spec-2)

## Scope

- Plan: `.github/specs/001-implement-existing-spec/implementation-plan-resolve-discrepancies-2.md`
- Design: `.github/specs/001-implement-existing-spec/spec-2-for-call-openai-api-repo.md`
- Target discrepancy closure: `.github/specs/001-implement-existing-spec/discrepancy-reports/modifications-vs-design-2.md`

## Usage

For each task:

1. Mark **In Progress** before coding.
2. Complete in **red → green → refactor** order.
3. Record commands and evidence (test output/file paths).
4. Mark **Done** only when independently testable criteria pass.

---

## Status Legend

- [ ] Not started
- [~] In progress
- [x] Done

---

## Phase 0 — Verification Infrastructure and Environment Readiness

### P0-T1: Reproducible Playwright dependency baseline

- Status: [x]
- Red test/check added: [x]
- Green implementation done: [x]
- Refactor complete: [x]
- Independently testable command/result:
  - Command: `playwright install --with-deps chromium || playwright install chromium`
  - Result: first command failed due apt signature issue; fallback command executed and setup command completed successfully.
- Evidence (files/PR notes): `scripts/setup-playwright.sh`, `package.json` (`setup:playwright` script), terminal log showing fallback execution.

### P0-T2: Apply Playwright install fallback in CI/local setup

- Status: [x]
- Red test/check added: [x]
- Green implementation done: [x]
- Refactor complete: [x]
- Independently testable command/result:
  - Command: `playwright install --with-deps chromium || playwright install chromium`
  - Result: fallback path verified in local bootstrap via `npm run setup:playwright`.
- Evidence (files/PR notes): `scripts/setup-playwright.sh` (explicit fallback with logging), `README.md` setup docs include fallback strategy.

### P0-T3: Formatting scope policy for lint/prettier parity

- Status: [x]
- Red test/check added: [x]
- Green implementation done: [x]
- Refactor complete: [x]
- Independently testable command/result:
  - Command: `npm run lint`
  - Result: passed with scoped Prettier check paths after script policy update.
- Evidence (files/PR notes): `package.json` updated `lint` and `lint:fix` commands to source-focused scope.

---

## Phase 1 — Integration Test Fidelity Upgrade

### P1-T1: Reusable integration route test harness

- Status: [x]
- Red test/check added: [x]
- Green implementation done: [x]
- Refactor complete: [x]
- Independently testable command/result:
  - Command: `npm run test:integration`
  - Result: integration suite passed with route-level handler tests.
- Evidence (files/PR notes): `tests/integration/helpers/route-harness.ts` added for runtime-config/readBody/fetch mocking and dynamic route loading.

### P1-T2: `/api/models` full contract integration coverage

- Status: [x]
- Red test/check added: [x]
- Green implementation done: [x]
- Refactor complete: [x]
- Independently testable command/result:
  - Command: `npm run test:integration`
  - Result: `/api/models` tests pass for strict shape/sorting, fallback flags, and sanitized upstream error contract.
- Evidence (files/PR notes): `tests/integration/models.test.ts` now invokes route handler boundary via harness.

### P1-T3: `/api/respond` full contract integration coverage

- Status: [x]
- Red test/check added: [x]
- Green implementation done: [x]
- Refactor complete: [x]
- Independently testable command/result:
  - Command: `npm run test:integration`
  - Result: `/api/respond` tests pass for omitted-model defaulting, invalid prompt/model handling, validation unavailable, upstream passthrough, and internal fallback.
- Evidence (files/PR notes): `tests/integration/respond-route.test.ts` rewritten for route-handler contract paths.

### P1-T4: Route-level sanitization regression coverage

- Status: [x]
- Red test/check added: [x]
- Green implementation done: [x]
- Refactor complete: [x]
- Independently testable command/result:
  - Command: `npm run test:integration`
  - Result: sanitization assertions pass for `/api/models` and `/api/respond` error details.
- Evidence (files/PR notes): sanitization checks in `tests/integration/models.test.ts` and `tests/integration/respond-route.test.ts` verify `[REDACTED]` output.

---

## Phase 2 — UI/UX Parity Assertion Completion

### P2-T1: Prompt field parity assertions

- Status: [x]
- Red test/check added: [x]
- Green implementation done: [x]
- Refactor complete: [x]
- Independently testable command/result:
  - Command: `npm run test:unit`
  - Result: prompt semantic assertions pass (`maxlength`, `aria-required`, dynamic `aria-invalid`, `aria-describedby`, role alert on invalid submit).
- Evidence (files/PR notes): `tests/unit/app.ui.test.ts` prompt semantics and validation tests.

### P2-T2: `ModelsSelector` full state permutation assertions

- Status: [x]
- Red test/check added: [x]
- Green implementation done: [x]
- Refactor complete: [x]
- Independently testable command/result:
  - Command: `npm run test:unit`
  - Result: selector tests pass for loading, success-with-models, success-empty, error/retry, fallback note, and ARIA attributes.
- Evidence (files/PR notes): `tests/unit/models-selector.test.ts` expanded state/ARIA/retry coverage.

### P2-T3: App response-state parity assertions

- Status: [x]
- Red test/check added: [x]
- Green implementation done: [x]
- Refactor complete: [x]
- Independently testable command/result:
  - Command: `npm run test:unit`
  - Result: app tests pass for loading state text + disabled busy button, success response card + pre-wrap class, and error details toggle labels.
- Evidence (files/PR notes): `tests/unit/app.ui.test.ts` response-state flow assertions.

### P2-T4: Accessibility landmarks/live regions assertions

- Status: [x]
- Red test/check added: [x]
- Green implementation done: [x]
- Refactor complete: [x]
- Independently testable command/result:
  - Command: `npm run test:unit`
  - Result: accessibility tests pass for skip link, `main#maincontent`, and response live-region semantics; axe scan remains passing.
- Evidence (files/PR notes): `tests/unit/app.a11y.test.ts` landmark/live-region assertions.

---

## Phase 3 — End-to-End and Accessibility E2E Completion

### P3-T1: Deterministic Playwright mocking utilities

- Status: [x]
- Red test/check added: [x]
- Green implementation done: [x]
- Refactor complete: [x]
- Independently testable command/result:
  - Command: `npm run test:e2e`
  - Result: pass; deterministic route-mocking helper supports models success/error/delay and respond success/error states.
- Evidence (files/PR notes): `tests/e2e/helpers/mock-api.ts`, `tests/e2e/models-selector.spec.ts`.

### P3-T2: Happy-path e2e completion

- Status: [x]
- Red test/check added: [x]
- Green implementation done: [x]
- Refactor complete: [x]
- Independently testable command/result:
  - Command: `npm run test:e2e`
  - Result: pass; happy-path submit flow verifies response rendering after mocked `/api/respond` POST.
- Evidence (files/PR notes): `tests/e2e/app.spec.ts`.

### P3-T3: Error/retry/fallback e2e completion

- Status: [x]
- Red test/check added: [x]
- Green implementation done: [x]
- Refactor complete: [x]
- Independently testable command/result:
  - Command: `npm run test:e2e`
  - Result: pass; loading indicator, error+retry recovery, and fallback-note scenarios are covered and green.
- Evidence (files/PR notes): `tests/e2e/models-selector.spec.ts`.

### P3-T4: Accessibility e2e (axe) across representative states

- Status: [x]
- Red test/check added: [x]
- Green implementation done: [x]
- Refactor complete: [x]
- Independently testable command/result:
  - Command: `npm run test:a11y:e2e`
  - Result: pass; axe scans are green for idle-ready, loading, success-response, and error states.
- Evidence (files/PR notes): `tests/e2e/accessibility.spec.ts`, `nuxt.config.ts` (`htmlAttrs.lang`).

---

## Phase 4 — Merge-Gate Parity and Quality Stabilization

### P4-T1: Deterministic full-gate orchestration

- Status: [x]
- Red test/check added: [x]
- Green implementation done: [x]
- Refactor complete: [x]
- Independently testable command/result:
  - Command: `npm run typecheck && npm run lint && npm run test:unit && npm run test:integration && npm run test:e2e && npm run test:a11y`
  - Result: pass; full gate sequence executes deterministically in expected order with all suites green.
- Evidence (files/PR notes): terminal run output captured for typecheck, lint, unit, integration, e2e, and a11y commands.

### P4-T2: Lint/prettier parity closure

- Status: [x]
- Red test/check added: [x]
- Green implementation done: [x]
- Refactor complete: [x]
- Independently testable command/result:
  - Command: `npm run lint`
  - Result: pass; `typecheck`, `eslint`, and scoped `prettier --check` are all green.
- Evidence (files/PR notes): `package.json` lint scope policy plus passing lint command output.

### P4-T3: Post-implementation discrepancy verification checklist

- Status: [x]
- Red test/check added: [x]
- Green implementation done: [x]
- Refactor complete: [x]
- Independently testable command/result:
  - Command: `npm run test:integration && npm run test:e2e && npm run test:a11y`
  - Result: pass; discrepancy coverage evidence is verified for integration route contracts and e2e/a11y state flows.
- Evidence (files/PR notes): `tests/integration/models.test.ts`, `tests/integration/respond-route.test.ts`, `tests/e2e/app.spec.ts`, `tests/e2e/models-selector.spec.ts`, `tests/e2e/accessibility.spec.ts`.

---

## Phase 5 — Documentation and Traceability Closure

### P5-T1: README verification prerequisites and gate docs

- Status: [x]
- Red test/check added: [x]
- Green implementation done: [x]
- Refactor complete: [x]
- Independently testable command/result:
  - Command: `npm run lint`
  - Result: pass; README verification/gate docs are in scope for prettier/lint checks and validate successfully.
- Evidence (files/PR notes): `README.md` setup fallback guidance, quality gates section, and prerequisite instructions.

### P5-T2: Test architecture/fixture documentation

- Status: [x]
- Red test/check added: [x]
- Green implementation done: [x]
- Refactor complete: [x]
- Independently testable command/result:
  - Command: `npm run lint`
  - Result: pass; test architecture section and fixture/harness references are documented and formatted.
- Evidence (files/PR notes): `README.md` section `Test Architecture`, `tests/integration/helpers/route-harness.ts`, `tests/e2e/helpers/mock-api.ts`.

### P5-T3: Final discrepancy closure evidence report

- Status: [x]
- Red test/check added: [x]
- Green implementation done: [x]
- Refactor complete: [x]
- Independently testable command/result:
  - Command: `npm run typecheck && npm run lint && npm run test:unit && npm run test:integration && npm run test:e2e && npm run test:a11y`
  - Result: pass; discrepancy closure evidence is fully backed by green gates and updated reports.
- Evidence (files/PR notes): `.github/specs/001-implement-existing-spec/discrepancy-reports/modifications-vs-design-2.md`, `.github/specs/001-implement-existing-spec/discrepancy-reports/modifications-vs-implementation-plan-tasks-2.md`.

---

## Discrepancy Closure Mapping

### D-1: E2E/a11y e2e not executable

- Planned resolution tasks: `P0-T1`, `P0-T2`, `P3-T4`
- Closure evidence required:
  - [x] `npm run test:e2e` pass
  - [x] `npm run test:a11y:e2e` pass

### D-2: Full merge-gate parity partial

- Planned resolution tasks: `P0-T3`, `P4-T1`, `P4-T2`
- Closure evidence required:
  - [x] `npm run typecheck` pass
  - [x] `npm run lint` pass
  - [x] `npm run test:unit` pass
  - [x] `npm run test:integration` pass
  - [x] `npm run test:e2e` pass
  - [x] `npm run test:a11y` pass

### D-3: Integration fidelity below route-focused intent

- Planned resolution tasks: `P1-T1`, `P1-T2`, `P1-T3`, `P1-T4`
- Closure evidence required:
  - [x] Route-level integration tests for `/api/models`
  - [x] Route-level integration tests for `/api/respond`
  - [x] Sanitization regression tests at route contract level

### D-4: UI parity checks not exhaustive

- Planned resolution tasks: `P2-T1`, `P2-T2`, `P2-T3`, `P2-T4`, `P3-T2`, `P3-T3`
- Closure evidence required:
  - [x] Unit/component parity checklist coverage
  - [x] E2E flow coverage for required UI states
  - [x] Accessibility assertions for landmarks/live regions/toggles

---

## Final Sign-off

- [x] All phase tasks marked done
- [x] All discrepancy mappings closed with evidence
- [x] Updated discrepancy report indicates zero unresolved items
- Owner: GitHub Copilot
- Date: 2026-04-06
