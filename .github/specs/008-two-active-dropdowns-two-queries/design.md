# Technical Design: Two Active Dropdowns and Two Queries

**Source:** `.github/specs/008-two-active-dropdowns-two-queries/requirements.md`
**Spec folder:** `.github/specs/008-two-active-dropdowns-two-queries/`

---

## Overview

This update evolves the current two-output UI from mirrored single-query behavior to true dual-query behavior.

Primary outcomes:
- Both model dropdowns are active and independently selectable.
- One send action runs two model-targeted ChatGPT queries with the same prompt text.
- Left and right output areas render independent success/error states.
- Output headings identify both slot and model name:
  - `Response from Model 1 (<model-1-name>)`
  - `Response from Model 2 (<model-2-name>)`

Scope is limited to supporting dual-query side-by-side outputs; no comparison workflow is introduced.

---

## Architecture

### High-level approach

1. Extend selector state from one model value to two model values.
2. Keep one shared models list source for both dropdown controls.
3. Update submit flow to issue two request executions (left model + right model) per valid send.
4. Normalize each request result independently into side-specific state.
5. Render each side from its own state (loading/success/error) and selected model label.

### Affected modules

- `app/components/ModelsSelector.vue`
  - Keep two dropdowns rendered.
  - Make right dropdown interactive.
  - Rename labels to `Model 1` and `Model 2`.
- `app/app.vue`
  - Maintain two selected model values.
  - Submit two requests from one send action.
  - Hold independent left/right request states and output heading model names.
- `app/composables/use-request-state.ts`
  - Reuse existing state pattern either by instantiating per side or introducing a side-indexed wrapper.
- `app/composables/use-models-state.ts`
  - Reused unchanged as shared models source.
- Server route(s) under `server/api/`
  - Keep OpenAI execution server-side.
  - Preserve/extend contract to support dual-query response/error payload handling.
- Tests:
  - `tests/unit/models-selector.test.ts`
  - `tests/unit/app.ui.test.ts`
  - `tests/unit/app.a11y.test.ts`
  - `tests/e2e/app.spec.ts`
  - Integration route tests when request/response contract changes are required.

---

## Interfaces

### UI component contract updates

`ModelsSelector` updates:
- Inputs:
  - `selectedModelIdLeft`
  - `selectedModelIdRight`
  - existing model loading/error props
- Events:
  - `update:selectedModelIdLeft`
  - `update:selectedModelIdRight`
  - existing `retry`

If the component keeps the current prop/event naming shape, equivalent dual-field names are acceptable as long as both selections are independently controllable and testable.

### Submit contract

Client submit operation must carry:
- `prompt`
- `model1` (left selection)
- `model2` (right selection)

Expected server response shape (conceptual):
- `left`: success payload or normalized error payload
- `right`: success payload or normalized error payload

No direct client-to-OpenAI communication is introduced.

---

## Data

### State model

Client state additions:
- `selectedModelIdLeft`
- `selectedModelIdRight`
- side-specific request states:
  - `leftRequestState`
  - `rightRequestState`

Each side tracks:
- status: idle/loading/success/error
- response data (on success)
- normalized error (on failure)
- model name used for rendered heading

### Data flow

1. User selects `Model 1` and `Model 2` from shared options.
2. User enters prompt and submits.
3. Prompt validation runs once; invalid prompt blocks both requests.
4. Two server-side query executions run (parallel or equivalent behavior that preserves independent outcomes).
5. Each side writes to its own state bucket.
6. UI renders each output panel from its corresponding side state.

---

## Validation/Error Handling

### Validation

- Reuse existing prompt validation rules.
- On validation failure, do not start either query.
- Preserve existing model-loading/error retry behavior for both dropdown controls.

### Error handling

- Normalize and sanitize errors independently per side.
- One side error must not suppress the other side response.
- Output panel rendering rules:
  - success panel if side succeeds,
  - error panel with existing sanitized details behavior if side fails.

### Rendering behavior

- Replace static `Output 1`/`Output 2` headings with model-aware headings.
- Heading model name should reflect the model used for that side’s submitted query.

---

## Security

- Keep OpenAI API calls server-side only.
- Do not expose secret runtime config, tokens, headers, stack traces, or internal file paths in client UI.
- Reuse existing sanitization utilities for per-side error details.
- Validate/normalize dual-model inputs server-side before upstream calls.
- Avoid introducing unsafe HTML rendering (`v-html`) for labels/headings/output content.

---

## Accessibility

- Dropdown labels become explicit and distinct (`Model 1`, `Model 2`) with valid label-control associations.
- Preserve keyboard operability for both active dropdowns and submit path.
- Keep prompt validation and output error semantics perceivable by assistive technologies.
- Ensure side-specific output headings provide sufficient context without relying on color alone.

---

## Testing

### Unit

`tests/unit/models-selector.test.ts`
- Both dropdowns enabled (when models available and app not loading).
- Labels are `Model 1` and `Model 2`.
- Option lists remain identical.
- Independent model update events are emitted.

`tests/unit/app.ui.test.ts`
- One submit action triggers dual-query behavior.
- Left request uses left model; right request uses right model.
- Independent left/right success rendering.
- Mixed success/error rendering.
- Output heading text includes model names.

`tests/unit/app.a11y.test.ts`
- Updated label associations for both dropdowns.
- Output regions and error states remain accessible.

### Integration

- If `/api/respond` contract is extended for dual outputs, add/adjust route tests for:
  - dual success,
  - mixed success/error,
  - dual error,
  - sanitization guarantees.

### End-to-End

`tests/e2e/app.spec.ts`
- Select different models left/right.
- Submit once and verify two independent outputs.
- Verify heading text contains selected model names.
- Verify independent error handling by side.

### Quality gates

- `npm run typecheck`
- `npm test`
- `npm run lint`

---

## Open Questions

None blocking for this design.

---

## Traceability

| Requirement ID | Design Section | Notes |
|----------------|----------------|-------|
| FR-1 | Overview, Architecture, Interfaces, Testing | Activates both dropdown controls and verifies behavior. |
| FR-2 | Overview, Interfaces, Accessibility, Testing | Renames labels to `Model 1`/`Model 2` with accessible associations. |
| FR-3 | Architecture, Data, Testing | Keeps shared model list source across both dropdowns. |
| FR-4 | Overview, Architecture, Interfaces, Data, Testing | Defines dual-query submit behavior with side-specific model mapping. |
| FR-5 | Data, Validation/Error Handling, Testing | Requires independent left/right success/error rendering. |
| FR-6 | Validation/Error Handling, Testing, Accessibility | Replaces output headings with model-aware text. |
| FR-7 | Validation/Error Handling, Testing | Preserves existing prompt validation before request execution. |
| FR-8 | Validation/Error Handling, Data, Testing | Preserves model loading/error/retry behavior across dual controls. |
| TR-1 | Architecture | Constrains changes to existing app architecture without unrelated refactors. |
| TR-2 | Interfaces, Data | Introduces independent left/right selected-model state. |
| TR-3 | Data, Validation/Error Handling | Defines independent per-side request/result state model. |
| TR-4 | Architecture, Security, Interfaces | Preserves server-side OpenAI execution boundary. |
| TR-5 | Interfaces, Data, Testing | Defines explicit dual-query request/response contract consistency. |
| TR-6 | Testing | Specifies unit/integration/e2e coverage additions. |
| TR-7 | Testing | Preserves quality gate expectations. |
| SR-1 | Security, Architecture | Prevents client-side secret exposure and keeps server-only trust boundary. |
| SR-2 | Security, Validation/Error Handling | Preserves sanitized per-side error rendering constraints. |
| SR-3 | Security, Interfaces | Requires constrained and validated dual-query inputs. |
| SR-4 | Security, Accessibility | Prevents unsafe HTML rendering for new UI text paths. |
| AR-1 | Accessibility, Interfaces | Ensures clear accessible names and label-control association. |
| AR-2 | Accessibility, Validation/Error Handling | Preserves accessible prompt/error semantics per output region. |
| AR-3 | Accessibility, Data | Preserves logical keyboard focus and operability with two active selectors. |
| AR-4 | Accessibility, Validation/Error Handling | Ensures output regions remain understandable without color-only cues. |
