# Issue Checklist — Fixes from Modified `*.ts` and `*.vue` Review

Source: review of currently modified TypeScript/Vue files.

## 🔴 Critical

- [ ] **I-001 — Fix compile/runtime safety in `app/app.vue` success path**
  - **Problem:** Unsafe cast of `normalizedInput` to success payload and unconditional `successPayload.response` access.
  - **Fix:** Add runtime shape check before `succeed()` (require `response` as string); if invalid shape, normalize as error and call `fail()`.
  - **Files:** `app/app.vue`
  - **Validation:**
    - `npm run typecheck`
    - `npx vitest run --config vitest.unit.config.ts tests/unit/app.ui.test.ts`

## 🟡 Important

- [ ] **I-002 — Harden successful `/api/models` payload handling**
  - **Problem:** `use-models-state.ts` assumes `response.ok` payload always matches `ModelsApiResponse`.
  - **Fix:** Add payload guard for expected shape (`object`, `data` array, booleans), and route malformed payloads through normalized error handling.
  - **Files:** `app/composables/use-models-state.ts`
  - **Validation:**
    - `npx vitest run --config vitest.unit.config.ts tests/unit/models-selector.test.ts`
    - `npx vitest run --config vitest.config.ts tests/integration/models.test.ts`

- [ ] **I-003 — Improve API-error classification when `message` is absent**
  - **Problem:** `isApiError()` requires `message`, so typed payloads with only `type/code/param/status` can degrade to `unknown`.
  - **Fix:** Broaden API detection to include typed metadata and status hints; keep network detection precedence unchanged.
  - **Files:** `app/utils/type-guards.ts`, `app/utils/error-normalization.ts`
  - **Validation:**
    - `npx vitest run --config vitest.unit.config.ts tests/unit/error-normalization.test.ts`
    - `npx vitest run --config vitest.unit.config.ts tests/unit/ui-error-alert.test.ts`

## 🟢 Minor

- [ ] **I-004 — Apply consistent `details` length cap for API details**
  - **Problem:** 256-char truncation is applied to fallback details but not guaranteed for `apiDetails` path.
  - **Fix:** Reuse the same truncation policy for sanitized API details.
  - **Files:** `app/utils/error-normalization.ts`
  - **Validation:**
    - `npx vitest run --config vitest.unit.config.ts tests/unit/error-normalization.test.ts`

- [ ] **I-005 — Add targeted regression tests for malformed success payloads**
  - **Problem:** Current tests do not enforce failure behavior for malformed `response.ok` payloads.
  - **Fix:** Add test cases that simulate malformed successful responses and assert normalized error handling.
  - **Files:** `tests/unit/app.ui.test.ts`, `tests/unit/models-selector.test.ts`
  - **Validation:**
    - `npx vitest run --config vitest.unit.config.ts tests/unit/app.ui.test.ts tests/unit/models-selector.test.ts`

## Final Gate

- [ ] **I-006 — Run focused suite, then full quality gate**
  - **Validation:**
    - `npm run typecheck`
    - `npm test`
    - `npm run lint`
