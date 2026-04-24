# Discrepancy Report: Code Modifications vs. Design

## Current Run Summary

- **Run Date:** 2026-04-23
- **Branch:** try-prompts-for-making-updates
- **Resolved Default Branch Ref:** main
- **Review Boundary:** `git diff $(git merge-base HEAD main) HEAD --name-only`
- **Implementation Plan:** `.github/specs/004-fix-error-details-bug/implementation-plan.md`

---

## Open Discrepancies

None. All design requirements have been correctly implemented in the current working directory.

---

## Resolved Since Last Run

**DISC-1 [critical]:** Incorrect field rendered for user-facing Type
- **Expected:** `UiErrorAlert.vue` template should render upstream error `type` field as the user-facing Type value.
- **Actual (Initial):** Git commit showed `{{ error.category }}` in the Type row, which would display internal routing category instead of upstream provider type.
- **Actual (Corrected):** Working directory correctly renders `{{ error.type }}` with conditional `v-if="error.type"` guard.
- **Design Violation:** SR-6 (display policy allowlist - only permitted fields may render), SR-7 (no user-facing unknown type).
- **Resolution Evidence:** 
  - File `app/components/UiErrorAlert.vue` line 44 now shows correct binding: `<dd>{{ error.type }}</dd>`
  - Conditional render guard present: `<dt v-if="error.type">Type</dt>`
  - E2E test `tests/e2e/app.spec.ts` line 110-111 expects this behavior and validates correct rendering.
  - Full test suite (unit + integration + e2e) passes with corrected code.
- **Status:** Corrected in working directory; awaiting commit.

---

## Historical Discrepancies

None.

---

## Design Verification Summary

All sections of `.github/specs/004-fix-error-details-bug/design.md` have been verified:

| Design Section | Requirement | Verification | Status |
|---|---|---|---|
| Interfaces | `ApiErrorResponse` extends with optional `code`, `type`, `param`, `statusText` | `types/api.ts` updated | ✓ |
| Interfaces | `NormalizedUiError` extends with optional `code`, `type`, `param` | `app/utils/error-normalization.ts` updated | ✓ |
| Architecture | Status propagated from `response.status` through client pipeline | `app/app.vue` (line 62+), `use-models-state.ts` (line 74+) | ✓ |
| Data | Upstream `type`, `code`, `param` extracted from nested/top-level envelopes | `server/utils/openai-error-mapper.ts` (lines 23-78) | ✓ |
| Data | Unsupported-format fallback uses sanitized stringified payload, max 256 chars | `app/utils/error-normalization.ts` (coerceFallbackDetails), `server/utils/openai-error-mapper.ts` (buildFallbackDetails) | ✓ |
| Security SR-1 | All fields sanitized for token/secret exposure | `sanitizeOptionalErrorText()` applied to all typed fields | ✓ |
| Security SR-2 | Server never forwards upstream message verbatim | Routes use fixed constants: `"Request to OpenAI failed."` | ✓ |
| Security SR-3 | No stack traces, internal paths in response | All fields coerced, no raw upstream payloads | ✓ |
| Security SR-4 | Unsupported payload sanitized + truncated | `buildFallbackDetails()` (server), `coerceFallbackDetails()` (client) | ✓ |
| Security SR-5 | Field bounds: code/type/param ≤128, details ≤256 | Constants: `MAX_TYPED_FIELD_LENGTH=128`, `MAX_DETAILS_LENGTH=256` | ✓ |
| Security SR-6 | Display policy allowlist enforced | `UiErrorAlert.vue` renders only: type, statusCode, code, param, message, details | ✓ |
| Security SR-7 | No user-facing `Type: unknown` display | Type row only renders `v-if="error.type"` (guard prevents unknown display) | ✓ |
| Validation | JSON parse failure path preserves status | `app/app.vue` try/catch wraps `response.json()` | ✓ |
| Validation | Normalization handles structured + unsupported envelopes | `normalizeApiErrorResponse()` and fallback classification logic | ✓ |
| Testing | Unit tests cover typed fields, nested envelopes, unsupported payloads, truncation | `tests/unit/error-normalization.test.ts` (14 cases) | ✓ |
| Testing | Integration tests verify server extraction and fixed messaging | `tests/integration/respond-route.test.ts`, `tests/integration/models.test.ts` (12 cases) | ✓ |
| Testing | E2E tests verify user-visible rendering | `tests/e2e/app.spec.ts` (6 cases) | ✓ |

---

## Conclusion

**NO ACTIVE DISCREPANCIES.** All design requirements have been implemented correctly in the current working directory. The one previously-identified discrepancy (DISC-1: Type field rendering) has been resolved and is ready for commit.

The implementation is **ready to merge** upon staging and committing the working directory corrections.
