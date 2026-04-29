# Requirements: Rename Positional Naming to Model 1 / Model 2 Semantics

## Functional Requirements

### FR-1: Semantic naming for model flows
The system SHALL replace positional (`left`/`right`) naming with role-based naming (`model1`/`model2`) for the dual-model flow across relevant code paths.

**Acceptance Criteria**
- No relevant dual-model flow identifiers in app logic use positional semantics.
- Updated identifiers clearly map to first and second model roles.
- Runtime behavior remains equivalent to pre-refactor behavior.

### FR-2: Consistent selector semantics
The system SHALL use selector identifiers that clearly represent `Model 1` and `Model 2` roles rather than location-based naming.

**Acceptance Criteria**
- Selector IDs/classes/test locators for the dual-model controls use role-based naming.
- Inconsistent naming patterns (for example, one neutral selector and one positional selector) are eliminated for the dual-model selectors.
- E2E and unit tests reference the updated semantic selectors.

### FR-3: Component contract alignment
The system SHALL update component input/output contracts (props, emitted events, and consuming bindings) to role-based naming for the two model flows.

**Acceptance Criteria**
- Prop and emit names in relevant components use `model1`/`model2` terminology.
- All call sites are updated consistently.
- Type checking passes with updated contract names.

### FR-4: Preserve user-visible model labeling intent
The system SHALL preserve and align user-visible labeling with `Model 1` and `Model 2` terminology.

**Acceptance Criteria**
- User-visible labels for model controls and output headings remain clear and accurate for `Model 1` and `Model 2`.
- No user-visible text introduces positional dependence (`left`/`right`) for model ownership.
- Existing output/result mapping remains correct for each model role.

### FR-5: Test suite semantic migration
The system SHALL migrate relevant tests and test helpers to role-based naming and keep functional coverage intact.

**Acceptance Criteria**
- Unit and E2E tests compile and run using the new names.
- Helper utilities expose role-based API names for model selectors/flows.
- Existing behavioral assertions for two independent model flows are preserved.

## Technical Requirements

### TR-1: Refactor scope and safety
The implementation SHALL be a behavior-preserving refactor focused on naming and references for the two-model flow.

**Acceptance Criteria**
- No new feature behavior is introduced outside the rename scope.
- API route behavior and payload semantics remain unchanged unless required for naming consistency.
- Any unavoidable behavioral change is explicitly documented in the spec artifacts.

### TR-2: Repository-wide consistency in relevant surfaces
The implementation SHALL apply consistent `model1`/`model2` naming across relevant app, component, and test surfaces.

**Acceptance Criteria**
- Relevant symbols in `app/` and `tests/` no longer rely on positional naming for two-model ownership.
- Renamed identifiers follow project naming conventions and existing style.
- Mixed old/new naming is not left in the same logical flow.

### TR-3: Typed contract integrity
The implementation SHALL maintain TypeScript type integrity after renaming contracts and symbols.

**Acceptance Criteria**
- Type signatures are updated for renamed props/events/helpers.
- No introduced `any` typing is used to bypass refactor correctness.
- Type checks pass for affected files.

### TR-4: Validation and regression checks
The implementation SHALL validate the rename using targeted and broader tests for impacted functionality.

**Acceptance Criteria**
- At minimum, relevant unit tests and affected E2E tests are executed.
- Failures caused by stale positional references are resolved.
- Test outcomes demonstrate unchanged dual-model behavior.

### TR-5: Documentation alignment
The implementation SHALL update documentation when code-facing naming changes affect referenced identifiers.

**Acceptance Criteria**
- Any docs referencing renamed identifiers/selectors are updated where applicable.
- Workflow artifacts remain internally consistent with final naming.

## Security Requirements

### SR-1: Preserve existing secure request/error handling behavior
The implementation SHALL not weaken existing security controls while renaming identifiers.

**Acceptance Criteria**
- Input validation, request handling, and error normalization behavior remain unchanged for dual-model flows.
- No secrets, tokens, or sensitive values are introduced in renamed identifiers, logs, or test fixtures.
- Existing OWASP-aligned protections already in place (for example, controlled request handling and sanitized error display paths) continue to operate as before.

## Accessibility Requirements

### AR-1: Accessible naming continuity for model controls
The implementation SHALL preserve accessible labeling semantics for model controls after renaming.

**Acceptance Criteria**
- Labels for model selection controls remain programmatically associated with their form controls.
- Accessible names continue to include visible label text for voice access compatibility.
- Renaming does not reduce keyboard operability of model selection controls.

### AR-2: Accessible output-region clarity
The implementation SHALL preserve accessibility semantics for model-specific output regions.

**Acceptance Criteria**
- Model-specific output headings remain clear and accurately associated with their corresponding content.
- Existing live-region/status/error announcement behavior remains intact or equivalent.
- No regressions are introduced in existing accessibility tests for affected screens.

## Assumptions and Constraints
- `Model 1` and `Model 2` are logical roles and must not be coupled to physical UI position.
- The change is a scoped semantic refactor, not a feature redesign.
- Existing public behavior for dual-model querying and rendering must remain stable.
- The rename should avoid unnecessary dependency additions or architecture changes.

## Out of Scope / Non-Goals
- Adding new comparison features or output interpretation logic.
- Adding a third model selector/output flow.
- Redesigning page layout unrelated to semantic naming.
- Reworking unrelated API contracts, caching, or performance characteristics.
