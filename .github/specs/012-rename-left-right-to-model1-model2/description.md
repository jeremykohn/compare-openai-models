# Description: Rename Positional Naming to Model 1 / Model 2 Semantics

## General Description

In the current app, many identifiers, variable names, selectors, and related references use locational terms such as `left` and `right`. These names currently map to UI position, not to the conceptual roles `Model 1` and `Model 2`. Some identifiers are also inconsistent (for example, `models-select` vs `models-select-right`), which makes ownership and intent less clear and couples implementation details to layout. Update the relevant code so naming and references are based on `Model 1` / `Model 2` semantics rather than positional semantics, and avoid reliance on locational identifiers that may become incorrect if the UI layout changes.

## Specific Description

### Problem Statement
- The codebase uses positional naming (`left`/`right`) across state, props/events, selector IDs, helpers, and tests.
- Positional naming is ambiguous relative to domain intent because it does not clearly express which branch corresponds to `Model 1` or `Model 2`.
- Some selectors are inconsistent (`models-select` for one side, `models-select-right` for the other), increasing cognitive load and maintenance risk.
- If the UI layout changes (stacked layout, reordered panels, responsive shifts), positional identifiers become misleading and brittle.

### Intended Outcome
- Standardize naming to domain-based semantics:
  - `model1` for the first model flow.
  - `model2` for the second model flow.
- Remove dependency on locational terms (`left`, `right`, `lhs`, `rhs`, or equivalent positional aliases) in relevant implementation and test surfaces.
- Ensure naming clearly indicates ownership of:
  - selected model values,
  - submitted model values,
  - request state/result/error state,
  - UI controls/selectors,
  - helper APIs and test references.
- Keep runtime behavior unchanged unless a behavior change is required solely to complete the semantic rename safely.

### Scope Boundaries
- In scope:
  - Refactoring identifiers, symbols, and selector names tied to the dual-model flow to `model1` / `model2`.
  - Updating component interfaces (props/events) and their call sites to semantic naming.
  - Updating test helpers and test usages to semantic naming.
  - Keeping accessibility labels aligned with `Model 1` / `Model 2` terminology where applicable.
- Out of scope:
  - Functional redesign of request orchestration logic.
  - Adding new model slots or changing the two-model feature scope.
  - Broad UI redesign unrelated to this semantic refactor.
  - Changing unrelated docs/spec artifacts unless directly required for consistency.

### Key Behaviors and Expected User-Visible Results
- User-facing labels continue to clearly show `Model 1` and `Model 2`.
- Internally, code and tests no longer depend on locational concepts to map behavior.
- Selector references and helper names consistently communicate model ownership.
- Existing request/response/error behavior for both model branches remains intact.
- Existing loading and accessibility behavior remains intact (or equivalent) after rename.

### Assumptions and Constraints
- `Model 1` and `Model 2` represent logical roles, not fixed screen positions.
- Refactor should be minimal, safe, and behavior-preserving.
- Backward compatibility for internal symbol names is not required unless needed to avoid breaking external/public contracts.
- Tests must be updated in the same change set to preserve reliability.
- Avoid introducing unnecessary dependencies or architectural changes.

## Non-Goals
- Adding model comparison/summarization features.
- Introducing a third model selector/output.
- Reworking API contracts unrelated to naming semantics.
- Optimizing performance beyond what is required to complete the rename.
