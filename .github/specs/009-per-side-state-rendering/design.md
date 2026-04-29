# Technical Design — True Per-Side Loading/Success/Error States

## Overview
This design updates response rendering for the dual-query UI so left and right panels render independently throughout request lifecycle transitions. The current aggregate loading gate is replaced with side-local state rendering, while preserving existing submit behavior (one action triggers two requests), existing request-state composables, and existing error normalization paths.

### Goals
- Render left/right panel states independently after submit begins.
- Allow mixed transient and final states (`loading/success/error`) across panels.
- Keep submit disabled while any side is in-flight.
- Preserve existing API contract and error sanitization behavior.

### In Scope
- `app/app.vue` response-region rendering and computed state wiring.
- Unit/e2e/a11y updates proving mixed-state behavior and incremental visibility.
- README wording alignment for per-side state behavior.

### Out of Scope
- Server route contract changes.
- Selector redesign or unrelated UX refactors.

## Architecture
### Current State
- `handleSubmit()` starts both side requests.
- `isLoading` is derived from either side loading.
- Template uses global gating (`v-if="isLoading"` then outputs), which suppresses partially completed side output.

### Target State
- Introduce panel-local content rendering based on each side’s `RequestStatus`.
- Keep a shared container visible after submission starts; each panel renders one of:
  - side loading state
  - side success content
  - side error alert
- Keep aggregate `isLoading` only for submit button disabled/busy behavior.

### Affected Files
- `app/app.vue`
- `tests/unit/app.ui.test.ts`
- `tests/e2e/app.spec.ts`
- `tests/unit/app.a11y.test.ts` and/or `tests/e2e/accessibility.spec.ts` (as needed for updated semantics)
- `README.md` (behavior wording only)

## Interfaces
### UI Surface
- Response region remains two-panel layout (`Model 1`, `Model 2`).
- Panels remain mounted during in-flight execution once submission starts.
- Each panel has side-specific status content:
  - loading indicator text/status
  - success response body
  - `UiErrorAlert` for error

### API Surface
- No changes to `POST /api/respond` request/response shape.
- Client continues sending two requests per submit.

## Data
### State Model
- Reuse existing per-side request states:
  - `leftRequestState`
  - `rightRequestState`
- Keep `isLoading` computed as OR over both sides for control disablement only.
- Introduce/adjust output-visibility computed state to show panels once request lifecycle starts (including mixed states).

### State Flow
1. User submits valid prompt.
2. Both sides transition to `loading`.
3. Side A may transition to `success`/`error` before Side B.
4. Side A panel updates immediately; Side B remains `loading`.
5. When Side B resolves, final mixed/symmetric state is shown.

## Validation/Error Handling
- Prompt validation remains unchanged (`validatePrompt` + focus on invalid).
- Malformed/failed side responses continue through `normalizeUiError` and `fail*Request` per side.
- Rendering ensures one side’s error does not suppress other side’s success output.

## Security
- Preserve request payload constraints (`prompt`, optional `model`) with no additional client-sent fields.
- Preserve existing error sanitization pipeline and avoid rendering raw unnormalized error payloads.
- Preserve in-flight submit disablement to reduce accidental duplicate request bursts.

## Accessibility
- Side loading indicators retain assistive status semantics (`role="status"`/`aria-live` where applicable).
- Error states continue to expose alert semantics via existing error UI.
- Focus behavior for form controls and error interactions remains unchanged.
- Update a11y tests to verify no regressions across idle/loading/mixed/final states.

## Performance
- Rendering is incremental: resolved side updates immediately without waiting for sibling request.
- No additional network requests beyond the existing two per valid submit.
- Template/state changes remain local to response rendering and should not materially affect app startup or fetch paths.

## Testing
### Unit
- Update `tests/unit/app.ui.test.ts` to verify:
  - per-side loading visibility
  - left success + right loading
  - left error + right success
  - right error + left success
  - submit disabled while either side loading

### E2E
- Update `tests/e2e/app.spec.ts` to verify partial completion visibility in browser flow.

### Accessibility
- Keep/update a11y coverage (`tests/unit/app.a11y.test.ts`, `tests/e2e/accessibility.spec.ts`) for side-specific loading and mixed-state output visibility.

### Docs
- Verify `README.md` accurately reflects concurrent side-specific rendering behavior.

## Assumptions and Constraints
- Existing `useRequestState` contract remains authoritative for side status.
- No server API changes are required.
- This design is constrained to requirements in `.github/specs/009/requirements.md`.

## Traceability
| Requirement ID | Design Section | Notes |
|----------------|----------------|-------|
| FR-1 | Architecture; Interfaces; Data | Two mounted panels with independent side-state rendering after submit starts. |
| FR-2 | Interfaces; Data | Per-panel `loading/success/error` content model. |
| FR-3 | Data; Validation/Error Handling; Testing | Mixed-state transitions and rendering validated in tests. |
| FR-4 | Architecture; Interfaces; Data | Single submit still drives two side-local lifecycles. |
| FR-5 | Architecture; Data; Security | Aggregate `isLoading` retained for disabled/busy submit control. |
| TR-1 | Architecture; Interfaces | Remove global loading gate that blocks panel-local rendering. |
| TR-2 | Data; Interfaces | Left/right panels bind only to respective side request state. |
| TR-3 | Data; Assumptions and Constraints | Continue using `useRequestState` as single source of truth. |
| TR-4 | Testing | Unit/e2e additions for progressive and mixed-state rendering. |
| TR-5 | Testing; Docs | README behavior wording aligned to implementation. |
| SR-1 | Security; Interfaces | Preserve request body boundaries and avoid extra fields. |
| SR-2 | Validation/Error Handling; Security | Continue normalized/sanitized error rendering. |
| SR-3 | Security; Data | Keep in-flight submit disablement. |
| AR-1 | Accessibility; Interfaces | Preserve status/alert semantics for side-specific states. |
| AR-2 | Accessibility; Testing | Keep keyboard/focus behavior and validate via tests. |
| AR-3 | Accessibility; Testing | Maintain passing a11y suites across relevant states. |
| PR-1 | Performance; Data | Incremental side updates when each response resolves. |
| PR-2 | Performance; Interfaces | No additional network calls beyond two requests. |
