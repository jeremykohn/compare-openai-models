# Technical Design: Fix Issues from TypeScript/Vue Review

**Source:** `requirements.md`
**Spec folder:** `.github/specs/005-fix-issues/`

---

## Overview

This design addresses the prioritized issues in `.github/specs/005-fix-issues/requirements.md` (issue checklist `I-001` through `I-006`).

Primary goals:
- Remove compile/runtime risk in `app/app.vue` success handling.
- Harden payload validation for successful `/api/models` responses.
- Improve API error classification when `message` is absent but typed metadata is present.
- Enforce consistent `details` truncation/sanitization policy.
- Add regression coverage for malformed success payloads.

Scope is limited to app/server error handling and related unit/integration tests. No unrelated refactors.

---

## Architecture

### High-level approach

1. Add explicit runtime guards for success payloads before state transitions to `success`.
2. Treat malformed success payloads as normalized API/unknown errors rather than unsafe casts.
3. Expand API classification heuristics in `type-guards`/normalization to support typed metadata-only envelopes.
4. Apply one consistent sanitization + truncation path for user-visible `details`.
5. Add targeted tests for malformed success shapes to prevent regressions.

### Affected areas

- Client submit flow: `app/app.vue`
- Models fetch flow: `app/composables/use-models-state.ts`
- Error detection and normalization: `app/utils/type-guards.ts`, `app/utils/error-normalization.ts`
- UI and state consumers remain compatible (`NormalizedUiError` contract unchanged)
- Tests: unit and integration specs listed in the issue checklist

---

## Interfaces

### Runtime payload guards

Add internal guard utilities (module-local helpers) for runtime checks:

- `isRespondSuccessPayload(value)`
  - Accepts payloads with at least `response: string`
  - Optional `model` passthrough accepted
- `isModelsApiResponsePayload(value)`
  - Validates expected shape:
    - `object === "list"`
    - `data` is an array
    - `usedConfigFilter` and `showFallbackNote` are booleans

These are runtime checks only; no external API contract changes.

### Error normalization contract

`NormalizedUiError` remains:
- `category`
- `statusCode?`
- `message`
- `details?`
- `code?`
- `type?`
- `param?`

Behavioral change only: classification can produce `api` when typed metadata/status is present without `message`.

---

## Data

### Data flow changes

#### `app/app.vue`

Current risk:
- `normalizedInput` is cast to a success payload and `response` is read unconditionally.

Target behavior:
- On `response.ok`, only call `succeed()` when runtime guard confirms a valid success payload.
- If payload is malformed, normalize as error and call `fail()`.

#### `app/composables/use-models-state.ts`

Current risk:
- `response.ok` payload is assumed to be `ModelsApiResponse`.

Target behavior:
- Validate payload shape first.
- If invalid, normalize/fail and avoid entering `success` state with invalid data.

#### `app/utils/error-normalization.ts`

Current gap:
- `details` truncation is guaranteed in fallback path but not consistently in API details path.

Target behavior:
- Apply the same sanitization + max-length policy (`256`) across all user-visible `details` outputs.

---

## Validation/Error Handling

### Classification rules update

Enhance API error detection to classify as API when any of these are present:
- `message` or `error.message`
- typed metadata (`type`, `code`, `param`) at top-level or nested `error`
- valid `status` / `statusCode` in HTTP error range

Network detection remains highest precedence.

### Malformed success payload handling

For both submit and models fetch flows:
- Treat malformed successful payloads as error conditions.
- Normalize via `normalizeUiError(...)` and log via existing error logger.
- Do not throw untyped runtime errors to UI.

---

## Security

Security posture must remain unchanged or stricter:
- Continue using `sanitizeErrorText` / `sanitizeOptionalErrorText`.
- Continue redacting token-like values.
- Continue restricting `details` to bounded output.
- Do not expose stack traces, auth headers, internal paths, or raw sensitive payload content.

Policy update:
- Use a consistent max length (`256`) for any user-visible `details`, including API-details paths.

---

## Testing

### Unit tests

- `tests/unit/app.ui.test.ts`
  - Add case: `/api/respond` returns `ok: true` but invalid body shape -> app enters error flow safely.
- `tests/unit/models-selector.test.ts`
  - Add case(s) for malformed models success payload effects from state/composable behavior.
- `tests/unit/error-normalization.test.ts`
  - Add/adjust cases for:
    - typed metadata without `message`
    - consistent `details` truncation in API details path
- `tests/unit/ui-error-alert.test.ts`
  - Verify existing display behavior remains compatible when normalization classification changes.

### Integration tests

- `tests/integration/models.test.ts`
  - Add/adjust malformed success payload scenario if route-facing behavior requires it.

### Quality gate

Run (per checklist):
- `npm run typecheck`
- `npm test`
- `npm run lint`

---

## Open Questions

None blocking for implementation based on current checklist scope.

---

## Traceability

| Requirement ID | Design Section | Notes |
|----------------|----------------|-------|
| I-001 | Data, Validation/Error Handling, Testing | Guard submit success payload before `succeed()` |
| I-002 | Interfaces, Data, Validation/Error Handling, Testing | Guard models success payload shape before success state |
| I-003 | Validation/Error Handling, Interfaces, Testing | Broaden API classification signals when `message` is absent |
| I-004 | Data, Security, Testing | Apply uniform `details` truncation policy (256) |
| I-005 | Testing, Data | Add malformed success payload regression coverage |
| I-006 | Testing | Final typecheck/test/lint validation gate |

---

**Next step:** `.github/prompts/prompt-4-create-implementation-plan-from-design.md` — pass this `design.md` to create an implementation plan.
