# Technical Design: Fix Error Details Bug

**Source:** `findings-and-implementation-plan.md`
**Spec folder:** `.github/specs/004-fix-error-details-bug/`

---

## Overview

The UI error panel currently shows `Type: Unknown` and omits HTTP status code, upstream `code` (e.g., `model_not_found`), and `type` (e.g., `invalid_request_error`) fields. This design specifies the changes required to surface structured, user-safe error details end-to-end — from the server response through client normalization into the rendered `UiErrorAlert` component — without exposing sensitive backend information.

**Goals:**
- Display structured error details: `category` (type), `statusCode`, `code`, `type`, `param`, and sanitized `details`.
- Eliminate false `unknown` category fallback when typed error metadata is available.
- Preserve HTTP status through the full client-side error handling path.
- Maintain strict security posture: no secrets, tokens, stack traces, auth headers, internal paths, or sensitive internals exposed to UI.
- Maintain backward compatibility with legacy `{ message, details }` payloads.

**Out of scope:** Changes to auth, routing, non-error UI components, and unrelated OpenAI API behavior.

---

## Architecture

### Error flow overview

```
OpenAI API (upstream)
  └─► server/api/respond.post.ts  OR  server/api/models.get.ts
        │  (transforms upstream error into safe ApiErrorResponse DTO)
        └─► Nuxt/H3 createError({ statusCode, data: ApiErrorResponse })
              └─► Browser fetch response (non-OK HTTP)
                    └─► app/app.vue OR app/composables/use-models-state.ts
                          │  (merges response.status into error object)
                          └─► app/utils/error-normalization.ts (normalizeUiError)
                                │  (produces NormalizedUiError with all safe fields)
                                └─► useRequestState / useModelsState (state.error)
                                      └─► UiErrorAlert.vue (renders all present fields)
```

### Key changes by layer

| Layer | Current behavior | Required change |
|---|---|---|
| Server routes | Wrap upstream error as raw text `details` only | Parse upstream JSON; extract `type`, `code`, `param`, `status`, `statusText` into safe DTO |
| Client fetch handlers | Throw `{ message, details }` without status | Merge `response.status` into thrown/passed object |
| `normalizeUiError` | No extraction path for `code`/`type`/`param` | Add coerce functions for these fields; avoid `unknown` when typed data present |
| `NormalizedUiError` type | `{ category, statusCode, message, details? }` | Add optional `code?`, `type?`, `param?` fields |
| `ApiErrorResponse` type | `{ message, details? }` | Add optional `code?`, `type?`, `param?`, `statusText?` fields |
| `UiErrorAlert.vue` | Renders `Type`, `Status Code`, `Details` | Add conditional rows for `Error Code`, `Error Type`, `Param` |

---

## Interfaces

### `ApiErrorResponse` (updated — `types/api.ts`)

```ts
export type ApiErrorResponse = {
  message: string;
  details?: string;
  code?: string;        // e.g., "model_not_found"
  type?: string;        // e.g., "invalid_request_error"
  param?: string;       // e.g., "model"
  statusText?: string;  // e.g., "Bad Request"
};
```

All new fields are optional to maintain backward compatibility.

### `NormalizedUiError` (updated — `app/utils/error-normalization.ts`)

```ts
export type NormalizedUiError = {
  category: UiErrorCategory;  // "api" | "network" | "unknown"
  statusCode?: number;
  message: string;
  details?: string;
  code?: string;    // safe upstream code value, e.g., "model_not_found"
  type?: string;    // safe upstream type value, e.g., "invalid_request_error"
  param?: string;   // safe upstream param value, e.g., "model"
};
```

### Server error DTO extraction (server routes)

Server routes must attempt to parse the upstream response body as JSON before falling back to text. The safe extracted fields to forward in `ApiErrorResponse`:
- `code`: from `upstreamBody.error.code` or `upstreamBody.code`
- `type`: from `upstreamBody.error.type` or `upstreamBody.type`
- `param`: from `upstreamBody.error.param` or `upstreamBody.param`
- `message`: from route-level fixed message (not upstream — avoids leaking upstream message text)
- `details`: sanitized bounded freeform text from upstream body when safe
- `statusText`: from `upstreamResponse.statusText` (safe HTTP standard text)

### `UiErrorAlert` component props (no change to prop type)

The component already accepts `NormalizedUiError`. New optional fields in the type are sufficient; the template needs new conditional rows only.

### New rendered rows in `UiErrorAlert.vue`

```
Type         → error.category   (existing)
Status Code  → error.statusCode (existing, conditional)
Error Type   → error.type       (new, conditional)
Error Code   → error.code       (new, conditional)
Param        → error.param      (new, conditional)
Details      → error.details    (existing, conditional)
```

---

## Data

### Upstream error JSON shape (OpenAI standard)

```json
{
  "error": {
    "message": "The model `gpt-x` does not exist.",
    "type": "invalid_request_error",
    "code": "model_not_found",
    "param": "model"
  }
}
```

Also supported: top-level `type`/`code`/`param` (without nesting under `error`).

### Safe error DTO forwarded to client

The server must never forward the upstream `message` verbatim. It sends a fixed route-level message, forwards safe structural fields (`code`, `type`, `param`, `statusText`), and sets `statusCode` from the HTTP response status.

Example `ApiErrorResponse` sent to client for a 400 model error:
```json
{
  "message": "Request to OpenAI failed.",
  "statusText": "Bad Request",
  "type": "invalid_request_error",
  "code": "model_not_found",
  "param": "model"
}
```

### `NormalizedUiError` after normalization

```json
{
  "category": "api",
  "statusCode": 400,
  "message": "Request to OpenAI failed.",
  "type": "invalid_request_error",
  "code": "model_not_found",
  "param": "model"
}
```

### Status code propagation (client)

Both `app/app.vue` (`handleSubmit`) and `app/composables/use-models-state.ts` (`fetchModels`) must forward `response.status` when throwing/passing the error object to `normalizeUiError`. This is the minimal change to fix F-001.

---

## Validation / Error Handling

### JSON parse failure path (client)

`app/app.vue` must guard `response.json()` with a try/catch. On parse failure, a fallback object `{ statusCode: response.status }` must still be forwarded to `normalizeUiError` so status is preserved and category does not degrade to `unknown` unnecessarily.

### Normalization classification rules (updated)

`normalizeUiError` must be updated to:
1. **Network error** (unchanged): `error instanceof Error` matching network patterns → `category: "network"`, no status.
2. **API error** (extended): object with `message` or `error.message` → `category: "api"`, extract `statusCode`, `code`, `type`, `param`.
3. **Unknown error with status** (new): object without message but with `statusCode` → `category: "api"` if status is 4xx/5xx; do not degrade to `unknown` just because message is absent.
4. **Truly unknown** (unchanged): fallback → `category: "unknown"`, generic message.

### `coerceApiCode` / `coerceApiType` / `coerceApiParam` (new normalizer helpers)

Each follows the same coerce-pattern as existing `coerceApiMessage`:
- Try top-level field first (`error.code`).
- Try nested under `error` (`error.error.code`).
- Return `undefined` if absent.
- Pass through `sanitizeOptionalErrorText` before use.

### Server-side field extraction

Extraction of `code`/`type`/`param` from upstream JSON is server-side only. Fields must:
- Be string values only (no objects, arrays, numbers).
- Be bounded length (enforce ≤ 128 characters per field).
- Be sanitized through `sanitizeOptionalErrorText` (redacts any leaking token-like content).

---

## Security

- **SR-1** (no secret exposure): All upstream fields pass through `sanitizeErrorText` / `sanitizeOptionalErrorText`. `code`, `type`, `param`, `statusText` are treated as potentially tainted and sanitized before forwarding.
- **SR-2** (no upstream message passthrough): Server routes must not forward the upstream `message` field from OpenAI to the client. Use only the fixed route-level message.
- **SR-3** (no stack traces or internal paths): `error.stack`, file paths, and internal hostnames must never appear in any response field.
- **SR-4** (no raw payload passthrough): Server routes must never forward the raw upstream response body as `details`. Only structured, extracted, bounded fields are forwarded.
- **SR-5** (bounded field lengths): `code`, `type`, `param`, `details` must be bounded at ≤ 128 characters each before storing or rendering. Truncate silently if exceeded.
- **SR-6** (display policy allowlist): Only these fields may be rendered in `UiErrorAlert`: `category`, `statusCode`, `type`, `code`, `param`, `message`, `details`. No other error properties may be rendered.

---

## Testing

### Unit tests

| Test file | Scenario |
|---|---|
| `tests/unit/error-normalization.test.ts` | Typed API error with all canonical fields (`type`, `code`, `param`, `status`) normalized correctly |
| `tests/unit/error-normalization.test.ts` | API error with nested `error.code`/`error.type`/`error.param` envelope |
| `tests/unit/error-normalization.test.ts` | Non-OK with no message but with `statusCode` → category `api`, not `unknown` |
| `tests/unit/error-normalization.test.ts` | JSON parse failure path preserves status |
| `tests/unit/error-normalization.test.ts` | Network error: no `code`/`type`/`param` in output |
| `tests/unit/error-normalization.test.ts` | Sanitization: token-like values in `code`/`type` are redacted |
| `tests/unit/ui-error-alert.test.ts` | Renders `Error Code` row when `code` is present |
| `tests/unit/ui-error-alert.test.ts` | Renders `Error Type` row when `type` is present |
| `tests/unit/ui-error-alert.test.ts` | Renders `Param` row when `param` is present |
| `tests/unit/ui-error-alert.test.ts` | Hides all new rows when fields are absent |

### Integration tests

| Test file | Scenario |
|---|---|
| `tests/integration/respond-route.test.ts` | Upstream 400 with OpenAI JSON body (`error.code`, `error.type`, `error.param`) → client DTO includes those fields |
| `tests/integration/respond-route.test.ts` | Upstream non-JSON body → client DTO has no `code`/`type`, but has `statusCode` |
| `tests/integration/respond-route.test.ts` | Upstream message text is NOT forwarded in DTO `message` field |
| `tests/integration/models.test.ts` | Same upstream scenarios for `/api/models` route |

### E2E tests

| Test file | Scenario |
|---|---|
| `tests/e2e/app.spec.ts` | Error with `code: model_not_found` → UI shows `Error Code: model_not_found` |
| `tests/e2e/app.spec.ts` | Error with typed fields → `Type` shows `api`, not `unknown` |
| `tests/e2e/app.spec.ts` | Error with no typed fields → status still shown; `Type: api` when 4xx/5xx |
| `tests/e2e/models-selector.spec.ts` | Models fetch error → same field rendering verified |

---

## Traceability

| Source ID | Design Section | Notes |
|---|---|---|
| F-001 | Data, Interfaces, Validation/Error Handling | Status not propagated from `response.status`; fix in client fetch handlers and normalization |
| F-002 | Validation/Error Handling, Architecture | `unknown` fallback when parse fails or envelope mismatches; fix classification rules |
| F-003 | Interfaces, Data, Architecture | No `code`/`type`/`param` fields in schema; add to `ApiErrorResponse` and `NormalizedUiError` |
| F-004 | Interfaces, Data, Security | Server routes wrap upstream errors too generically; fix extraction and DTO forwarding |
| F-005 | Testing | Insufficient test mocks; expand test coverage for typed envelopes |
| R-001 | Interfaces, Data | Canonical error contract defined in `types/api.ts` and `error-normalization.ts` |
| R-002 | Architecture, Data, Security | Server extraction of `type`, `code`, `param` from upstream JSON |
| R-003 | Architecture, Validation/Error Handling | Client status propagation; JSON parse failure guard |
| R-004 | Validation/Error Handling | Extended normalization classification rules; new coerce helpers |
| R-005 | Interfaces, Testing | `UiErrorAlert` new conditional rows |
| R-006 | Security | Field length bounds, redaction, display policy |
| R-007 | Testing | Regression coverage for real-world envelopes |

---

## Assumptions, Constraints, and Open Questions

### Assumptions
- Upstream OpenAI errors follow the documented envelope shape: `{ error: { message, type, code, param } }`.
- Top-level `type`/`code`/`param` fields (without `error` nesting) must also be supported as a fallback.
- Route-level fixed messages (`RESPOND_ROUTE_ERROR_MESSAGE`, `MODELS_ROUTE_ERROR_MESSAGE`) are preserved for security.

### Constraints
- Backward compatibility: all new fields in `ApiErrorResponse` and `NormalizedUiError` are optional.
- Legacy payloads (`{ message, details }`) must continue to work without changes.
- No upstream message text may be forwarded to the client.
- All new fields are bounded to ≤ 128 characters before rendering.

### Open Questions (from findings-and-implementation-plan.md § 7)

These must be resolved before implementation begins:

1. **OQ-1**: Should user-facing `Type` label in the UI map to the transport `category` (`api`/`network`/`unknown`) or to the upstream provider `type` field value (`invalid_request_error`)? Currently `Type` renders `category`. If it should render upstream `type` instead, the label and field mapping in `UiErrorAlert` must change.
2. **OQ-2**: Should `code` (e.g., `model_not_found`) be shown verbatim to users, or mapped to a human-friendly label? If mapped, a translation table is required and must be maintained.
3. **OQ-3**: What maximum character length should `details` allow before truncation in UI? Recommend 256 characters as default if no preference.
4. **OQ-4**: Should server routes selectively surface safe upstream `message` text (e.g., OpenAI's `"The model does not exist"`) or always use the fixed route-level message? Current design keeps fixed messages for safety.
