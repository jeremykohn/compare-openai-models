# Make Playwright assertions prove two distinct requests

## Harden Playwright proof of dual-request behavior

- Important for regression confidence

**Target files**
- `tests/e2e/app.spec.ts`
- `tests/e2e/accessibility.spec.ts`
- `tests/e2e/helpers/mock-api.ts` (if helper extensions simplify distinct-request assertions)

**Implementation plan**
- Replace duplicate generic `waitForResponse()` predicates with assertions that prove two distinct POSTs occurred.
- Prefer request-level evidence:
  - capture request bodies and assert distinct model IDs, or
  - count intercepted `/api/respond` requests with per-request metadata.
- Update accessibility success-state test to wait for both requests before asserting final UI.

**Acceptance criteria**
- E2E tests fail if app sends only one `/api/respond` request.
- E2E tests fail if both requests target the same model when different models were selected.
- Accessibility e2e remains stable and non-flaky.

**Validation**
- `npm run test:e2e -- tests/e2e/app.spec.ts`
- `npm run test:a11y:e2e`

## Risk & Rollback Notes

- Over-constrained network timing assertions can be flaky; prefer deterministic request interception and content checks over pure timing waits.
