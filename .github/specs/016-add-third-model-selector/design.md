# Technical Design: Add Third Model Selector for Comparing Outputs

**Source:** `.github/specs/016-add-third-model-selector/requirements.md`
**Spec folder:** `.github/specs/016-add-third-model-selector/`

---

## Overview

This update adds a third, disabled model selector intended as scaffolding for future output-comparison functionality. It is strictly a selector-layer UI extension and does not change query orchestration, request payloads, or output behavior.

Primary outcomes:
- Add a third selector labeled `Model for comparing outputs`.
- Keep the third selector permanently disabled for this release.
- Reuse the same model options as existing selectors.
- Support responsive placement: stacked on mobile; own row below two-column pair on desktop/laptop.
- Preserve existing `Model 1` / `Model 2` behavior end-to-end.

---

## Architecture

### Current State
- `ModelsSelector.vue` renders two `ModelSelectField` controls (`model1-select`, `model2-select`) in a responsive two-column layout at `md` breakpoints.
- `app/app.vue` tracks `selectedModelIdModel1` and `selectedModelIdModel2` and submits only these two models.
- Shared model list is provided by `useModelsState`.

### Target State
1. `ModelsSelector.vue` renders three `ModelSelectField` controls.
2. The third control uses id `model-comparison-select`, label `Model for comparing outputs`, and `disabled` forced to `true`.
3. Selector layout becomes:
   - mobile: one-column stack of all three fields in order;
   - `md+`: top row contains Model 1 + Model 2 in two columns; second row contains comparison selector spanning full width.
4. `app/app.vue` adds local state for third selector (`selectedModelIdModelComparison`) and passes it to `ModelsSelector`, but request flow remains unchanged.
5. Query execution remains exactly two-side (`model1`, `model2`).

### Affected Modules
- `app/components/ModelsSelector.vue`
- `app/app.vue`
- `tests/unit/models-selector.test.ts`
- `tests/unit/app.ui.test.ts` (if selector prop shape assertions are present)
- `tests/unit/app.a11y.test.ts`
- `tests/e2e/helpers/selectors.ts`
- Optional e2e specs only if selector count/order is asserted

No changes expected in:
- server routes (`server/api/*`)
- model/query composables (`app/composables/*`)
- shared API contracts (`types/api.ts`)

---

## Interfaces

### `ModelsSelector.vue` Props/Emits

#### Additions
- Prop: `selectedModelIdModelComparison: string`
- Emit: `update:selectedModelIdModelComparison` with payload `string`

#### Existing interface retained
- Existing props/emits for `Model 1` and `Model 2` remain unchanged.
- Existing `retry` emit remains unchanged.

### Template/Field Interface
- Third `ModelSelectField` config:
  - `id="model-comparison-select"`
  - `label="Model for comparing outputs"`
  - `value` bound to third selector prop
  - `models` and `status` use existing shared values
  - `disabled` forced true (`true || props.disabled` style avoided; pass explicit `true`)
  - `invalid` and `describedBy` follow existing selector pattern for consistency

### App-Level Interface
- `app/app.vue` passes/receives third selector value to/from `ModelsSelector`.
- Submit handler and query calls continue to use only `selectedModelIdModel1` and `selectedModelIdModel2`.

---

## Data

### State
- Existing state retained:
  - `selectedModelIdModel1`
  - `selectedModelIdModel2`
- New state:
  - `selectedModelIdModelComparison` (default `""`)

### Data Flow
1. Models are fetched once via existing `useModelsState`.
2. Same `modelsState.data` drives all three selectors.
3. Third selector remains disabled and display-only.
4. On submit, only model1/model2 values are used by existing `useModelQuery` calls.

---

## Validation/Error Handling

- Existing prompt validation flow remains unchanged.
- Existing selector error behavior remains unchanged:
  - loading hides select controls as currently implemented;
  - error shows `UiErrorAlert` and retry.
- Third selector follows same status-driven rendering context as existing selectors where applicable, while remaining disabled.

---

## Security

- No new request fields are introduced from third selector value.
- No server route contract changes.
- No additional secrets/data exposure surface.
- No unsafe rendering patterns (`v-html`) introduced.

---

## Accessibility

- Third selector has explicit visual + programmatic label.
- Disabled semantics are native and programmatically exposed.
- Existing keyboard flow remains predictable; disabled control remains non-interactive.
- Existing alert/status semantics for selector area are preserved.

---

## Performance

- No additional network calls.
- No additional query execution paths.
- Minimal client overhead: one additional field component using existing reactive data.

---

## Testing

### Unit
- `tests/unit/models-selector.test.ts`
  - assert third selector exists with id `model-comparison-select`;
  - assert label text `Model for comparing outputs *`;
  - assert disabled attribute is always present;
  - assert option parity across all three selectors in success state.

- `tests/unit/app.ui.test.ts`
  - ensure existing two-query behavior remains unchanged (no third query path).

- `tests/unit/app.a11y.test.ts`
  - assert third selector label association and disabled semantics.

### E2E
- `tests/e2e/helpers/selectors.ts`
  - add `getModelComparisonSelect(page)` helper.

- If selector assertions exist in e2e specs, update them to account for the third selector presence while preserving behavior expectations.

### Quality Gates
- `npm run typecheck`
- `npm test`
- `npm run lint`

---

## Open Questions

None blocking for this scoped update.

---

## Traceability

| Requirement ID | Design Section | Notes |
|----------------|----------------|-------|
| FR-1 | Overview; Architecture; Interfaces | Adds third selector while preserving existing two selectors. |
| FR-2 | Interfaces; Accessibility; Testing | Label and required-indicator behavior captured in field config/tests. |
| FR-3 | Architecture; Interfaces; Accessibility | Third selector forced disabled and non-interactive. |
| FR-4 | Data; Architecture; Testing | Same model list source reused for all selectors. |
| FR-5 | Validation/Error Handling; Architecture | Existing loading/error selector behavior retained. |
| FR-6 | Data; Security; Architecture | Third selector state does not enter submit/query payloads. |
| FR-7 | Architecture; Interfaces | Responsive two-row desktop and stacked mobile structure defined. |
| TR-1 | Architecture; Interfaces | Add third `ModelSelectField` in `ModelsSelector.vue`. |
| TR-2 | Interfaces | Prop/emit contract extended for third selector value. |
| TR-3 | Data; Interfaces | `app/app.vue` binds third selector state without query integration. |
| TR-4 | Architecture | Explicit responsive selector layout rules. |
| TR-5 | Testing | Unit/a11y/e2e helper updates defined. |
| TR-6 | Architecture; Testing | Existing model1/model2 behavior preserved with compatibility checks. |
| TR-7 | Testing | Full quality gates required. |
| SR-1 | Security; Data | No new request surface or route contract changes. |
| SR-2 | Security; Validation/Error Handling | Existing sanitization/error boundaries unchanged. |
| AR-1 | Accessibility; Interfaces | Programmatic label association for third selector. |
| AR-2 | Accessibility; Interfaces | Disabled semantics exposed correctly. |
| AR-3 | Accessibility; Architecture | Predictable keyboard/focus behavior preserved. |
| PR-1 | Performance; Architecture | Network call count unchanged. |
| PR-2 | Performance; Data | Minimal reactive/render overhead only. |
