# Overview

This update standardizes naming for the Model 3 dropdown identity across app and test code, centered on renaming the DOM selector ID from `model-comparison-select` to `model3-select` and aligning related symbols/selectors.

Goals:
- Establish `model3-select` as the canonical Model 3 dropdown DOM ID.
- Align related app/test selector references and naming with Model 3 terminology.
- Preserve all current runtime behavior, accessibility semantics, and request flow.

Out of scope:
- Feature behavior changes.
- Backend/API changes.
- Broad non-Model-3 terminology migration.

# Architecture

## High-Level Approach

1. Update Model 3 dropdown ID in active UI component markup.
2. Rename app-side selector references/symbols tied specifically to this control identity.
3. Rename test helper selectors and direct test queries targeting this control.
4. Validate no behavior regression via targeted and full quality gates.

## Affected Surfaces

Expected primary file scope:
- `app/components/ModelsSelector.vue`
  - update third-dropdown ID to `model3-select`.
  - align local naming tied to Model 3 dropdown identity.
- `tests/e2e/helpers/selectors.ts`
  - update helper selector(s) to target `#model3-select`.
  - keep existing helper intent and ergonomics.
- Unit/e2e tests referencing old ID directly or indirectly:
  - `tests/unit/models-selector.test.ts`
  - `tests/unit/app.ui.test.ts` (if applicable)
  - `tests/unit/app.a11y.test.ts` (if applicable)
  - `tests/e2e/models-selector.spec.ts`
  - `tests/e2e/app.spec.ts` (if applicable)
  - `tests/e2e/accessibility.spec.ts` (if applicable)

Likely non-changing surfaces:
- Server routes under `server/api/`
- Request/response contracts in `types/`

# Interfaces

## UI/DOM Interface Contract

Canonical Model 3 selector identity after change:
- DOM ID: `model3-select`

Deprecated for this control:
- `model-comparison-select`

Behavioral contract:
- Labeling, enabled/disabled semantics, and interaction model remain unchanged.
- Submit/query orchestration remains unchanged.

## Test Helper Interface Contract

- Any helper intended to select/query the Model 3 dropdown resolves to `#model3-select`.
- Legacy helper names may be renamed for consistency only if behavior and call sites stay equivalent.
- No compatibility alias is required unless explicitly requested.

# Data

No data-model changes are required.

No changes to:
- request payload shape,
- response contract,
- runtime config,
- persisted state.

The change is identifier-level in UI/test code only.

# Validation/Error Handling

No validation/error-flow behavior changes are expected.

Requirements for safe rename:
- Replace only references that identify the Model 3 dropdown control.
- Do not rename unrelated “comparison” concepts that represent panel/content semantics.
- Preserve existing assertion intent in all updated tests.

# Security

Security posture remains unchanged:
- No new request surfaces.
- No added logging/sensitive output.
- No secret-handling changes.

# Accessibility

Accessibility behavior must remain equivalent:
- Model 3 selector remains discoverable by role/label.
- Keyboard and screen-reader semantics are unaffected by ID rename.
- Existing a11y tests for Model 3 selector remain valid with updated selector naming.

# Performance

No measurable runtime performance impact is expected:
- No additional network requests.
- No additional rendering branches.
- Selector rename only.

# Testing

## Targeted Validation

Unit/a11y (targeted):
- `npm run test:unit -- tests/unit/models-selector.test.ts tests/unit/app.a11y.test.ts tests/unit/app.ui.test.ts`

E2E (targeted):
- `npm run test:e2e -- tests/e2e/models-selector.spec.ts tests/e2e/app.spec.ts tests/e2e/accessibility.spec.ts`

## Full Gates

- `npm run typecheck`
- `npm test`
- `npm run lint`

## Test Assertions to Preserve

- Model 3 control exists and is queryable with updated selector identity.
- Existing interaction/state behavior remains unchanged.
- Existing accessibility expectations remain unchanged.
- No test still depends on `#model-comparison-select` for Model 3 dropdown identity.

# Assumptions

- Current Model 3 behavior is correct and should be preserved as-is.
- No backward-compatibility alias for old selector ID is needed.

# Constraints

- Keep edits narrow and rename-focused.
- Avoid unrelated refactors and terminology sweeps.

# Open Questions

None.

# Traceability

| Requirement ID | Design Section | Notes |
|----------------|----------------|-------|
| FR-1 | Overview; Interfaces; Architecture; Testing | Establishes `model3-select` as canonical DOM ID. |
| FR-2 | Architecture; Interfaces; Validation/Error Handling | Aligns Model 3 selector references/symbols in app code without behavior changes. |
| FR-3 | Architecture; Interfaces; Testing | Updates helper/test selector usage to new canonical ID. |
| FR-4 | Interfaces; Validation/Error Handling; Testing | Explicit no-regression behavior contract. |
| TR-1 | Architecture; Constraints | Scope-limited rename-only implementation. |
| TR-2 | Interfaces; Architecture | Consistent identifier/symbol usage for Model 3 control identity. |
| TR-3 | Testing | Targeted test updates and pass criteria. |
| TR-4 | Testing | Full quality-gate pass requirements. |
| SR-1 | Security | No exposure/logging/transport behavior changes. |
| SR-2 | Security; Data | No new request paths or request count changes. |
| AR-1 | Accessibility; Interfaces; Testing | Preserve role/label discoverability and semantics. |
| AR-2 | Accessibility; Interfaces; Testing | Preserve stable, deterministic selector conventions in tests. |
| PR-1 | Performance; Data | No new runtime overhead introduced by rename. |
