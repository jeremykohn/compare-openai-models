# Discrepancy Report: Modifications vs Implementation Plan (Spec-2)

**Implementation plan**: `.github/specs/001-implement-existing-spec/implementation-plan-tasks-2.md`  
**Generated on**: 2026-03-30

## Summary

The implementation completed the core application architecture and most planned tasks across Phases 1–6, with working unit/integration coverage and formatted modified code files.  
The primary remaining discrepancies are:
1. Full quality-gate completion (lint/e2e/a11y e2e) is not fully satisfied in this environment.
2. Some plan tasks that required broad, route-level integration/e2e depth are only partially covered.

## Phase-by-Phase Status

### Phase 0 — Baseline Harness and Quality Gate Readiness
- **Implemented**:
  - Added baseline unit/integration/e2e test files and shared fixtures under `tests/helpers/`.
  - Existing `tests/test-setup.ts` retained as setup anchor.
- **Discrepancy**:
  - **P0-T3 partial**: explicit local quality-gate documentation sequence was not added as a dedicated docs artifact.

### Phase 1 — Contracts, Constants, and Core Utilities
- **Implemented**:
  - `shared/constants/models.ts`
  - `types/api.ts`
  - `app/utils/prompt-validation.ts`
  - `app/utils/error-sanitization.ts`
  - `app/utils/error-normalization.ts`
  - `app/utils/type-guards.ts`
  - `server/utils/openai-security.ts`
- **Discrepancy**:
  - **P1-T2 partial**: no separate type-level contract-only test file was added; validation is covered indirectly via `typecheck` and runtime tests.

### Phase 2 — Models Config, Filtering, Sorting, and Cache Utilities
- **Implemented**:
  - `server/utils/openai-models-config-loader.ts`
  - `server/utils/models-list.ts`
  - `server/utils/models-response-cache.ts`
  - `server/utils/openai-model-validation.ts`
- **Discrepancy**:
  - No significant functional discrepancy; TTL/keying/filter semantics are implemented.

### Phase 3 — `GET /api/models` Route
- **Implemented**:
  - `server/api/models.get.ts` with security preflight, filtering/fallback metadata, sorting, and stale-while-revalidate cache behavior.
- **Discrepancy**:
  - **P3 integration depth partial**: integration tests focus on route primitives/utilities rather than full route HTTP contract execution with mocked upstream HTTP server.

### Phase 4 — `POST /api/respond` Route
- **Implemented**:
  - `server/api/respond.post.ts` with prompt validation, default model resolution, selected-model validation, upstream proxy, and canonical error contract.
- **Discrepancy**:
  - **P4 integration depth partial**: route behavior is implemented, but tests are primarily utility-driven integration instead of end-to-end route invocation at handler boundary.

### Phase 5 — Client Composables and Submission State Machine
- **Implemented**:
  - `app/composables/use-request-state.ts`
  - `app/composables/use-models-state.ts`
  - `app/utils/log-normalized-ui-error.ts`
  - App payload omission behavior in `app/app.vue` when no model selected.
- **Discrepancy**:
  - No significant discrepancy.

### Phase 6 — UI Components, UX States, Accessibility
- **Implemented**:
  - `app/components/ModelsSelector.vue`
  - `app/components/UiErrorAlert.vue`
  - full page shell in `app/app.vue`
  - Tailwind base + skip-link style in `app/assets/main.css`
- **Discrepancy**:
  - No significant discrepancy on implemented UI semantics.

### Phase 7 — E2E and Accessibility E2E
- **Implemented**:
  - `tests/e2e/app.spec.ts`
  - `tests/e2e/models-selector.spec.ts`
  - `tests/e2e/accessibility.spec.ts`
- **Discrepancy**:
  - **Execution blocked**: Playwright browser launch fails in this container due missing system library `libatk-1.0.so.0`.
  - Attempted remediation via `npx playwright install --with-deps chromium` failed because apt repository signature issue (`dl.yarnpkg.com` key error) prevented dependency installation.

### Phase 8 — Docs and Final Gates
- **Implemented**:
  - `README.md` rewritten to project-specific docs.
  - `.env.example` updated with `OPENAI_DISABLE_MODEL_VALIDATION_CACHE` and defaults.
  - `nuxt.config.ts` updated with app title and validation cache runtime key.
  - Prettier run on all modified code/doc files.
- **Discrepancy**:
  - **Final gate partial**:
    - `npm run typecheck`: ✅ pass
    - `npm run test:unit`: ✅ pass
    - `npm run test:integration`: ✅ pass
    - `npm run test:e2e`: ❌ blocked by missing OS libs
    - `npm run test:a11y:e2e`: ❌ blocked by same Playwright dependency issue
    - `npm run lint`: ❌ fails due repository-wide pre-existing Prettier check scope outside modified files

## Consolidated Discrepancy List

1. **E2E/a11y-e2e execution blocked by environment** (missing `libatk-1.0.so.0`; dependency install blocked by apt repo signature issue).
2. **Full lint gate not green repo-wide** because `prettier --check .` includes many pre-existing files outside implementation scope.
3. **Integration test depth partially below plan intent** (utility-level integrations vs full route-handler integration harness).
4. **Phase 0 quality-gate sequence documentation not added explicitly as a separate artifact.**

## Notes

- Core feature implementation (server routes, composables, components, prompt/model flows, caching, sanitization, and accessibility structure) is in place.
- Unit/integration suites pass and code is formatted for modified files.
