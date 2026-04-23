# Technical Design: Fix Error Details Bug

**Source:** `findings-and-implementation-plan.md`
**Spec folder:** `.github/specs/004-fix-error-details-bug/`

---

## Overview

The UI error panel currently shows `Type: Unknown` and omits HTTP status code, upstream `code` (e.g., `model_not_found`), and upstream `type` (e.g., `invalid_request_error`) fields. This design specifies the changes required to surface structured, user-safe error details end-to-end — from the server response through client normalization into the rendered `UiErrorAlert` component — without exposing sensitive backend information.

**Goals:**
- Display structured error details: internal `category`, `statusCode`, `code`, `type`, `param`, and sanitized `details`.
- Ensure the user-facing `Type` label maps to upstream provider `type`.
- Show `code` values verbatim to users (for example `model_not_found`).
- Add a safe fallback for unsupported upstream error payload formats by showing sanitized stringified payload content in `details`.
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
                                      └─► UiErrorAlert.vue
                                            (renders Type from error.type,
                                             code verbatim,
                                             and sanitized details fallback)
```

### Key changes by layer

| Layer | Current behavior | Required change |
|---|---|---|
| Server routes | Wrap upstream error as raw text `details` only | Parse upstream JSON; extract `type`, `code`, `param`, `status`, `statusText` into safe DTO; for unsupported payload format, pass sanitized stringified payload into `details` |
| Client fetch handlers | Throw `{ message, details }` without status | Merge `response.status` into thrown/passed object |
| `normalizeUiError` | No extraction path for `code`/`type`/`param`; weak unsupported-format handling | Add coerce functions for these fields; detect unsupported payload format and preserve sanitized stringified payload in `details` |
| `NormalizedUiError` type | `{ category, statusCode, message, details? }` | Add optional `code?`, `type?`, `param?` fields |
| `ApiErrorResponse` type | `{ message, details? }` | Add optional `code?`, `type?`, `param?`, `statusText?` fields |
| `UiErrorAlert.vue` | Renders `Type`, `Status Code`, `Details` | Render `Type` from upstream `error.type`; add conditional rows for `Error Code`, `Param` |

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
  category: UiErrorCategory;  // internal routing/logic: "api" | "network" | "unknown"
  statusCode?: number;
  message: string;
  details?: string;
  code?: string;    // shown verbatim when present, e.g., "model_not_found"
  type?: string;    // shown as user-facing Type when present, e.g., "invalid_request_error"
  param?: string;   // e.g., "model"
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

If upstream payload format is unsupported, routes must set `details` to a sanitized stringified representation of the full payload.

### `UiErrorAlert` component props (no change to prop type)

The component already accepts `NormalizedUiError`. New optional fields in the type are sufficient; template bindings need to use the updated mapping.

### New rendered rows in `UiErrorAlert.vue`

```
Type         → error.type       (display this when present)
Status Code  → error.statusCode (existing, conditional)
Error Code   → error.code       (new, conditional; shown verbatim)
Param        → error.param      (new, conditional)
Details      → error.details    (existing, conditional)
```

If `error.type` is absent, UI may display a deterministic fallback label/value without exposing raw internals.

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

### Unsupported-format upstream payload example

```json
{
  "detail": "422: The model gpt-5-gibberish does not exist."
}
```

When the payload format is unsupported for structured extraction, use sanitized stringified payload for `details` fallback.

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

### Unsupported-format fallback after normalization

```json
{
  "category": "api",
  "statusCode": 422,
  "message": "Request to OpenAI failed.",
  "details": "{\"detail\":\"422: The model gpt-5-gibberish does not exist.\"}"
}
```

`details` fallback must be sanitized and truncated to a maximum of 256 characters.

### Status code propagation (client)

Both `app/app.vue` (`handleSubmit`) and `app/composables/use-models-state.ts` (`fetchModels`) must forward `response.status` when throwing/passing the error object to `normalizeUiError`. This is the minimal change to fix F-001.

---

## Validation / Error Handling

### JSON parse failure path (client)

`app/app.vue` must guard `response.json()` with a try/catch. On parse failure, a fallback object `{ statusCode: response.status }` must still be forwarded to `normalizeUiError` so status is preserved and category does not degrade to `unknown` unnecessarily.

### Unsupported-format payload fallback path

If the upstream error payload cannot be mapped to supported structured shapes (`error.type`, `error.code`, `error.param`, top-level equivalents), normalization must:
1. Sanitize the full stringified payload.
2. Store it in `details`.
3. Truncate `details` to 256 characters.
4. Preserve `statusCode` when available.

### Normalization classification rules (updated)

`normalizeUiError` must be updated to:
1. **Network error** (unchanged): `error instanceof Error` matching network patterns → `category: "network"`, no status.
2. **API error (structured)**: object with `message` or `error.message` → `category: "api"`, extract `statusCode`, `code`, `type`, `param`.
3. **API error (unsupported format)**: object without supported typed fields but with parseable payload and/or 4xx/5xx status → `category: "api"`, set sanitized stringified payload to `details`.
4. **Unknown error with status**: object without message but with `statusCode` → `category: "api"` if status is 4xx/5xx.
5. **Truly unknown** (unchanged): fallback → `category: "unknown"`, generic message.

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

`details` must be sanitized and capped at **256** characters before storing or rendering.

---

## Security

- **SR-1** (no secret exposure): All upstream fields pass through `sanitizeErrorText` / `sanitizeOptionalErrorText`. `code`, `type`, `param`, `statusText`, and unsupported-format stringified payload content are treated as tainted and sanitized before forwarding.
- **SR-2** (no upstream message passthrough): Server routes must not forward the upstream `message` field from OpenAI to the client. Use only fixed route-level messages.
- **SR-3** (no stack traces or internal paths): `error.stack`, file paths, and internal hostnames must never appear in any response field.
- **SR-4** (controlled payload fallback): Unsupported payload fallback may use full stringified payload only after sanitization, then truncation to 256 characters.
- **SR-5** (bounded field lengths): `code`, `type`, and `param` are bounded at ≤ 128 characters; `details` is bounded at ≤ 256 characters. Truncate silently if exceeded.
- **SR-6** (display policy allowlist): Only these fields may be rendered in `UiErrorAlert`: `type`, `statusCode`, `code`, `param`, `message`, `details`. Internal `category` remains available for logic but is not required as the user-facing `Type` value.

---

## Testing

### Unit tests

| Test file | Scenario |
|---|---|
| `tests/unit/error-normalization.test.ts` | Typed API error with all canonical fields (`type`, `code`, `param`, `status`) normalized correctly |
| `tests/unit/error-normalization.test.ts` | API error with nested `error.code`/`error.type`/`error.param` envelope |
| `tests/unit/error-normalization.test.ts` | Unsupported-format payload falls back to sanitized stringified payload in `details` |
| `tests/unit/error-normalization.test.ts` | `details` is truncated at 256 characters |
| `tests/unit/error-normalization.test.ts` | Non-OK with no message but with `statusCode` → category `api`, not `unknown` |
| `tests/unit/error-normalization.test.ts` | JSON parse failure path preserves status |
| `tests/unit/error-normalization.test.ts` | Sanitization removes token-like content from fallback stringified payload |
| `tests/unit/ui-error-alert.test.ts` | `Type` row displays upstream `type` value |
| `tests/unit/ui-error-alert.test.ts` | `Error Code` row displays verbatim `code` value (e.g., `model_not_found`) |
| `tests/unit/ui-error-alert.test.ts` | `Param` row renders when `param` is present |
| `tests/unit/ui-error-alert.test.ts` | Hides rows when optional fields are absent |

### Integration tests

| Test file | Scenario |
|---|---|
| `tests/integration/respond-route.test.ts` | Upstream 400 with OpenAI JSON body (`error.code`, `error.type`, `error.param`) → client DTO includes those fields |
| `tests/integration/respond-route.test.ts` | Upstream unsupported-format body (`detail` or unexpected JSON shape) → DTO includes sanitized stringified payload in `details` |
| `tests/integration/respond-route.test.ts` | Upstream message text is NOT forwarded in DTO `message` field; fixed route message is preserved |
| `tests/integration/models.test.ts` | Same scenarios for `/api/models` route |

### E2E tests

| Test file | Scenario |
|---|---|
| `tests/e2e/app.spec.ts` | Error with `type: invalid_request_error` → UI `Type` shows `invalid_request_error` |
| `tests/e2e/app.spec.ts` | Error with `code: model_not_found` → UI shows `Error Code: model_not_found` verbatim |
| `tests/e2e/app.spec.ts` | Unsupported-format error payload → UI `Details` shows sanitized stringified fallback (max 256 chars) |
| `tests/e2e/models-selector.spec.ts` | Models fetch error path verifies same `Type`/`code`/fallback rules |

---

## Traceability

| Source ID | Design Section | Notes |
|---|---|---|
| F-001 | Data, Interfaces, Validation/Error Handling | Status not propagated from `response.status`; fix in client fetch handlers and normalization |
| F-002 | Validation/Error Handling, Architecture | `unknown` fallback when parse fails or envelope mismatches; structured and unsupported-format API classification added |
| F-003 | Interfaces, Data, Architecture | No `code`/`type`/`param` fields in schema; add to `ApiErrorResponse` and `NormalizedUiError`; map UI `Type` to upstream `type` |
| F-004 | Interfaces, Data, Security | Server routes wrap upstream errors too generically; add typed extraction and safe unsupported-format fallback |
| F-005 | Testing | Insufficient test mocks; expand test coverage for typed and unsupported envelopes |
| R-001 | Interfaces, Data | Canonical error contract defined in `types/api.ts` and `error-normalization.ts` |
| R-002 | Architecture, Data, Security | Server extraction of `type`, `code`, `param` from upstream JSON; fixed server messages retained |
| R-003 | Architecture, Validation/Error Handling | Client status propagation; JSON parse failure guard |
| R-004 | Validation/Error Handling | Extended normalization classification rules; new coerce helpers; unsupported-format fallback |
| R-005 | Interfaces, Testing | `UiErrorAlert` maps `Type` to upstream `type`; code shown verbatim |
| R-006 | Security | Field length bounds, redaction, display policy |
| R-007 | Testing | Regression coverage for real-world typed and unsupported envelopes |

---

## Assumptions, Constraints, and Open Questions

### Assumptions
- Upstream OpenAI errors may follow standard envelope shape: `{ error: { message, type, code, param } }`.
- Top-level `type`/`code`/`param` fields (without `error` nesting) must also be supported as a fallback.
- Unsupported payload formats are expected in some integrations and must be handled deterministically.

### Constraints
- Backward compatibility: all new fields in `ApiErrorResponse` and `NormalizedUiError` are optional.
- Legacy payloads (`{ message, details }`) must continue to work without changes.
- No upstream message text may be forwarded to the client.
- `code`, `type`, and `param` are bounded to ≤ 128 characters.
- `details` is bounded to ≤ 256 characters.

### Resolved Decisions
1. **OQ-1 resolved**: User-facing `Type` maps to upstream provider `type` field value.
2. **OQ-2 resolved**: `code` values (e.g., `model_not_found`) are shown verbatim.
3. **OQ-3 resolved**: Maximum `details` length is 256 characters.
4. **OQ-4 resolved**: Server routes keep fixed messages for safety.

## Consistency Check

- Unsupported payload fallback is included and sanitized before display.
- User-facing `Type` maps to upstream `type`.
- `code` values are displayed verbatim.
- `details` maximum length is 256 characters.
- Fixed server messages are retained for safety.
