# Technical Design: Two Dropdown Menus (Left Active, Right Inactive)

**Source:** `.github/specs/007-two-dropdown-menus-left-active-right-inactive/requirements.md`
**Spec folder:** `.github/specs/007-two-dropdown-menus-left-active-right-inactive/`

---

## Overview

This update introduces a second model dropdown in the UI while preserving current single-model execution behavior.

Primary intent:
- Render two equally sized dropdown menus side-by-side.
- Keep the left dropdown active and responsible for query model selection.
- Keep the right dropdown visible but disabled/inactive.
- Keep request count, API contracts, and server behavior unchanged.

This is a UI/state-wiring enhancement only; it does not implement multi-query behavior.

---

## Architecture

### High-level approach

1. Extend the model-selection UI to render two controls instead of one.
2. Reuse the same models-state source for both dropdown option sets.
3. Keep the left control bound to existing selected model state.
4. Keep the right control disabled and non-authoritative for submission logic.
5. Keep submit flow unchanged so one request is sent using left-selected model only.

### Affected modules

- `app/components/ModelsSelector.vue`
  - Add/arrange two dropdown controls.
  - Keep existing loading/success/error states and retry interactions.
- `app/app.vue`
  - Continue passing selected model state and update handlers.
  - Ensure only left dropdown value participates in submit payload.
- `app/composables/use-models-state.ts`
  - No behavioral change expected; reused for option data.
- Tests:
  - `tests/unit/models-selector.test.ts`
  - `tests/unit/app.ui.test.ts`
  - Optional e2e updates in `tests/e2e/*.spec.ts` for visible dual-dropdown state.

No server modules are expected to change.

---

## Interfaces

### Existing interfaces reused

- Model list source: `useModelsState().state.data`
- Submit model source: left-side `selectedModelId` value in `app/app.vue`
- `ModelsSelector` props/events (updated shape expected):
  - Existing selected-model binding and update event remain for left dropdown.
  - Add internal presentation for right dropdown that consumes same options and disabled semantics.

### API and contract impact

- No changes to `/api/models` or `/api/respond` request/response contracts.
- No changes to shared API types required unless component prop typing needs explicit right-dropdown fields.
- If new props are introduced for right dropdown display state, they remain UI-local and backward-compatible with existing app wiring.

---

## Data

### State flow

- Models options:
  - Both dropdowns read from the same models list (`modelsState.data`).
- Left dropdown:
  - Bound to existing selected model state.
  - Drives the model included in submit payload.
- Right dropdown:
  - Mirrors options only.
  - Disabled; no state write-back for query selection.

### Submit data flow

1. User selects model in left dropdown (optional).
2. User submits prompt.
3. Existing submit handler builds payload using left dropdown value only.
4. One `/api/respond` request is sent.

No additional requests, parallel queries, or right-side model payload fields are introduced.

---

## Validation/Error Handling

### Validation

- Prompt validation remains unchanged.
- Existing model-loading and selector-required semantics remain unchanged for left dropdown.

### Error handling

- Existing models fetch error behavior remains unchanged and should still surface via current `ModelsSelector` error state.
- Existing submit error behavior remains unchanged.

### Disabled control behavior

- Right dropdown explicitly uses disabled semantics and cannot receive interactive value changes.
- If right dropdown needs a default displayed selection, it should not affect submit state.

---

## Security

### SR-driven decisions

- Keep OpenAI request execution server-side only; no client-side secret access changes.
- Use existing safe text rendering for option labels; do not introduce raw HTML rendering (`v-html`).
- Preserve current sanitized error rendering pathways in model-load and submit error flows.

### Security scope impact

- No new data trust boundaries.
- No new user-controlled input surfaces beyond existing dropdown selection.

---

## Accessibility

### AR-driven decisions

- Provide clear labels and control associations for both dropdowns.
- Ensure right dropdown exposes correct disabled semantics (`disabled`, `aria-disabled` as needed by existing component conventions).
- Preserve predictable keyboard tab order and existing form operability.
- Preserve perceivable loading/error messaging and avoid color-only distinction for inactive state.

### Accessibility implementation notes

- Keep left dropdown in normal tab sequence.
- Right disabled dropdown should be perceivable but not operable.
- Ensure helper text and error text associations remain valid with two controls.

---

## Testing

### Unit tests

Update `tests/unit/models-selector.test.ts` to verify:
- Two dropdown controls render in success state.
- Left dropdown is enabled and interactive.
- Right dropdown is disabled/inactive.
- Both controls show equivalent option lists.

Update `tests/unit/app.ui.test.ts` to verify:
- Existing submit behavior still uses left-selected model.
- No regressions in loading/error states with dual-dropdown UI.

### Optional E2E

- Add/adjust e2e assertions to confirm dual-dropdown presence and disabled right dropdown behavior.

### Quality gates

- `npm run typecheck`
- `npm test`
- `npm run lint`

---

## Open Questions

None blocking for this scope.

---

## Traceability

| Requirement ID | Design Section | Notes |
|----------------|----------------|-------|
| FR-1 | Overview, Architecture, Data, Testing | Implements two side-by-side equal-size dropdowns and validates in tests. |
| FR-2 | Data, Interfaces, Testing | Reuses same model options source for both controls with matching list/order. |
| FR-3 | Data, Validation/Error Handling, Interfaces | Keeps left dropdown active and authoritative for submit model selection. |
| FR-4 | Data, Validation/Error Handling, Accessibility | Keeps right dropdown disabled and non-authoritative for requests. |
| FR-5 | Overview, Architecture, Data | Preserves one-request flow and existing response/error behavior. |
| FR-6 | Validation/Error Handling, Testing | Preserves model loading/error/retry behavior in selector surface. |
| TR-1 | Architecture, Interfaces | Limits implementation to UI/composable wiring; no server contract changes. |
| TR-2 | Data, Architecture | Reuses single models-state source; avoids duplicated fetch/state stores. |
| TR-3 | Data, Interfaces | Maintains existing submit contract using left-side model source only. |
| TR-4 | Testing | Adds/updates unit (and optional e2e) coverage for dual-dropdown behavior. |
| TR-5 | Testing | Requires full typecheck/test/lint gates. |
| SR-1 | Security, Architecture | Preserves server-side trust boundaries and no client secret access changes. |
| SR-2 | Security, Interfaces | Prevents introduction of unsafe HTML/injection rendering patterns. |
| SR-3 | Security, Validation/Error Handling | Preserves sanitized error-display pathways. |
| AR-1 | Accessibility, Interfaces | Ensures accessible naming and associations for both controls. |
| AR-2 | Accessibility, Validation/Error Handling | Ensures proper disabled semantics and non-interactive right control behavior. |
| AR-3 | Accessibility, Data | Preserves predictable focus order and keyboard operability of form flow. |
| AR-4 | Accessibility, Validation/Error Handling | Preserves readable loading/error communication and non-color-only state cues. |
