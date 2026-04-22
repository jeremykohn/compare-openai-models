# Technical Design: Add Error Details Toggle

**Source:** `.github/specs/001-add-error-details-toggle/requirements.md`

**Date:** 2026-04-22

---

## Overview

The application already has a functioning error display component (`UiErrorAlert.vue`), error normalization utility (`error-normalization.ts`), and error sanitization utility (`error-sanitization.ts`). The core gap is that the current error display uses a `<button>` element to toggle details visibility, whereas the requirements specify using the native `<details>/<summary>` HTML element. Additionally, the `NormalizedUiError` type does not carry a `statusCode`, and the full normalized error (including `category`) is currently discarded when set into `useRequestState` — only `message` and `details` strings are stored.

**Summary of changes:**
1. Update `UiErrorAlert.vue` to replace the `<button>`-based toggle with a native `<details>/<summary>` element
2. Extend `NormalizedUiError` to carry an optional `statusCode` field
3. Update `useRequestState` to store a `NormalizedUiError | null` instead of separate `error: string | null` / `errorDetails: string | null` fields
4. Update `app.vue` to pass the full `NormalizedUiError` through state and to `UiErrorAlert`
5. Update `use-models-state.ts` to store `NormalizedUiError | null` for consistency
6. Update all relevant tests

---

## Architecture

### Current State

```
app.vue (handleSubmit)
  → fetch /api/respond
  → on error: normalizeUiError(error) → NormalizedUiError { category, message, details }
  → logNormalizedUiError(...)
  → fail(normalized.message, normalized.details)         ← category is discarded here
      → useRequestState: { error: string, errorDetails: string }
  → UiErrorAlert :message :details                       ← no category or statusCode
      → <button> toggle → shows raw `details` string
```

### Target State

```
app.vue (handleSubmit)
  → fetch /api/respond
  → on error: normalizeUiError(error) → NormalizedUiError { category, statusCode?, message, details? }
  → logNormalizedUiError(...)
  → fail(normalized)                                     ← full NormalizedUiError passed
      → useRequestState: { error: NormalizedUiError | null }
  → UiErrorAlert :error={NormalizedUiError}              ← receives full error
      → <details>/<summary> toggle → shows category, statusCode, message in structured layout
```

### Affected Files

| File | Change Type |
|------|-------------|
| `app/utils/error-normalization.ts` | Extend `NormalizedUiError` with optional `statusCode?: number` |
| `app/composables/use-request-state.ts` | Change `error`/`errorDetails` fields to `error: NormalizedUiError \| null` |
| `app/composables/use-models-state.ts` | Change `error`/`errorDetails` fields to `error: NormalizedUiError \| null` |
| `app/components/UiErrorAlert.vue` | Replace button toggle with `<details>/<summary>`; accept `NormalizedUiError` |
| `app/components/ModelsSelector.vue` | Update prop types if it consumes `error`/`errorDetails` from models state |
| `app/app.vue` | Update `fail()` call and `UiErrorAlert` binding |
| `tests/unit/ui-error-alert.test.ts` | Update to test `<details>/<summary>` behavior |
| `tests/unit/error-normalization.test.ts` | Add test for `statusCode` propagation |
| `tests/e2e/app.spec.ts` | Add test for error details toggle |

---

## Interfaces

### `NormalizedUiError` (updated)

```typescript
// app/utils/error-normalization.ts

export type UiErrorCategory = "network" | "api" | "unknown";

export type NormalizedUiError = {
  category: UiErrorCategory;
  statusCode?: number;       // ← new: HTTP status code when available
  message: string;
  details?: string;
};
```

`statusCode` is populated from HTTP response status codes when the error originates from an API response. It is omitted for network errors and unknown errors.

### `normalizeUiError` update

The `normalizeUiError(error: unknown)` function in `error-normalization.ts` needs to extract and include `statusCode` when the input error object carries a numeric `status` or `statusCode` property (typical of HTTP API error response payloads). A `statusCode` is only included if it is a valid HTTP code (100–599).

```typescript
// Pseudocode for statusCode extraction
function coerceStatusCode(error: unknown): number | undefined {
  if (!error || typeof error !== "object") return undefined;
  const candidate = error as Record<string, unknown>;
  const code = candidate.statusCode ?? candidate.status;
  if (typeof code === "number" && code >= 100 && code <= 599) return code;
  return undefined;
}
```

### `useRequestState` (updated)

```typescript
// app/composables/use-request-state.ts

import type { NormalizedUiError } from "../utils/error-normalization";

type RequestState = {
  status: RequestStatus;
  data: string | null;
  error: NormalizedUiError | null;   // ← replaces error: string | null
                                     //   + errorDetails: string | null
};

export function useRequestState() {
  // ...
  function fail(error: NormalizedUiError): void {   // ← signature change
    state.status = "error";
    state.data = null;
    state.error = error;
  }
  // ...
}
```

The `errorDetails` field is removed; details are now carried within `NormalizedUiError.details`.

### `useModelsState` (updated)

```typescript
// app/composables/use-models-state.ts

type ModelsState = {
  status: RequestStatus;
  data: ReadonlyArray<OpenAIModel> | null;
  usedConfigFilter: boolean;
  showFallbackNote: boolean;
  error: NormalizedUiError | null;   // ← replaces error/errorDetails strings
};
```

`ModelsSelector.vue` currently receives `:error` and `:error-details` as separate string props. These will be consolidated to a single `:error` prop of type `NormalizedUiError | null`.

### `UiErrorAlert.vue` (updated props)

```typescript
// Props (updated)
defineProps<{
  error: NormalizedUiError;
  showRetry?: boolean;
  retryLabel?: string;
  detailsToggleTestId?: string;
  retryButtonTestId?: string;
}>();
```

The `message`, `title`, `details`, and `enableDetailsToggle` props are removed. The `error` object carries all required information. The title "Something went wrong" remains hardcoded in the template.

### `UiErrorAlert.vue` — template structure

```html
<div role="alert" ...>
  <p class="...">Something went wrong</p>
  <p class="...">{{ error.message }}</p>

  <details :data-testid="detailsToggleTestId" class="...">
    <summary class="...">Error Details</summary>
    <dl class="...">
      <div>
        <dt>Type</dt>
        <dd>{{ error.category }}</dd>
      </div>
      <div v-if="error.statusCode">
        <dt>Status Code</dt>
        <dd>{{ error.statusCode }}</dd>
      </div>
      <div v-if="error.details">
        <dt>Details</dt>
        <dd>{{ error.details }}</dd>
      </div>
    </dl>
  </details>

  <button v-if="showRetry" ...>{{ retryLabel }}</button>
</div>
```

Key decisions:
- `<details>` is always rendered when `error` is provided (no `enableDetailsToggle` condition)
- `<details>` is never given the `open` attribute on initial render (collapsed by default — FR-2)
- `<dl>/<dt>/<dd>` provides semantic structure for labeled key-value pairs (AR-1)
- All content rendered via Vue's `{{ }}` interpolation — no `v-html` (SR-3)
- `statusCode` row is conditionally rendered (only when present)
- `details` row is conditionally rendered (only when present)

### `ModelsSelector.vue` (updated)

`ModelsSelector.vue` currently receives `:error` (string) and `:error-details` (string) as separate props. These are consolidated to `:error` (`NormalizedUiError | null`), and the component internally renders `UiErrorAlert` with the full error object.

### `app.vue` (updated bindings)

```html
<!-- Before -->
<UiErrorAlert
  :title="'Something went wrong'"
  :message="state.error"
  :details="state.errorDetails ?? undefined"
  :show-retry="false"
/>

<!-- After -->
<UiErrorAlert
  v-else-if="state.status === 'error' && state.error"
  :error="state.error"
  :show-retry="false"
/>
```

The `fail()` call is updated to pass the full normalized error:

```typescript
// Before
fail(normalized.message, normalized.details);

// After
fail(normalized);
```

---

## Data

### Error Data Flow

```
Error source (fetch catch / response.ok check)
  ↓
normalizeUiError(rawError)
  → NormalizedUiError { category, statusCode?, message, details? }
  ↓
logNormalizedUiError(source, normalized)   ← safe, sanitized logging
  ↓
fail(normalized) → useRequestState.state.error = NormalizedUiError
  ↓
app.vue template: state.error passed as :error prop
  ↓
UiErrorAlert renders:
  - Generic message (top)
  - <details><summary>Error Details</summary>
      category / statusCode (if present) / details (if present)
    </details>
```

### `NormalizedUiError` shape by scenario

| Scenario | `category` | `statusCode` | `message` | `details` |
|---|---|---|---|---|
| Network error (Failed to fetch) | `"network"` | — | Fixed network message | — |
| API error 400 (with message) | `"api"` | `400` | Sanitized API message | Sanitized API details |
| API error 503 (no details) | `"api"` | `503` | Sanitized API message | — |
| Unknown JS error | `"unknown"` | — | Fixed unknown message | Sanitized `Error.message` |
| Unknown non-Error | `"unknown"` | — | Fixed unknown message | — |

### Types location

`NormalizedUiError` and `UiErrorCategory` remain in `app/utils/error-normalization.ts` (no new type file needed).

---

## Validation / Error Handling

### Input Validation in `normalizeUiError`

- `statusCode` is only populated if the value is a finite integer in range 100–599 (SR-2)
- `category` is always one of the known literal values (`"network"`, `"api"`, `"unknown"`) — no free-form strings (SR-2)
- `message` is always a non-empty `string` — falls back to fixed safe strings if raw message is absent or unsafe (SR-2)
- `details` is always sanitized via `sanitizeOptionalErrorText()` which runs regex-based redaction of API keys, bearer tokens, and auth headers (SR-1)

### Rendering Safety in `UiErrorAlert`

- All error fields rendered via `{{ }}` Vue template interpolation (escaped by default — prevents XSS per SR-3)
- No `v-html` used on any error-derived content
- `statusCode` rendered as a number literal; no string interpolation from unknown sources

### Logging

`logNormalizedUiError` logs only the already-sanitized `NormalizedUiError` using `console.error`. The raw error object is never logged to the console (SR-4). Stack traces are not included in client-side logs.

---

## Security

Addresses: SR-1, SR-2, SR-3, SR-4, SR-5

### SR-1: Sanitization
`sanitizeErrorText()` and `sanitizeOptionalErrorText()` in `error-sanitization.ts` already redact:
- API keys matching `sk-[A-Za-z0-9_-]{8,}`
- Bearer tokens
- Authorization headers

These patterns cover the most critical secrets. No changes required to `error-sanitization.ts` for this update, but note the existing coverage in tests.

### SR-2: Input Validation
`normalizeUiError` validates:
- `statusCode`: must be 100–599 integer or omitted
- `category`: always from a closed literal union
- `message`: always a non-empty string (falls back to fixed safe strings)

### SR-3: XSS Prevention
`UiErrorAlert` uses Vue's default `{{ }}` interpolation for all error fields (HTML-escaped). No `v-html` on any error content.

### SR-4: Secure Logging
`logNormalizedUiError` logs only the sanitized `NormalizedUiError`. Raw error object and stack traces are not logged to browser console.

### SR-5: Information Disclosure
`category` values (`"network"`, `"api"`, `"unknown"`) do not reveal system internals. `statusCode` is shown as a numeric code — no human-readable explanation (e.g., "Unauthorized") is shown alongside it. API-origin messages are sanitized before display.

---

## Accessibility

Addresses: AR-1, AR-2, AR-3, AR-4, AR-5, AR-6, AR-7

### AR-1: Semantic HTML
- Outer container: `<div role="alert">` — causes screen readers to announce the generic error message when it is injected into the DOM
- Error details: native `<details>/<summary>` elements — browser-native toggle with built-in keyboard interaction, expanded/collapsed state signaling, and accessible name from `<summary>` text
- Key-value pairs: `<dl>/<dt>/<dd>` structure for labeled error fields

### AR-2 & AR-3: Keyboard Navigation and Focus Visibility
- `<summary>` is natively keyboard-focusable and activatable via Enter and Space (no JavaScript needed)
- No `tabindex` manipulation required
- Browser's default focus outline is preserved (not removed via `outline: none`)
- If custom styling is needed for the focus indicator, it must maintain ≥ 3:1 contrast ratio

### AR-4: Screen Reader Announcements
- `role="alert"` on the outer `<div>` ensures that when the component is injected into the DOM, the generic error message is automatically announced
- The `<details>/<summary>` pattern natively communicates expanded/collapsed state via `aria-expanded` equivalent semantics
- `<summary>` text "Error Details" gives the toggle a clear accessible name

### AR-5: Color Contrast
- Existing error alert styling (red tones on white) must maintain ≥ 4.5:1 text contrast and ≥ 3:1 for non-text elements
- New elements added inside `<details>` (dt/dd labels and values) must also meet ≥ 4.5:1 contrast
- Contrast is validated during implementation against the existing `bg-red-50 text-red-800` palette

### AR-6: Readable Text
- No fixed-width containers that would clip text at 200% zoom
- `<dl>` layout uses `grid` or `flex` for responsive reflow

### AR-7: Plain Language
- `<summary>` label: "Error Details"
- Field labels: "Type", "Status Code", "Details"
- `category` values ("network", "api", "unknown") are lowercase and readable; no jargon beyond what is already present

---

## Performance

Addresses: PR-1, PR-2

### PR-1: Rendering Performance
- `<details>/<summary>` is a native browser element — zero JavaScript for toggle behavior, no re-render triggered on open/close
- Error normalization is synchronous and runs in <1ms for any realistic input
- No `computed` properties or watchers added beyond what already exists

### PR-2: No Regression
- Removing the `<button>` toggle and adding `<details>/<summary>` is effectively a template swap — negligible bundle size impact (well under 2KB)
- The `NormalizedUiError` type change is compile-time only; no runtime overhead
- No new imports, no new dependencies

---

## Testing

Addresses: TR-7

### Unit Tests: `tests/unit/ui-error-alert.test.ts`

Tests to update/add:

| Test | Description |
|---|---|
| Renders generic message | `error.message` appears in DOM |
| Shows `<details>` when error provided | `<details>` element is present |
| `<details>` is collapsed by default | No `open` attribute on initial render |
| Displays error category in details | `error.category` value visible in `<dd>` |
| Displays status code when present | `error.statusCode` row visible |
| Omits status code when absent | Status code row not rendered if `statusCode` undefined |
| Displays sanitized details when present | `error.details` value visible |
| Omits details row when absent | Details row not rendered if `details` undefined |
| Retry button hidden by default | No retry button when `showRetry` is false (default) |
| Retry button emits retry event | Clicking retry button emits `retry` |

The current test uses `wrapper.get("button").trigger("click")` to toggle details. This test must be updated — `<details>/<summary>` toggle does not require a JavaScript click handler and is tested differently (e.g., setting the `open` attribute or checking the details element's presence and content).

### Unit Tests: `tests/unit/error-normalization.test.ts`

Tests to add:

| Test | Description |
|---|---|
| Includes `statusCode` from API error | When error has valid `statusCode`, it is included |
| Omits `statusCode` for network errors | `statusCode` is undefined for network errors |
| Rejects invalid `statusCode` | Status codes outside 100–599 are omitted |

### E2E Tests: `tests/e2e/app.spec.ts`

Tests to add:

| Test | Description |
|---|---|
| Error details toggle is present on error | When `/api/respond` returns error, `<details>` is rendered |
| Error details are collapsed by default | `<details>` does not have `open` attribute on initial error render |
| Error details expand on click | Clicking `<summary>` reveals error category/status/details content |

---

## Requirement Traceability

| Requirement ID | Design Section | Notes |
|---|---|---|
| FR-1 | Interfaces → `UiErrorAlert` template | Generic message rendered from `error.message` |
| FR-2 | Interfaces → `UiErrorAlert` template | `<details>/<summary>` collapsed by default |
| FR-3 | Interfaces → `UiErrorAlert` template; Data → shape table | category, statusCode, details rendered via `<dl>` |
| FR-4 | Data → NormalizedUiError shape by scenario | All error categories handled by `normalizeUiError` |
| FR-5 | Architecture → target state; Interfaces → `useRequestState` | Error is part of reactive state; cleared on `reset()`/`start()` |
| TR-1 | Interfaces → `NormalizedUiError`; Data | Extends existing type with `statusCode` |
| TR-2 | Interfaces → `UiErrorAlert` | Full redesign of component template and props |
| TR-3 | Interfaces → `normalizeUiError`; Validation/Error Handling | `statusCode` extraction added to existing utility |
| TR-4 | Architecture → affected files; Interfaces → `app.vue` | `fail(normalized)` passes full object |
| TR-5 | Interfaces → `useRequestState` | `error: NormalizedUiError \| null` replaces string fields |
| TR-6 | Architecture → target state; Interfaces → `app.vue` | Error flow through submission unchanged except type |
| TR-7 | Testing | All unit, component, E2E test cases listed |
| SR-1 | Security → SR-1; Validation/Error Handling | `error-sanitization.ts` patterns already cover critical data |
| SR-2 | Security → SR-2; Interfaces → `normalizeUiError` | `statusCode` range validation, `category` closed union |
| SR-3 | Security → SR-3; Interfaces → `UiErrorAlert` template | `{{ }}` interpolation only, no `v-html` |
| SR-4 | Security → SR-4; Validation/Error Handling | `logNormalizedUiError` already safe; raw error not logged |
| SR-5 | Security → SR-5; Data → shape table | category/statusCode values are generic, not disclosure-leaking |
| AR-1 | Accessibility → AR-1 | `role="alert"` + `<details>/<summary>` + `<dl>/<dt>/<dd>` |
| AR-2 | Accessibility → AR-2 & AR-3 | Native `<details>` keyboard behavior |
| AR-3 | Accessibility → AR-2 & AR-3 | Browser default focus outline preserved |
| AR-4 | Accessibility → AR-4 | `role="alert"` announces message; `<summary>` label clear |
| AR-5 | Accessibility → AR-5 | Contrast requirements listed for existing + new elements |
| AR-6 | Accessibility → AR-6 | Responsive layout with no fixed-width clipping |
| AR-7 | Accessibility → AR-7 | Plain labels: "Type", "Status Code", "Details" |
| PR-1 | Performance → PR-1 | Native `<details>` — no JS toggle, zero re-render |
| PR-2 | Performance → PR-2 | Template swap only, negligible bundle impact |

---

## Assumptions

1. `ModelsSelector.vue` uses `error` and `errorDetails` string props to display model-fetch errors — these will be consolidated to a single `error: NormalizedUiError | null` prop as part of this update
2. `use-models-state.ts` will store `NormalizedUiError | null` directly (consistent with `use-request-state.ts` change)
3. The existing `error-sanitization.ts` patterns (API keys, bearer tokens, auth headers) are sufficient for the current threat model — no additional patterns required for this update
4. The `<details>/<summary>` element is supported in all target browsers (Chromium, Firefox, WebKit) — Playwright E2E coverage confirms this
5. The `open` attribute is the correct mechanism for testing collapsed/expanded state in unit tests (JSDOM supports `<details>`)
6. The existing `role="alert"` behavior in the current component is correct and should be preserved

---

## Open Questions

None. All requirements are unambiguous and consistent with the existing codebase.

---

**Next Step:** Pass this design to `.github/prompts/prompt-4-create-implementation-plan-from-design.md` to create a phased implementation plan.
