# Technical Design: Two Side-by-Side Output Areas

**Source:** `.github/specs/006-two-side-by-side-output-areas/requirements.md`
**Spec folder:** `.github/specs/006-two-side-by-side-output-areas/`

---

## Overview

This update changes only the response/error presentation layout in the app UI:
- Replace the single output area with two equal-width side-by-side output panels.
- Mirror the same success content in both panels.
- Mirror the same error alert content in both panels.

The existing request lifecycle, API usage, and state transitions remain unchanged:
- One submit action still sends one `/api/respond` request.
- Existing request state, prompt validation, and model selection behavior are preserved.

Scope is intentionally narrow to satisfy FR-1 through FR-5 without introducing dual-query behavior.

---

## Architecture

### High-level approach

Use a presentation-only duplication strategy:
1. Keep current request state and submit flow in `app/app.vue` unchanged.
2. Replace the single conditional output section with a two-column grid container.
3. Render two identical panel blocks, each bound to the same request state (`state`).
4. Keep existing components and contracts (`UiErrorAlert`, `NormalizedUiError`) unchanged.

### Affected modules

- `app/app.vue`
  - Main place where success and error output areas are rendered.
  - Will be updated to output two mirrored panels.
- `app/components/UiErrorAlert.vue`
  - Reused as-is inside each mirrored error panel.
- Tests:
  - `tests/unit/app.ui.test.ts` for UI rendering behavior.
  - Optionally `tests/e2e/app.spec.ts` for user-visible mirrored panel checks.

No server modules are affected.

---

## Interfaces

### Existing interfaces reused

- Request state from `useRequestState()`:
  - `status: "idle" | "loading" | "success" | "error"`
  - `data: string | null`
  - `error: NormalizedUiError | null`
- `UiErrorAlert` props:
  - `error: NormalizedUiError`
  - `showRetry?: boolean`

### Interface impact

- No new API contracts.
- No changes to `types/api.ts` required for this feature.
- No changes to `NormalizedUiError` required for this feature.

---

## Data

### State and data flow

The state flow is unchanged:
1. User submits form.
2. `handleSubmit()` performs one fetch to `/api/respond`.
3. Success state stores one `data` string.
4. Error state stores one normalized error object.

Rendering maps one state snapshot to two output panels:
- `status === "success"` + `data`: render same response text in both panels.
- `status === "error"` + `error`: render same `UiErrorAlert` in both panels.

No panel-specific state, no split stores, and no additional reactive branches are introduced.

### Layout behavior

- Desktop: two equal-width columns in one row.
- Narrow screens: responsive stack is permitted, while keeping panel structure identical.

---

## Validation/Error Handling

### Validation

- Prompt validation remains unchanged and occurs before submit.
- Models selector validation/behavior remains unchanged.

### Error handling

- Existing normalization pipeline remains unchanged.
- Both panels read from the same normalized error object.
- Error details visibility behavior remains driven by `UiErrorAlert` logic.

### Failure scenarios

- If response payload is malformed, existing normalized error path remains in effect and is mirrored in both panels.
- Network and API error categories continue using current classification behavior.

---

## Security

### SR-driven design decisions

- No secrets or raw upstream responses are introduced into new rendering paths.
- Existing sanitization/redaction behavior is reused unchanged because both panels consume the same already-normalized UI error.
- No `v-html` or raw HTML rendering is introduced in either panel.

### Security posture impact

- Neutral-to-improved: visual duplication only; no trust boundary changes.
- Server-only OpenAI access remains unchanged.

---

## Accessibility

### AR-driven design decisions

- Preserve current heading and alert semantics in each panel.
- Keep `UiErrorAlert` behavior keyboard-operable and disclosure semantics unchanged.
- Ensure duplicate interactive controls do not create unpredictable focus order.

### A11y implementation notes

- Use clear per-panel headings (e.g., “Output 1”, “Output 2”) so screen-reader users can distinguish regions.
- Keep tab order in DOM order left-to-right for predictable navigation.
- Maintain existing color contrast and focus ring behavior from current styles.

---

## Testing

### Unit testing

Update `tests/unit/app.ui.test.ts`:
- Success path:
  - Assert two output panels render.
  - Assert both contain identical response text.
- Error path:
  - Assert two error panels render.
  - Assert both contain the same error title/message.
  - Assert details toggle presence/absence is mirrored.

### Optional E2E enhancement

Update `tests/e2e/app.spec.ts` with one mirrored-output assertion scenario:
- On success, verify two visible output regions with same response text.

### Regression safety

Run full gates after changes:
- `npm run typecheck`
- `npm test`
- `npm run lint`

---

## Open Questions

None blocking for this design scope.

---

## Traceability

| Requirement ID | Design Section | Notes |
|----------------|----------------|-------|
| FR-1 | Architecture, Data, Testing | Defines two equal-width side-by-side output panels and verifies in tests. |
| FR-2 | Data, Testing | Mirrors success output content in both panels from a single state snapshot. |
| FR-3 | Validation/Error Handling, Data, Testing | Mirrors identical error alert and details-toggle behavior in both panels. |
| FR-4 | Overview, Architecture, Data | Keeps one-request submit/data flow unchanged; no extra calls introduced. |
| FR-5 | Validation/Error Handling, Architecture | Preserves prompt validation, model selector behavior, and control states. |
| TR-1 | Architecture, Interfaces | Constrains implementation to presentation-layer changes only. |
| TR-2 | Interfaces, Validation/Error Handling | Reuses `UiErrorAlert` and existing `NormalizedUiError` contract unchanged. |
| TR-3 | Data, Architecture | Enforces deterministic mirroring from one resolved request state snapshot. |
| TR-4 | Testing | Adds explicit dual-panel mirrored-content coverage. |
| TR-5 | Testing | Requires typecheck/test/lint quality gates after implementation. |
| SR-1 | Security, Validation/Error Handling | Keeps sanitization/redaction behavior intact in mirrored rendering. |
| SR-2 | Security, Architecture | Preserves server-side OpenAI integration trust boundary. |
| SR-3 | Security, Interfaces | Avoids raw HTML injection patterns in new UI rendering. |
| AR-1 | Accessibility, Data | Preserves perceivable panel structure and logical heading hierarchy. |
| AR-2 | Accessibility, Validation/Error Handling | Preserves alert/disclosure keyboard and semantic behavior. |
| AR-3 | Accessibility, Architecture | Avoids focus-order confusion and inaccessible interaction patterns. |
