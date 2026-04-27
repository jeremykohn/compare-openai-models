# Technical Design: Rename Positional Naming to Model 1 / Model 2 Semantics

## Overview
This update is a behavior-preserving semantic refactor that replaces positional naming (`left`/`right`) with role-based naming (`model1`/`model2`) for the existing two-model flow.

The design keeps runtime query behavior, API interactions, and rendering logic intact while making ownership explicit and resilient to layout changes.

### Goals
- Replace relevant positional identifiers with `model1`/`model2` identifiers.
- Normalize selector naming so both model controls follow the same semantic pattern.
- Update component interfaces, internal state symbols, helpers, and tests consistently.
- Preserve existing security and accessibility behavior.

### Non-Goals
- No new model flow or third model slot.
- No change to request payload semantics or `/api/respond` contract.
- No layout redesign.

## Architecture
The architecture remains unchanged: a Nuxt/Vue app coordinates two model selections and two independent response states.

### Affected layers
- **Presentation layer (`app/`)**: UI components and page-level state symbols are renamed to role semantics.
- **Component contract layer**: props/emits and consuming bindings move to role semantics.
- **Test layer (`tests/`)**: selectors, helper names, and variable names are updated to match production naming.

### Affected files (expected)
- `app/app.vue`
- `app/components/ModelsSelector.vue`
- `tests/e2e/helpers/selectors.ts`
- `tests/e2e/*.spec.ts` (relevant specs)
- `tests/unit/*.test.ts` (relevant tests referencing renamed identifiers/selectors)
- Any docs or workflow artifacts that reference renamed symbols/selectors

### Refactor strategy
1. Rename model-flow state and handlers in `app/app.vue`.
2. Rename `ModelsSelector` props/emits and update parent bindings.
3. Rename DOM selectors/IDs to semantic `model1`/`model2` equivalents.
4. Update shared test helpers and all call sites.
5. Run targeted tests, then broader checks.

## Interfaces
No external API contract changes are introduced. Internal component and selector contracts are renamed.

### Internal component interface updates
- Props rename pattern:
  - `selectedModelIdLeft` → `selectedModelIdModel1`
  - `selectedModelIdRight` → `selectedModelIdModel2`
- Emit rename pattern:
  - `update:selectedModelIdLeft` → `update:selectedModelIdModel1`
  - `update:selectedModelIdRight` → `update:selectedModelIdModel2`

### Page-level symbols (examples)
- `leftRequestState` / `rightRequestState` → `model1RequestState` / `model2RequestState`
- `startLeftRequest` / `startRightRequest` → `startModel1Request` / `startModel2Request`
- `leftOutputHeading` / `rightOutputHeading` → `model1OutputHeading` / `model2OutputHeading`

### Selector contract updates
- Replace mixed positional IDs with semantic IDs, for example:
  - `models-select` → `model1-select`
  - `models-select-right` → `model2-select`
- Keep labels and `for` attributes synchronized with new IDs.
- Update test helper APIs accordingly, for example:
  - `getLeftModelSelect` → `getModel1Select`
  - `getRightModelSelect` → `getModel2Select`

## Data
No data-model or persistence changes are required.

### Data flow impact
- Existing prompt and model ID data flow remains unchanged.
- Request body to `/api/respond` remains `{ prompt, model? }`.
- Response parsing and mapping remain unchanged.

### State flow impact
- State ownership remains two independent branches.
- Only symbol names and selector references change.
- Success/error/loading transitions remain as-is.

## Validation/Error Handling
Behavior remains unchanged; only identifier names are updated.

### Validation
- Prompt validation path remains unchanged.
- Model defaulting behavior remains unchanged.

### Error handling
- Error normalization utilities and usage remain unchanged.
- UI error rendering behavior remains unchanged.
- Logging pathways remain unchanged except for updated context labels where names are part of non-sensitive diagnostics.

### Safety checks during implementation
- Ensure no stale positional references remain in dual-model flow code paths.
- Ensure renamed selectors are reflected in all tests to prevent locator drift.

## Security
This refactor preserves existing security posture and must not alter protections.

### Security decisions
- Do not modify authentication/authorization behavior (none introduced by this scope).
- Keep input validation and request handling exactly as currently implemented.
- Preserve sanitized error paths and avoid exposing raw internal errors.
- Do not introduce sensitive data into renamed identifiers or logs.

### OWASP-aligned considerations in scope
- **A01/A04 (access control/insecure design):** No access-control surface change.
- **A03 (injection):** Request construction and server-side validation paths remain unchanged.
- **A09 (security logging/monitoring):** Keep existing error logging strategy; rename-only context labels must remain non-sensitive.

## Accessibility
Accessibility behavior remains equivalent while renaming IDs and contracts.

### Accessibility decisions
- Keep visible control labels as `Model 1` and `Model 2`.
- Maintain valid label-to-control programmatic association (`label[for]` matches new control `id`).
- Preserve keyboard operability and focus behavior for model selectors.
- Preserve output heading clarity and live-region/error announcement behavior.

### WCAG-aligned considerations in scope
- **1.3.1 Info and Relationships:** Label/control relationships remain intact after ID rename.
- **2.1.1 Keyboard:** Selector interactions remain keyboard operable.
- **4.1.2 Name, Role, Value:** Renamed controls preserve accessible names/roles/states.

## Testing
Testing validates that behavior is unchanged and naming is fully migrated.

### Test updates
- Update E2E selector helper APIs and IDs.
- Update all affected E2E specs to semantic helper names and selectors.
- Update unit tests referencing selector IDs, props/emits, or positional symbols.

### Validation sequence
1. Run targeted unit tests for `ModelsSelector` and app-level UI/a11y tests.
2. Run targeted E2E specs covering model selectors and dual-query flow.
3. Run full E2E suite to catch cross-test selector dependencies.
4. Run project lint/type checks for renamed TypeScript contracts.

### Expected pass criteria
- No failing tests due to stale positional names.
- Dual-model runtime behavior remains unchanged.
- Accessibility checks continue passing for affected pages.

## Assumptions and Constraints
- `Model 1`/`Model 2` are semantic roles, not position aliases.
- Refactor remains scoped to relevant dual-model surfaces.
- No new dependencies are introduced.
- Existing public behavior must remain stable.

## Open Questions
- None.

## Traceability Matrix
| Requirement ID | Design Section | Notes |
|----------------|----------------|-------|
| FR-1 | Overview; Architecture; Interfaces; Data | Defines role-based rename and behavior-preserving scope. |
| FR-2 | Interfaces; Architecture; Testing | Specifies semantic selector contract and test migration. |
| FR-3 | Interfaces; Architecture; Testing | Defines prop/emit/binding rename strategy. |
| FR-4 | Interfaces; Accessibility; Testing | Preserves user-visible `Model 1`/`Model 2` labeling and mapping. |
| FR-5 | Testing; Architecture | Covers helper/spec updates and regression validation. |
| TR-1 | Overview; Architecture; Data; Validation/Error Handling | Constrains change to rename-only semantics. |
| TR-2 | Architecture; Interfaces; Testing | Enforces consistency across app/tests surfaces. |
| TR-3 | Interfaces; Testing | Ensures type-safe contract migration and checks. |
| TR-4 | Testing | Defines targeted then broad validation flow. |
| TR-5 | Architecture; Traceability Matrix | Requires docs/artifact alignment where names change. |
| SR-1 | Security; Validation/Error Handling; Testing | Preserves validation/error handling and avoids new sensitive exposure. |
| AR-1 | Accessibility; Interfaces; Testing | Preserves label-control and keyboard/voice semantics. |
| AR-2 | Accessibility; Testing; Interfaces | Preserves heading, live-region, and error announcement clarity. |
