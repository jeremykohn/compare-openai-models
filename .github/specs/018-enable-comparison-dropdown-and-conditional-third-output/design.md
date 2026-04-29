# Technical Design: Enable Comparison Dropdown and Conditional Third Output States

**Source:** `.github/specs/018-enable-comparison-dropdown-and-conditional-third-output/requirements.md`
**Spec folder:** `.github/specs/018-enable-comparison-dropdown-and-conditional-third-output/`

---

## Overview

This update enables the existing comparison-model dropdown and makes the third output panel outcome-aware based on Model 1 and Model 2 terminal results.

Target behavior:
- Comparison dropdown becomes interactive and keeps selected state.
- Submit flow remains exactly two requests (Model 1 and Model 2).
- Third panel message is conditional:
  - success/success → italicized dynamic placeholder sentence with model-name substitutions.
  - any error(s) → deterministic comparison-blocked error sentence listing failed model descriptors.

No real comparison request is introduced in this spec.

---

## Architecture

### High-level approach

1. Enable and bind comparison dropdown state in existing app/selector wiring.
2. Preserve current dual-query orchestration unchanged.
3. Derive third-panel mode from existing terminal outcomes of Model 1 and Model 2 request states.
4. Build third-panel text via deterministic string builders:
   - success placeholder builder,
   - errored-model descriptor builder.
5. Keep third panel inside existing output lifecycle and rendering structure.

### Affected files/modules

- `app/components/ModelsSelector.vue`
  - enable `Model for comparing outputs` selector (remove disabled behavior for this control only).
  - keep existing label/control association.
- `app/app.vue`
  - maintain active `selectedModelIdModelComparison` state.
  - compute third-panel mode from outer panel statuses.
  - compute conditional third-panel text with model-name substitutions.
- `app/composables/use-model-query.ts`
  - unchanged behavior; still used only for Model 1/Model 2 request lifecycles.
- `app/components/ModelOutputPanel.vue`
  - unchanged for outer panels.
- Tests:
  - `tests/unit/models-selector.test.ts`
  - `tests/unit/app.ui.test.ts`
  - `tests/unit/app.a11y.test.ts`
  - `tests/e2e/app.spec.ts`

---

## Interfaces

### UI state and component interface updates

#### `ModelsSelector.vue`
- Inputs already present for comparison selector are reused:
  - `selected-model-id-model-comparison`
  - `status`, `models`, `error`, `disabled` (form-level disabled while submitting may still apply globally).
- Events:
  - `update:selected-model-id-model-comparison` remains active and must propagate selection.

#### `app.vue` render contract for third panel
- Third panel keeps existing region placement/lifecycle integration.
- Third panel branch selection:
  - `comparisonMode = "placeholder"` when both outer sides terminal and both successful.
  - `comparisonMode = "error"` when either outer side terminal error exists.
  - preserve existing waiting branch for in-flight state until outer sides terminal.

### API contracts

- `POST /api/respond` request/response contract remains unchanged.
- Per valid submit, exactly two requests continue to be issued.
- Comparison dropdown selection is not sent to server in this spec.

---

## Data

### State model

Existing app state reused:
- `selectedModelIdModel1`
- `selectedModelIdModel2`
- `selectedModelIdModelComparison`
- `model1RequestState`
- `model2RequestState`
- submitted model identifiers used for headings/text

New derived state/computed values:
- `hasModel1Error`
- `hasModel2Error`
- `hasAnyOuterError`
- `hasBothOuterSuccess`
- `erroredModelsList` as ordered list of `Model {number} ({name})`
- `comparisonPlaceholderText`
- `comparisonErrorText`

### Data flow

1. Models list loads once and populates all selectors.
2. User selects Model 1, Model 2, and comparison model.
3. Submit runs current two-request flow (Model 1 + Model 2 only).
4. Outer request states settle.
5. Third panel resolves by branch:
   - any outer error → show `comparisonErrorText`.
   - both outer success → show italicized `comparisonPlaceholderText`.

---

## Validation/Error Handling

- Prompt validation behavior remains unchanged and still gates request execution.
- Third-panel error is UI-composed and deterministic:
  - prefix: `Cannot compare model outputs due to errors when querying `
  - suffix: comma-separated errored descriptors in deterministic numeric order (`Model 1` then `Model 2` when both fail).
- Outer error details/sanitized rendering remain unchanged for Model 1/Model 2 panels.
- Third-panel mode must not suppress outer panel outputs.

---

## Security

- No new API calls or server contracts are introduced.
- Comparison dropdown value remains client-side state only.
- Third-panel error message composition uses fixed text + selected model names only.
- No raw upstream error payloads or sensitive internals are surfaced in third-panel message content.
- Existing sanitization boundary for outer error panels remains intact.

---

## Accessibility

- Enabled comparison dropdown remains label-associated with `Model for comparing outputs`.
- Dropdown must remain keyboard operable when form is interactive.
- Third-panel conditional messages are plain text and perceivable in output region.
- Existing outer output region semantics and error alert behavior must not regress.
- Maintain visible distinction of success placeholder (italic styling) without relying only on color.

---

## Performance

- Request count stays at 2 per valid submission.
- Third-panel branch/message selection is computed from in-memory existing request state.
- No polling, timers, or extra network overhead is introduced.

---

## Testing

### Unit tests

- `tests/unit/models-selector.test.ts`
  - comparison dropdown is enabled and emits updates.
  - existing Model 1/Model 2 behaviors unaffected.

- `tests/unit/app.ui.test.ts`
  - dual success → third panel shows exact interpolated italicized placeholder sentence.
  - model1 error only → third panel error includes only `Model 1 ({name})`.
  - model2 error only → third panel error includes only `Model 2 ({name})`.
  - both errors → comma-separated deterministic order.
  - assert still only two `/api/respond` requests are issued.

### Accessibility tests

- `tests/unit/app.a11y.test.ts`
  - comparison dropdown remains correctly labeled and keyboard reachable.
  - third-panel conditional messages present in accessible text output.
  - existing output semantics remain valid.

### E2E tests

- `tests/e2e/app.spec.ts`
  - verify enabled comparison selector interaction.
  - verify success-path third-panel placeholder interpolation.
  - verify error-path third-panel message composition for one/both failures.
  - verify no third network request is triggered.

### Quality gates

- `npm run typecheck`
- `npm test`
- `npm run lint`

---

## Open Questions

None blocking.

---

## Traceability

| Requirement ID | Design Section | Notes |
|----------------|----------------|-------|
| FR-1 | Architecture; Interfaces; Accessibility; Testing | Enables and binds comparison dropdown as interactive state. |
| FR-2 | Architecture; Interfaces; Data; Performance; Testing | Preserves two-request submit contract; no comparison request execution. |
| FR-3 | Data; Validation/Error Handling; Interfaces; Testing | Defines dual-success placeholder interpolation and italicized rendering. |
| FR-4 | Data; Validation/Error Handling; Testing | Defines one/both-error message format with deterministic model descriptor list. |
| FR-5 | Architecture; Interfaces; Validation/Error Handling; Testing | Keeps third panel in existing output lifecycle and preserves outer panel behavior. |
| TR-1 | Architecture; Interfaces; Data | Activates comparison dropdown state binding in existing app flow. |
| TR-2 | Data; Validation/Error Handling | Derives third-panel mode from existing outer terminal states. |
| TR-3 | Data; Validation/Error Handling; Interfaces | Builds dynamic text from selected/submitted model names. |
| TR-4 | Interfaces; Security; Performance | Preserves network contract and request count. |
| TR-5 | Testing | Expands unit/a11y/e2e coverage for conditional third-panel behavior. |
| TR-6 | Testing | Maintains repository quality gates. |
| SR-1 | Security | Prevents new secret exposure in updated UI paths. |
| SR-2 | Security; Validation/Error Handling | Keeps third-panel message content controlled and sanitized by construction. |
| SR-3 | Security; Performance; Interfaces | No new comparison request surface is introduced. |
| AR-1 | Accessibility; Interfaces; Testing | Ensures enabled comparison dropdown remains correctly labeled and operable. |
| AR-2 | Accessibility; Validation/Error Handling; Testing | Keeps conditional third-panel messaging perceivable and understandable. |
| AR-3 | Accessibility; Testing | Preserves existing output accessibility semantics. |
| PR-1 | Performance; Interfaces; Testing | Confirms request volume remains exactly two per valid submit. |
| PR-2 | Performance; Data | Uses lightweight computed state for conditional third-panel rendering. |

---

**Next step:** `.github/prompts/prompt-4-create-implementation-plan-from-design.md` — pass this `design.md` to generate the implementation plan.
