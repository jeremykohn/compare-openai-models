# Discrepancy Report: Modifications vs Technical Design (Spec-2)

**Design spec**: `.github/specs/001-implement-existing-spec/spec-2-for-call-openai-api-repo.md`  
**Generated on**: 2026-03-30

## Summary

The delivered implementation aligns with the majority of core functional behavior in spec-2 (prompt validation, model loading/selecting, server-side OpenAI proxying, fallback metadata, sanitization, and main UI states).  
The main discrepancies are concentrated in validation depth (test execution constraints and breadth), plus a small number of fidelity gaps where exact design constraints are not fully enforced by automated verification.

## Implemented and Aligned Areas

- Prompt validation and submit semantics (`FR-001`..`FR-009`, `FR-021`..`FR-027`) are implemented in `app/app.vue` + `app/utils/prompt-validation.ts`.
- Model selector states, helper text, retry/error rendering, and fallback note (`FR-010`..`FR-020`) are implemented in `app/components/ModelsSelector.vue` and `app/composables/use-models-state.ts`.
- Error normalization/sanitization categories and messages (`FR-033`..`FR-038`, `FR-052`) are implemented in client and server utilities.
- `/api/models` route behavior for filtering/fallback/sorting/cache (`FR-039`..`FR-047`) is implemented in `server/api/models.get.ts` with related utilities.
- `/api/respond` route behavior for prompt checks/model defaulting/model validation/error contracts (`FR-048`..`FR-051`) is implemented in `server/api/respond.post.ts`.
- Runtime config, Node version documentation, and app title updates are implemented (`nuxt.config.ts`, `package.json`, `.env.example`, `README.md`).

## Discrepancies

### 1) E2E and accessibility E2E verification not executable in current environment
- **Design expectation**: Full Playwright + axe validation via `npm run test:e2e` and `npm run test:a11y:e2e`.
- **Observed**: Playwright fails to launch Chromium due missing `libatk-1.0.so.0` in container.
- **Impact**: Browser-level validation of end-to-end behavior and accessibility cannot be confirmed in this environment.

### 2) Full merge-gate parity is partial
- **Design expectation**: All gates pass (`typecheck`, `lint`, `unit`, `integration`, `e2e`, `a11y`).
- **Observed**:
  - `typecheck`, `unit`, `integration` pass.
  - `e2e`/`a11y:e2e` blocked by environment.
  - `lint` repo-wide `prettier --check .` fails due pre-existing non-implementation files outside changed scope.
- **Impact**: End-state gate completeness differs from design merge criteria.

### 3) Integration test fidelity is lower than design’s route-focused intent
- **Design expectation**: Integration tests centered on server route contracts (`respond-route.test.ts`, `models.test.ts`) with route-level behavior verification.
- **Observed**: Integration tests validate core primitives and validation/cache behavior, but do not fully execute all route contracts through handler-level request/response harness.
- **Impact**: Lower confidence for certain edge-path contract combinations despite implemented route logic.

### 4) Some exact UI parity checks are implemented but not exhaustively asserted
- **Design expectation**: Full UX/accessibility parity checks including all specified state permutations and exact copy constraints.
- **Observed**: Key semantics and copy are implemented; however, automated checks do not exhaustively assert every detailed visual/state criterion from the spec checklist.
- **Impact**: Residual risk of minor parity drift not caught by tests.

## Non-Discrepancy Constraints Successfully Met

- Security boundaries remain server-side only for OpenAI API key handling.
- Model validation cache and models response cache TTLs are implemented.
- Fallback metadata (`usedConfigFilter`, `showFallbackNote`) and filtering rules align with design intent.
- Accessibility-first structure (skip link, labels, role alerts/status, keyboard-operable controls) is implemented in markup.

## Conclusion

Implementation is substantially aligned with the technical design and delivers the major functional architecture and behaviors. Remaining discrepancies are primarily validation/deployment-environment related and can be closed by:
1. fixing Playwright system dependencies in CI/dev container,
2. resolving pre-existing repository-wide formatting drift,
3. expanding route-level integration coverage for full contract-path assertions.
