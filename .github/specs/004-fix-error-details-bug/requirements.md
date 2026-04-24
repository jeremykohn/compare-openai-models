### 1) Executive Summary
- The UI is losing actionable error metadata before rendering, so `Error Details` often degrades to a generic category and omits status/identifier fields.
- The highest-confidence root cause is client-side error normalization being fed incomplete inputs:
  - `response.status` is not propagated when handling non-OK HTTP responses in `app/app.vue` and `app/composables/use-models-state.ts`.
  - Non-JSON or unexpected error payload shapes fall into `unknown` classification in `app/utils/error-normalization.ts`.
- A second root cause is schema mismatch: the current normalized UI error contract has no dedicated field for upstream error codes (for example `code: model_not_found`), or types (for example `type: invalid_request_error`), so those values are not reliably preserved or rendered.
- Security posture is partially good (token redaction exists), but current behavior can still leak raw upstream bodies in `details` and has no explicit allowlist policy for user-visible fields.

### 2) Evidence-Based Findings

**Finding ID**: F-001 (High confidence)
- **Observed behavior**: Status code is frequently missing in UI error details.
- **Likely cause**: Client non-OK handling does not attach HTTP status to the object sent to `normalizeUiError`.
- **Evidence**:
  - `app/app.vue` (`handleSubmit`): on `!response.ok`, calls `normalizeUiError(payload)` where `payload` is JSON body only; `response.status` is not included.
  - `app/composables/use-models-state.ts` (`fetchModels`): on `!response.ok`, throws `{ message, details }` without `statusCode`.
  - `app/utils/error-normalization.ts` (`coerceStatusCode`): only reads `error.statusCode` or `error.status`; if absent, status is dropped.
- **Impact**: UI cannot show `Status Code` row (`UiErrorAlert` only renders it when `typeof error.statusCode === 'number'`).

**Finding ID**: F-002 (High confidence)
- **Observed behavior**: `Type` can become `unknown` despite a failing API request.
- **Likely cause**: Fallback classification path in normalization when payload shape is unexpected or JSON parsing fails.
- **Evidence**:
  - `app/app.vue` (`handleSubmit`): `await response.json()` is not guarded by a parse fallback. If parsing throws, execution enters `catch` and normalizes a thrown parser/runtime error as `unknown`.
  - `app/utils/error-normalization.ts` (`isApiError` + `normalizeUiError`): API classification requires `message` or `error.message`; otherwise it falls back to `unknown`.
  - `app/components/ModelsSelector.vue`: explicit fallback object uses `category: 'unknown'` when `props.error` is absent.
- **Impact**: UI shows generic category and reduced diagnostics, impairing debugging and user guidance.

**Finding ID**: F-003 (High confidence)
- **Observed behavior**: Specific upstream error codes (for example `code: model_not_found`) or types (for example `type: invalid_request_error`) are not shown as first-class fields.
- **Likely cause**: Error schema does not model `code`, `type`, or related fields explicitly across server/client boundary.
- **Evidence**:
  - `types/api.ts` `ApiErrorResponse` only includes `message` and optional `details`.
  - `app/utils/error-normalization.ts` `NormalizedUiError` only includes `category`, `statusCode`, `message`, `details`.
  - `app/components/UiErrorAlert.vue` renders only `Type` (category), `Status Code`, `Details`; no `code`, `type`, or `param` field.
- **Impact**: Valuable machine-readable diagnostics (such as `code: model_not_found`, `type: invalid_request_error`, `param: model`) are either discarded or buried in freeform text.

**Finding ID**: F-004 (Medium confidence)
- **Observed behavior**: Even when upstream returns rich error JSON, UI receives generic message plus opaque details blob.
- **Likely cause**: Server route intentionally wraps upstream failures with a fixed message and raw text details.
- **Evidence**:
  - `server/api/respond.post.ts`: on upstream non-OK, reads `await upstreamResponse.text()` into `details` and sets message to `RESPOND_ROUTE_ERROR_MESSAGE`.
  - `server/api/models.get.ts`: upstream non-OK maps to generic route message and optional sanitized text details.
- **Impact**: Client loses structured fields (`type`, `code`, nested error object), making deterministic UI rendering of identifiers impossible.

**Finding ID**: F-005 (Medium confidence)
- **Observed behavior**: Test coverage validates basic details rendering but does not enforce preservation of status/code/type across realistic Nuxt/H3 error shapes.
- **Likely cause**: Mocks use simplified payloads (`{ message, details }`) and do not reflect all production error envelopes.
- **Evidence**:
  - `tests/e2e/helpers/mock-api.ts` and `tests/unit/app.ui.test.ts` use simple error JSON.
  - No test asserts extraction of `model_not_found`-style codes into dedicated UI fields.
- **Impact**: Regressions in normalization/propagation can pass existing tests.

### 3) Data-Flow Trace
1. **Origin (upstream OpenAI or network failure)**
   - `server/api/respond.post.ts` calls `${baseUrl}/responses`.
   - On non-OK upstream response, server captures `upstreamResponse.text()` and throws `createError({ statusCode, data: { message, details } })`.
   - On thrown exception, server throws 500 with sanitized details.

2. **Server -> browser HTTP response**
   - Browser receives non-OK response from `/api/respond` with some JSON envelope/body.

3. **Client request handling (`app/app.vue`)**
   - `handleSubmit` always runs `await response.json()`.
   - **Drop-off A**: If JSON parsing fails, code enters `catch`; normalized category can become `unknown`.
   - On non-OK with parsed payload, code calls `normalizeUiError(payload)`.
   - **Drop-off B**: HTTP status is not merged into payload, so `statusCode` may be absent.

4. **Normalization (`app/utils/error-normalization.ts`)**
   - `coerceStatusCode` only reads `statusCode`/`status` from error object.
   - `isApiError` requires `message` or `error.message`.
   - **Drop-off C**: If message field is missing or differently nested, classification falls to `unknown`.
  - **Drop-off D**: No dedicated extraction path for upstream `code`/`type`/`param` fields (for example `code: model_not_found`, `type: invalid_request_error`, `param: model`).

5. **State propagation**
   - `useRequestState.fail(normalized)` stores normalized error in `state.error`.

6. **Rendering (`app/components/UiErrorAlert.vue`)**
   - Always shows `Type` from `error.category`.
   - Shows status row only if `error.statusCode` is present.
   - Shows details row only if `error.details` is present.
  - **Drop-off E**: No render slot/field for upstream `code`, `type`, or `param`.

7. **Parallel path for models list (`use-models-state.ts`)**
   - On `!response.ok`, throws `{ message, details }` without status.
   - Same normalization pipeline drops status by construction.

### 4) Security Review
- **Fields safe to show in UI (allowlist)**:
  - User-facing message (sanitized)
  - HTTP status code (numeric only)
  - Stable, non-sensitive upstream error code (for example `code: model_not_found`), type (for example `type: invalid_request_error`), or param (for example `param: model`)
  - Request correlation ID only if generated for user support and non-sensitive

- **Fields that must be redacted/hidden**:
  - API keys, bearer tokens, auth headers (`Authorization`, `Bearer ...`)
  - Internal stack traces, file paths, runtime config values
  - Full upstream raw payloads when they may contain sensitive internals
  - Any secret-like substrings or credentials in nested objects

- **Recommended sanitization/display policy**:
  - Enforce server-side allowlist mapping to a safe error DTO (message, statusCode, category/type, code/identifier, safeDetails).
  - Keep current token/header redaction (`app/utils/error-sanitization.ts`) and extend with stack/path/internal-hostname scrubbing.
  - Never display raw `error.stack`, request headers, or complete upstream response bodies directly.
  - Treat `details` as optional, sanitized, bounded-length plain text only.

### 5) Remediation Plan (No Code Yet)

#### Phase 0: Contract alignment (must happen first)

**Task ID**: R-001
- **Purpose**: Define canonical error contract across server and client.
- **Files likely impacted**: `types/api.ts`, `app/utils/error-normalization.ts`, `server/api/respond.post.ts`, `server/api/models.get.ts`.
- **Acceptance criteria**:
  - Agreed schema includes: `category`, `statusCode`, `message`, optional `code` (identifier), optional sanitized `details`.
  - Schema explicitly forbids sensitive/internal fields.
- **Validation approach (unit/integration/e2e)**:
  - Unit: schema/type-level tests for accepted/rejected shapes.
  - Integration: route tests assert schema shape on failures.
  - E2E: UI verifies expected fields are rendered.

#### Phase 1: Preserve metadata at source

**Task ID**: R-002
- **Purpose**: Ensure server surfaces safe structured fields (including upstream error identifier when safe).
- **Files likely impacted**: `server/api/respond.post.ts`, `server/api/models.get.ts`, `server/types/openai.ts` (if needed).
- **Acceptance criteria**:
  - Non-OK upstream responses are transformed into safe structured error DTO, not only generic message + raw text.
  - `statusCode` is always set from HTTP status when available.
  - Identifier/code (for example `model_not_found`) captured when present and safe.
- **Validation approach**:
  - Integration tests for upstream JSON/text error variants.

**Task ID**: R-003
- **Purpose**: Preserve HTTP status in client error normalization inputs.
- **Files likely impacted**: `app/app.vue`, `app/composables/use-models-state.ts`.
- **Acceptance criteria**:
  - Non-OK handler passes/throws object containing `statusCode: response.status`.
  - JSON parse failure path still keeps status metadata where available.
- **Validation approach**:
  - Unit tests for submit/fetch-models non-OK paths with/without JSON body.

#### Phase 2: Normalize and render richer safe details

**Task ID**: R-004
- **Purpose**: Extend normalization to robustly classify API errors from multiple envelopes and preserve safe `code`.
- **Files likely impacted**: `app/utils/error-normalization.ts`, `app/utils/type-guards.ts`.
- **Acceptance criteria**:
  - Supports known envelopes (top-level, nested under `data`, nested under `error`).
  - Avoids `unknown` fallback when clear API failure metadata exists.
- **Validation approach**:
  - Unit matrix covering envelope variants and parse failure cases.

**Task ID**: R-005
- **Purpose**: Render safe, explicit identifier/code and status in UI error details.
- **Files likely impacted**: `app/components/UiErrorAlert.vue`, possibly `app/components/ModelsSelector.vue` fallback usage.
- **Acceptance criteria**:
  - UI shows `Type`, `Status Code` (when present), and `Error Code` (when present, e.g., `code: model_not_found`), with sanitized details.
  - Existing accessibility semantics remain intact.
- **Validation approach**:
  - Unit component tests + Playwright e2e checks.

#### Phase 3: Security hardening and observability

**Task ID**: R-006
- **Purpose**: Codify redaction and payload-size limits for user-visible details.
- **Files likely impacted**: `app/utils/error-sanitization.ts`, server routes, logging utility.
- **Acceptance criteria**:
  - Sensitive tokens/headers/stack-like data redacted.
  - Details are bounded and plain-text sanitized.
- **Validation approach**:
  - Unit redaction tests + integration tests with malicious payload fixtures.

**Task ID**: R-007
- **Purpose**: Add regression coverage for real-world error envelopes and unknown edge cases.
- **Files likely impacted**: `tests/unit/error-normalization.test.ts`, `tests/unit/app.ui.test.ts`, `tests/integration/respond-route.test.ts`, `tests/e2e/app.spec.ts`.
- **Acceptance criteria**:
  - Tests fail if status/code/type is dropped unexpectedly.
  - Tests fail if secrets leak into rendered details.
- **Validation approach**:
  - Full unit/integration/e2e pipeline.

- **Backward-compatibility considerations**:
  - Continue accepting legacy `{ message, details }` payloads while introducing optional `code` and stronger envelopes.
  - UI should gracefully hide new fields when absent.
  - Maintain current generic fallback message behavior for truly unknown errors.

### 6) Test Plan
- **T-001 Known typed API error (`type: invalid_request_error`, `code: model_not_found`, `param: model`, `status: 400`, `statusText: Bad Request`)**:
  - Simulate upstream error containing all canonical fields and values.
  - Verify normalized category = `api`, status displayed, code displayed, type and param displayed if present, safe message shown.

## Consistency Check

- All error field names (`type`, `code`, `param`, `status`, `statusText`) and their values are used precisely and consistently
- Security constraints (no secrets, tokens, stack traces, internal paths) are preserved

- **T-002 Network error**:
  - Simulate fetch throw (`Failed to fetch`, timeout, abort).
  - Verify category = `network`, no status row, no secret leakage.

- **T-003 Unknown/untyped exception**:
  - Throw non-object / unexpected object.
  - Verify category = `unknown`, generic message preserved, optional safe details behavior.

- **T-004 Status code presence/absence matrix**:
  - Cases: status in body, status only in `response.status`, no status, invalid status.
  - Verify UI status row appears only for valid HTTP code and is not lost when body lacks status.

- **T-005 Envelope compatibility**:
  - Test error payloads at: top-level (`message`), nested `error.message`, nested `data.message`.
  - Verify classification avoids false `unknown`.

- **T-006 Sanitization/redaction behavior**:
  - Inject tokens/auth headers/stack traces/internal paths into message/details.
  - Verify redaction and omission policy before rendering.

- **T-007 Non-JSON error body path**:
  - Non-OK with invalid JSON body.
  - Verify status is still preserved and UI does not collapse to unhelpful unknown when recoverable metadata exists.

### 7) Risks and Open Questions
- **Risks of implementing the fix**:
  - Overexposing backend/upstream internals if structured pass-through is too permissive.
  - Breaking existing tests/components that assume `{ message, details }` only.
  - Inconsistent handling between `/api/respond` and `/api/models` if not standardized.

- **Open questions requiring confirmation before coding**:
  1. Should user-facing `Type` map to transport category (`api/network/unknown`) or upstream provider type (for example `invalid_request_error`)?
  2. Should `code` (`model_not_found`) be shown verbatim to users, or mapped to friendlier text while preserving raw code in a secondary field?
  3. What maximum length should `details` allow in UI before truncation?
  4. Should server route continue generic top-level message for all upstream failures, or selectively surface safe upstream message text?

- **Root-cause candidate ranking and how to verify**:
  1. **RC-1 (Highest confidence)**: missing status propagation in client non-OK paths (`app/app.vue`, `use-models-state.ts`).
     - **Verify**: instrument or test non-OK response with body lacking status but HTTP 4xx/5xx; confirm normalized output lacks status today.
  2. **RC-2 (High confidence)**: normalization falls back to `unknown` for parse failures/unrecognized envelopes.
     - **Verify**: non-OK response with invalid JSON or nested-only message shape; confirm `unknown` category.
  3. **RC-3 (Medium confidence)**: server wraps upstream errors too generically, dropping structured identifiers.
     - **Verify**: integration test with upstream body containing `{ error: { code: "model_not_found" } }`; confirm code is not available as dedicated field in client/UI.
