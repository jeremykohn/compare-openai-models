# Technical Design — Enforce Full `/api/respond` Success Contract (`response` + `model`)

## Overview
This design hardens client success handling for `POST /api/respond` so success is accepted only when both `response` and `model` are present as strings. The UI then uses the server-returned `model` for per-side headings, preventing drift when backend model resolution differs from submitted model IDs.

### Goals
- Enforce strict success-payload validation (`response` + `model`).
- Propagate server-returned model through side-success flow.
- Keep malformed payloads in normalized error path.
- Preserve existing server route contract.

### In Scope
- `app/utils/type-guards.ts` success-guard logic.
- `app/app.vue` side request success return shape and heading source state.
- Unit/integration test updates for contract behavior.

### Out of Scope
- Server contract changes.
- New response metadata fields.
- Unrelated UI or orchestration refactors.

## Architecture
### Current State
- Client success guard effectively accepts `response` alone.
- Heading identity can be tied to submitted model snapshot, not guaranteed server-returned model.

### Target State
- Success guard requires both `response` and `model` strings.
- `runSingleQuery()` returns both values on success.
- Per-side heading state is derived from server-confirmed `model` once side resolves successfully.
- Invalid success-shaped payloads route to existing failure path.

### Affected Files
- `app/utils/type-guards.ts`
- `app/app.vue`
- `tests/unit/app.ui.test.ts`
- `tests/integration/respond-route.test.ts` (contract stability checks)
- `types/api.ts` (only if client typings need explicit synchronization)

## Interfaces
### API Contract
- `POST /api/respond` success contract remains:
  - `{ response: string, model: string }`
- Request contract remains unchanged:
  - `{ prompt: string, model?: string }`

### UI Contract
- Response headings display server-returned model for each side after successful resolution.
- If payload is malformed, side renders normalized error instead of success content.

## Data
### Client Types and Guards
- `isRespondSuccessPayload(payload)` becomes strict:
  - `typeof payload.response === "string"`
  - `typeof payload.model === "string"`
- Side-success result shape from request helper includes both `response` and `model`.

### State Flow
1. Side request returns JSON.
2. Guard validates strict success shape.
3. On valid success: store response text and resolved model for that side.
4. On invalid success shape: normalize and fail side.

## Validation/Error Handling
- Continue current normalization strategy (`normalizeUiError` + logging).
- Treat missing/invalid `model` in nominally successful responses as contract error.
- Preserve side-local fail handling; no global crashes.

## Security
- Deny-by-default success recognition: payload must match strict expected shape.
- Do not trust unvalidated external payload fields.
- Continue sanitized error rendering and avoid raw sensitive data exposure.

## Accessibility
- Heading content source changes must preserve semantic structure (`h2`) and readable labels.
- Existing accessibility semantics for side panels remain unchanged.
- a11y test baselines remain valid after heading source changes.

## Testing
### Unit (`tests/unit/app.ui.test.ts`)
- Add/adjust cases for:
  - valid success payload containing `response` and `model`
  - malformed success payload missing `model`
  - mismatch scenario where submitted model differs from returned model
  - heading reflects returned model

### Integration (`tests/integration/respond-route.test.ts`)
- Preserve/verify assertions that successful route response includes both `response` and `model`.

### Regression Safety
- Ensure existing error-detail behavior and side-specific rendering stay intact.

## Assumptions and Constraints
- Backend route continues returning canonical `{ response, model }` success shape.
- No additional networking or route behavior changes are required.
- This design is scoped to `.github/specs/010/requirements.md`.

## Traceability
| Requirement ID | Design Section | Notes |
|----------------|----------------|-------|
| FR-1 | Architecture; Data; Validation/Error Handling | Strict guard requires both required success fields. |
| FR-2 | Interfaces; Data | Headings sourced from per-side server-returned model. |
| FR-3 | Validation/Error Handling; Security | Malformed payloads route to normalized error path. |
| FR-4 | Interfaces; Architecture | Keep existing route contract unchanged. |
| TR-1 | Data; Architecture | `isRespondSuccessPayload()` strict contract checks. |
| TR-2 | Data; Architecture | `runSingleQuery()` returns both `response` and `model`. |
| TR-3 | Data; Interfaces | Heading derivation from resolved model state. |
| TR-4 | Testing | Unit tests cover success, malformed payload, heading correctness. |
| TR-5 | Testing; Interfaces | Integration checks preserve `{ response, model }` contract. |
| SR-1 | Security; Validation/Error Handling | Positive validation for untrusted external payloads. |
| SR-2 | Security; Validation/Error Handling | Continue sanitized, normalized error rendering. |
| AR-1 | Accessibility; Interfaces | Preserve semantic per-panel heading labeling. |
| AR-2 | Accessibility; Testing | Maintain a11y pass status after contract hardening. |
