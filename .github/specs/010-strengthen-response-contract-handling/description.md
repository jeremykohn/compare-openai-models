# Enforce and use full `POST /api/respond` success contract (`response` + `model`)

## Strengthen response contract handling

- Ensures correctness and future resilience if server-side model resolution differs from submitted model IDs.
- Prevents weak success payload validation from accepting malformed responses.

**Target files**
- `app/utils/type-guards.ts`
- `app/app.vue`
- `types/api.ts` (if needed for shared client typing clarity)
- `tests/unit/app.ui.test.ts`
- `tests/integration/respond-route.test.ts` (only if contract assertions need updates)

**Implementation plan**
- Update `isRespondSuccessPayload()` to require both:
  - `response` as `string`
  - `model` as `string`
- Return and propagate `model` from `runSingleQuery()` success branch.
- Use server-returned `model` for output headings (instead of submitted model snapshots) after each side resolves.
- Preserve current error normalization path for malformed payloads.

**Acceptance criteria**
- Successful UI headings reflect actual server-returned model values.
- Success payload missing `model` is handled as normalized error.
- Existing server route contract remains unchanged (`{ response, model }`).

**Validation**
- `npm run test:unit -- tests/unit/app.ui.test.ts`
- `npm run test:integration -- tests/integration/respond-route.test.ts`

## Risk & Rollback Notes

- Stricter payload validation may surface previously hidden malformed responses; this is desirable and should route through existing normalized error handling.