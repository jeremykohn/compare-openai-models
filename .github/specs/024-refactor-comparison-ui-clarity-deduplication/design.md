# Overview

This update refactors comparison UI implementation for clarity and deduplication while preserving current user-visible behavior exactly.

Goals:
- Reduce repeated selector/output layout and render logic.
- Improve internal component/composable boundaries for maintainability.
- Keep existing UI behavior, semantics, and contracts unchanged.

Out of scope:
- Feature additions or UX redesign.
- Backend/API changes.
- Unrelated refactors outside comparison UI surfaces.

# Architecture

## High-Level Approach

1. Identify duplicated comparison UI structure in `app/app.vue` and related selector/output components.
2. Extract repeated markup/state wiring into reusable presentational units and helper logic.
3. Keep orchestration flow and state semantics intact.
4. Update tests only where structural references change, preserving assertion intent.

## Proposed Refactor Boundaries

In-scope code boundaries:
- `app/app.vue`
- Related selector UI components under `app/components/`
- Related output panel components under `app/components/`
- UI-only composables/utilities used exclusively by comparison UI

Out-of-scope boundaries:
- `server/**`
- API contracts in `types/**`
- runtime config/env surfaces

## Target Structural Shape

- Move repeated selector field and output panel render patterns into shared component-level abstractions.
- Keep top-level app shell responsible for orchestration, request triggering, and high-level state.
- Keep presentational units stateless or minimally stateful, driven by explicit props/events.
- Centralize repeated display-copy/branching helpers where this reduces duplication without altering behavior.

# Interfaces

## UI/Component Contracts

Behavior-preserving contract requirements:
- Existing selector labels, enabled/disabled semantics, and update events remain equivalent.
- Existing output panel states (loading/success/error/placeholder/comparison) remain equivalent.
- Existing ARIA semantics and landmark/state roles remain equivalent.

Refactor interface expectations:
- Any newly extracted component receives explicit, typed props for current behavior branches.
- Event names used by parent wiring remain unchanged unless internally adapted with equivalent public behavior.
- Publicly observable DOM/test semantics remain equivalent unless selector refactor requires test-only updates.

## Composable/Utility Contracts

- Extracted helper functions must be pure or side-effect constrained.
- No change to request payload/response handling boundaries.
- No new global/shared mutable state introduced.

# Data

No data model changes are required.

The refactor does not alter:
- request payload shape,
- response contract shape,
- persisted state or runtime config.

State ownership remains:
- app shell holds orchestration/query state,
- extracted UI units render from provided state.

# Validation and Error Handling

Behavior invariants:
- Current loading, error, success, and comparison placeholder branches remain unchanged.
- Existing sanitized error display behavior remains unchanged.
- Existing prompt validation behavior remains unchanged.

Refactor constraints:
- Do not collapse or reorder behavior branches in ways that change visible outcomes.
- Preserve current fallback/default behavior semantics.

# Security

Security posture must remain unchanged:
- No new client-side exposure of sensitive data.
- No new request surfaces or additional request types.
- No secret/token handling changes.

# Accessibility

Accessibility invariants:
- Existing form labels, described-by wiring, and role semantics remain equivalent.
- Existing keyboard navigation and focus order remain predictable.
- Existing live-region/status semantics remain equivalent.

If structural extraction changes DOM nesting:
- maintain accessible name/role/value semantics,
- preserve current a11y test intent and outcomes.

# Performance

Performance invariants:
- No additional network calls per submit.
- No new polling/timeout/background loops.
- No materially heavier rendering flow relative to current baseline.

Allowed outcome:
- incidental minor render simplification from deduplication.

# Testing

## Test Strategy

- Preserve behavior assertions; adjust selectors/structure assertions only where required by refactor shape.
- Keep coverage breadth at least equivalent across unit, e2e, and accessibility tests.
- Add/adjust tests only to protect refactor-internal abstractions when needed, without weakening existing behavior checks.

## Targeted Validation Commands

Unit/a11y targeted (as needed by touched files):
- `npm run test:unit -- tests/unit/models-selector.test.ts tests/unit/app.ui.test.ts tests/unit/app.a11y.test.ts`

E2E targeted:
- `npm run test:e2e -- tests/e2e/models-selector.spec.ts tests/e2e/app.spec.ts tests/e2e/accessibility.spec.ts`

## Full Quality Gates

- `npm run typecheck`
- `npm test`
- `npm run lint`

# Risks and Mitigations

- **Risk:** Refactor accidentally changes subtle render/state behavior.
  - **Mitigation:** Preserve branch parity and run targeted behavior tests before full gates.
- **Risk:** Test weakening during structural updates.
  - **Mitigation:** Maintain existing behavioral assertions; change only brittle structural selectors when necessary.
- **Risk:** Accessibility regressions from component extraction.
  - **Mitigation:** Preserve semantic attributes and run a11y unit/e2e checks.

# Assumptions

- Current comparison UI behavior is canonical and must be preserved.
- Existing tests sufficiently encode behavior expectations for safe refactor.
- Internal symbol/file organization can change without affecting user behavior.

# Constraints

- Keep changes limited to comparison UI scope.
- Avoid unrelated cleanup or cross-domain refactors.
- Do not introduce third-party UI dependencies for this refactor.

# Open Questions

None blocking.

# Traceability

| Requirement ID | Design Section | Notes |
|----------------|----------------|-------|
| FR-1 | Architecture; Interfaces; Testing | Consolidates repeated selector/output patterns into reusable paths. |
| FR-2 | Interfaces; Validation and Error Handling; Testing | Preserves controls, labels, states, and behavioral outcomes. |
| FR-3 | Validation and Error Handling; Interfaces; Testing | Preserves output semantics/content parity across current scenarios. |
| FR-4 | Interfaces; Data; Security | Keeps refactor internal and non-breaking for public behavior/contracts. |
| TR-1 | Architecture; Constraints | Enforces strict comparison-UI scope boundary. |
| TR-2 | Architecture; Interfaces | Improves maintainability via clearer component/composable boundaries. |
| TR-3 | Testing | Requires behavior-preserving test alignment only where structure changes. |
| TR-4 | Testing | Requires full repo quality gates to pass post-refactor. |
| SR-1 | Security | Preserves current security posture and sanitized rendering behavior. |
| SR-2 | Data; Security | Preserves payload/response handling boundaries and contracts. |
| AR-1 | Accessibility; Interfaces; Testing | Maintains current accessibility semantics and interaction behavior. |
| AR-2 | Accessibility; Testing | Maintains integrity of accessibility test coverage intent. |
| PR-1 | Performance; Data | Prevents added request/render overhead from refactor changes. |
