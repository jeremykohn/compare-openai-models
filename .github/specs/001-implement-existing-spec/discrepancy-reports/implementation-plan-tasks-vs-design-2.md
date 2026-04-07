# Discrepancy Report: Implementation Plan vs. Design (Spec-2)

**Plan file**: `implementation-plan-tasks.md`
**Design file**: `spec-2-for-call-openai-api-repo.md`
**Report date**: 2026-03-30

---

## Summary

The implementation plan covers the overwhelming majority of spec-2's requirements. The plan's phase structure maps cleanly to the spec's layered architecture, all 52 functional requirements (FR-001..FR-052) are addressed across phases 0–8, non-functional requirements are captured in the Definition of Done and individual tasks, and the five open questions (OQ-001..OQ-005) are resolved in the plan's Design Assumptions section.

**Result: 4 minor gaps were identified and are now resolved. No blocking discrepancies. No FR is missing.**

---

## Coverage Matrix

| Spec Section | Plan Coverage | Status |
|---|---|---|
| FR-001..FR-009 (Prompt input/validation) | P1-T3, P6-T2 | ✅ Covered |
| FR-010..FR-020 (Model selection/dropdown) | P2-T1..T5, P3-T1..T6, P6-T3 | ✅ Covered |
| FR-021..FR-028 (Request submission / response flow) | P4-T1..T5, P5-T5..T6, P6-T5 | ✅ Covered |
| FR-029..FR-032 (Model validation at submit time) | P4-T3 | ✅ Covered |
| FR-033..FR-038 (Error handling / UI states) | P1-T4..T5, P6-T4 | ✅ Covered |
| FR-039..FR-047 (Models API behavior + cache) | P2-T1..T5, P3-T1..T6 | ✅ Covered |
| FR-048..FR-052 (Response API behavior) | P4-T1..T5 | ✅ Covered |
| NFR: Reliability/determinism | P2-T3 (sort), P5-T3 (dedup/abort), P2-T4 cache keying | ✅ Covered |
| NFR: Performance TTLs | P2-T4 (24h), P2-T5 (5min) | ✅ Covered |
| NFR: Maintainability (TypeScript strict, module separation) | P1-T1..T6, P8-T2 | ✅ Covered |
| NFR: Compatibility (Nuxt 4, Node 20+, Vercel) | P8-T2 | ✅ Covered |
| System architecture layers | Phases 1–6 map 1:1 to layer table | ✅ Covered |
| API contracts (POST /api/respond, GET /api/models) | P3-T1..T6, P4-T1..T5 | ✅ Covered |
| UI/UX spec (layout, states, styling, color palette) | P6-T1..T6 | ✅ Covered |
| State management composables | P5-T1..T4 | ✅ Covered |
| Security requirements | P1-T6, P3-T4, **P4-T0** (explicit security preflight for `/api/respond`) | ✅ Resolved |
| Accessibility requirements | P6-T2 (explicit dynamic `aria-invalid`), P6-T5 (explicit response ARIA semantics), P6-T6, P7-T5 | ✅ Resolved |
| Configuration / env vars | P8-T1 (explicit full runtime env var list) | ✅ Resolved |
| Test file inventory (named test files from spec) | Test Coverage Mapping + **Test File Inventory (Spec-Named Targets)** | ✅ Resolved |
| Open questions OQ-001..OQ-005 | Design Assumptions section | ✅ Resolved |
| Acceptance criteria checklists | Definition of Done | ✅ Referenced |
| Merge gates (6 commands) | P8-T3 | ✅ Covered |

---

## Gap-1 — Security preflight not explicitly called out for `/api/respond`

**Status**: ✅ Resolved

**Resolution implemented**:
- Added `P4-T0: Implement route-level security preflight for /api/respond`.
- Task explicitly requires red/green/refactor coverage for blocking upstream calls on invalid runtime config.

**Spec requirement (Security Requirements section)**:
> Both `/api/respond` and `/api/models` validate [OpenAI config] before upstream calls.

**Plan coverage**:
- `P3-T4` explicitly covers security preflight for the `/api/models` route.
- `P4` tasks (respond route) wire the prompt validation, model validation, and OpenAI proxy, but no task explicitly names security preflight enforcement for `/api/respond`.

**Impact**: Low. The security logic lives in `openai-security.ts` (P1-T6) which is a shared utility. A developer following the plan could reasonably add the preflight call while implementing P4 tasks, but it is not explicitly called out.

**Recommendation**: Completed via dedicated `P4-T0` sub-task.

---

## Gap-2 — Accessibility: `aria-invalid` binding on textarea not explicitly task-level

**Status**: ✅ Resolved

**Resolution implemented**:
- Updated `P6-T2` red-phase tests to explicitly include dynamic `aria-invalid` coverage.
- Updated `P6-T5` red-phase tests to explicitly include response section `aria-live="polite"` and `aria-atomic="true"` semantics.

**Spec requirement (FR-002, accessibility ARIA table)**:
> Textarea MUST have `aria-invalid="true/false"` (dynamic, based on validation state).

**Plan coverage**:
- `P6-T2` says "tests for `maxlength=4000`, `aria-required`, helper text, inline role-alert error, and textarea focus on validation error."
- The task does not explicitly list `aria-invalid` as a named test target.

**Impact**: Very low. The spec's ARIA table is listed inline with the accessibility section and is likely to be captured during implementation of P6-T2. However, the explicit attribute is absent from the task's red-phase test list.

**Recommendation**: Completed in `P6-T2`.

---

## Gap-3 — `.env.example` update to document all 5 runtime config vars

**Status**: ✅ Resolved

**Resolution implemented**:
- Expanded `P8-T1` to explicitly enumerate runtime env vars to document in `.env.example` and docs:
	- `OPENAI_API_KEY`
	- `OPENAI_BASE_URL`
	- `OPENAI_ALLOWED_HOSTS`
	- `OPENAI_ALLOW_INSECURE_HTTP`
	- `OPENAI_DISABLE_MODELS_CACHE`
	- `OPENAI_DISABLE_MODEL_VALIDATION_CACHE`

**Spec requirement (OQ-002 resolution + Configuration section)**:
> Document all 5 runtime config variables in `.env.example` with comments explaining their purpose and defaults.

**Plan coverage**:
- `P8-T1` says "update docs and `.env.example` guidance to include optional env behavior."
- This is covered at a high level, but the plan does not call out the specific count (5 variables) or explicitly list `OPENAI_ALLOW_INSECURE_HTTP` and `OPENAI_DISABLE_MODELS_CACHE` as new additions.

**Impact**: Low. The task intent is correct; the detail level is thin. A developer might miss adding the two optional vars.

**Recommendation**: Completed in `P8-T1`.

---

## Gap-4 — Named test files from spec not enumerated in plan

**Status**: ✅ Resolved

**Resolution implemented**:
- Added `Test File Inventory (Spec-Named Targets)` section to the implementation plan.
- Mapped unit, integration, and e2e file names to specific plan tasks.

**Spec section (Testing and Quality Gates — Test Structure)**:
The spec enumerates 15+ named test files:
- `tests/unit/app.a11y.test.ts`
- `tests/unit/app.ui.test.ts`
- `tests/unit/error-normalization.test.ts`
- `tests/unit/error-sanitization.test.ts`
- `tests/unit/prompt-validation.test.ts`
- `tests/unit/openai-security.test.ts`
- `tests/unit/type-guards.test.ts`
- `tests/unit/openai-models-config.test.ts`
- `tests/unit/models-list.test.ts`
- `tests/unit/models-response-cache.test.ts`
- `tests/unit/ui-error-alert.test.ts`
- `tests/integration/respond-route.test.ts`
- `tests/integration/models.test.ts`
- `tests/integration/models-config-cache.test.ts`
- `tests/e2e/app.spec.ts`
- `tests/e2e/models-selector.spec.ts`
- `tests/e2e/accessibility.spec.ts`

**Plan coverage**:
- The "Test Coverage Mapping" section at the bottom of the plan describes test layers (unit, integration, e2e) by topic, not by file name.
- Individual tasks describe the test behavior but do not reference the expected output file names.

**Impact**: Low. File names serve as a useful scaffold for developers creating test files. Without them, developers may choose different names and lose traceability.

**Recommendation**: Completed via `Test File Inventory (Spec-Named Targets)` appendix.

---

## Clarifications (No Gap, Minor Wording Observations)

### C-1 — `parseBooleanConfig()` utility not named in plan

The spec names `parseBooleanConfig()` (Configuration section) as the function for converting env strings to booleans. The plan (P1-T6, security validation) implies this function exists but does not name it. No action needed; the function is implicit in the security/config utility tasks.

### C-2 — `response` section ARIA semantics (`aria-live="polite"` + `aria-atomic="true"`)

**Status**: ✅ Resolved

**Resolution implemented**:
- `P6-T5` now explicitly includes response section `aria-live="polite"` + `aria-atomic="true"` in red-phase tests.

The spec's accessibility ARIA table states the response `<section>` should have `aria-live="polite"` and `aria-atomic="true"`. Plan task `P6-T5` covers response area states but does not explicitly name these two attributes in its red-phase test list. Very low impact; likely captured during implementation.

### C-3 — `logNormalizedUiError()` logging function

**Status**: ✅ Resolved

**Resolution implemented**:
- `P5-T4` now explicitly includes `logNormalizedUiError()` in the Green implementation step.

The spec (App Submit Logic) references `logNormalizedUiError()` as a named logging function. The plan mentions "Log error via `logNormalizedUiError()`" in one location (the Definition of Done section) but does not dedicate a task to implementing or testing this utility. It is small enough to fall under `P5-T4` but is not listed there explicitly.

---

## Conclusion

**No blocking discrepancies found.** All 52 functional requirements are covered by plan tasks. The previously identified four gaps have been resolved by explicit plan updates.

The plan is complete and correct as a TDD implementation guide for spec-2.
