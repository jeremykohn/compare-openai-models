# Requirements: Add Third Model Selector for Comparing Outputs

**Source:** `.github/specs/016-add-third-model-selector/description.md`
**Spec folder:** `.github/specs/016-add-third-model-selector/`

---

## Functional Requirements

### FR-1: Render a Third Selector Control
- The UI SHALL render a third selector control in the model-selection section, in addition to the existing `Model 1` and `Model 2` selectors.
- **Acceptance Criteria:**
  - Three selector controls are visible in non-loading states.
  - Existing `Model 1` and `Model 2` selectors remain present and unchanged in purpose.

### FR-2: Use Required Label for Third Selector
- The third selector SHALL be labeled `Model for comparing outputs`.
- The label SHALL follow the same required-indicator behavior used by existing selectors.
- **Acceptance Criteria:**
  - The visible label text is `Model for comparing outputs *` when selectors are required.
  - The label is programmatically associated with the third selector control.

### FR-3: Keep Third Selector Disabled/Inactive
- The third selector SHALL be disabled in all states for this update.
- Users SHALL NOT be able to interact with or change its value.
- **Acceptance Criteria:**
  - The third selector has disabled semantics in the DOM.
  - Keyboard and pointer interaction do not change the third selector value.

### FR-4: Reuse Existing Model List for Third Selector
- The third selector SHALL use the same model list source as `Model 1` and `Model 2`.
- Option ordering and labels SHALL match the existing selectors when models are available.
- **Acceptance Criteria:**
  - In success state with loaded models, option text/value sequence in selector 3 matches selector 1 and selector 2.
  - In success state with no models, third selector shows the same no-models placeholder behavior pattern as existing selectors, while remaining disabled.

### FR-5: Preserve Existing Loading/Error Selector Behavior
- Existing selector loading and error behavior SHALL remain intact while accommodating the third selector.
- **Acceptance Criteria:**
  - During loading, selectors continue to follow existing loading presentation behavior.
  - During error, existing error alert and retry semantics remain unchanged.

### FR-6: Preserve Existing Query Ownership
- The new third selector SHALL NOT participate in request execution.
- Existing behavior remains: `Model 1` controls query 1 and `Model 2` controls query 2.
- **Acceptance Criteria:**
  - Submissions continue to issue exactly the existing two model queries.
  - No query payload includes third selector value.

### FR-7: Responsive Layout Requirements for Third Selector
- On narrow screens, the third selector SHALL render below the existing two selectors in the vertical stack.
- On wide screens, the existing two selectors SHALL stay side-by-side and the third selector SHALL render in its own row underneath.
- **Acceptance Criteria:**
  - At mobile-size layouts, selector order is `Model 1`, `Model 2`, then `Model for comparing outputs`.
  - At desktop/laptop layouts, selectors 1 and 2 render in the top two-column row, and selector 3 renders in the next row spanning full width.

---

## Technical Requirements

### TR-1: Add Third Selector Binding in `ModelsSelector.vue`
- `ModelsSelector.vue` SHALL add a third `ModelSelectField` instance using the existing field component.
- **Acceptance Criteria:**
  - Third field uses a dedicated id (`model-comparison-select`) and label text per FR-2.
  - Third field consumes existing selector props (`status`, `models`, `required`) and explicit disabled behavior.

### TR-2: Extend Component Contract for Third Selector Value
- `ModelsSelector.vue` SHALL add a third selected-model prop and update emit contract to include third selector update event, following current naming patterns.
- **Acceptance Criteria:**
  - Props include third selected model id value (`selectedModelIdModelComparison` or equivalent established naming).
  - Emits include `update:selectedModelIdModelComparison` (or equivalent) even though the selector is disabled in this release.

### TR-3: Wire App State Without Query Integration
- `app/app.vue` SHALL add local state for the third selector and pass it into `ModelsSelector`, without integrating that value into request orchestration.
- **Acceptance Criteria:**
  - Third selector state is declared and bound.
  - Existing query execution logic remains unchanged for model1/model2 only.

### TR-4: Responsive Structure Must Be Explicit in Selector Template
- Selector container structure SHALL implement a two-row desktop layout and stacked mobile layout without changing existing selector semantics.
- **Acceptance Criteria:**
  - Template structure and utility classes enforce top two-column row + lower full-width row on medium+ breakpoints.
  - No unrelated layout refactors are introduced outside selector area.

### TR-5: Update Automated Coverage
- Unit, a11y, and e2e helper/test coverage SHALL be updated for the third selector.
- **Acceptance Criteria:**
  - Unit tests assert third selector label, disabled state, and option parity.
  - A11y tests assert label association and disabled semantics.
  - E2E selector helper exposes locator for the third selector id.

### TR-6: Preserve Existing Public Behavior for Existing Selectors
- Existing selector ids, labels, update events, and behavior for model1/model2 SHALL remain backward compatible.
- **Acceptance Criteria:**
  - Existing tests for model1/model2 continue to pass with minimal updates only where selector count/order assertions change.

### TR-7: Pass Project Quality Gates
- The change SHALL pass repository quality checks.
- **Acceptance Criteria:**
  - `npm run typecheck` passes.
  - `npm test` passes.
  - `npm run lint` passes.

---

## Security Requirements

### SR-1: No New Request Surface from Third Selector
- The third selector SHALL NOT create a new request path or alter existing request payload contracts.
- **Acceptance Criteria:**
  - No server route signatures change.
  - No third-model field is added to `/api/respond` requests.

### SR-2: Preserve Existing Error/Sanitization Boundaries
- Selector changes SHALL NOT alter existing error normalization/sanitization behavior.
- **Acceptance Criteria:**
  - Existing error display paths are unchanged except for layout placement context.
  - No new unsafe rendering patterns are introduced.

---

## Accessibility Requirements

### AR-1: Programmatic Label Association
- The third selector SHALL have a valid label association (`label[for]` to matching `id`).
- **Acceptance Criteria:**
  - Automated tests can discover the third selector by label text.

### AR-2: Disabled Semantics Exposed to Assistive Technology
- The third selector disabled state SHALL be programmatically exposed.
- **Acceptance Criteria:**
  - Screen-reader and DOM semantics indicate the control is disabled.

### AR-3: Preserve Predictable Focus and Navigation
- Adding the third selector SHALL preserve predictable tab/focus behavior and not regress existing keyboard paths.
- **Acceptance Criteria:**
  - Existing selector and form controls remain keyboard-operable as before.
  - Third selector is skipped or treated as disabled according to native browser behavior.

---

## Performance Requirements

### PR-1: No Additional Network Calls
- This update SHALL NOT introduce additional network requests.
- **Acceptance Criteria:**
  - Model list fetch count remains unchanged.
  - Submit flow still triggers only the existing two model queries.

### PR-2: Minimal Rendering Overhead
- Selector UI extension SHOULD avoid unnecessary recomputation or expensive watchers.
- **Acceptance Criteria:**
  - Third selector reuses existing reactive data sources and field component patterns.

---

## Out of Scope / Non-Goals

- Enabling the third selector.
- Connecting third selector to a third model query.
- Adding or modifying output panels for comparison.
- Any server/composable/API contract change for comparison functionality.

---

## Assumptions and Constraints

- Existing selector implementation uses `ModelSelectField.vue` and should remain the shared field primitive.
- Existing model data source (`modelsState.data`) remains authoritative for all selector options.
- Third selector enablement and comparison behavior are planned for later specs.
- Update scope is limited to selector-layer UI and directly affected tests/helpers.
