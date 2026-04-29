# Render true per-side loading/success/error states

## Per-side state rendering

- This is the core user-facing behavior of the two-query experience.
- Current global loading gate can hide one side’s completed result while the other side is still pending.

**Target files**
- `app/app.vue`
- `README.md` (only if behavior text needs to be clarified)
- `tests/unit/app.ui.test.ts`
- `tests/e2e/app.spec.ts`

**Implementation plan**
- Replace global `v-if="isLoading"` gating with per-panel rendering logic.
- Keep both response panels visible once a submission starts.
- Inside each panel, render side-specific state:
  - loading indicator for that side
  - success content for that side
  - error content for that side
- Keep submit button disabled while either side is loading (existing behavior is fine).

**Acceptance criteria**
- If left finishes before right, left content is visible while right still shows loading.
- If one side errors and the other succeeds, both states appear concurrently.
- No regression in keyboard navigation or screen reader announcements.

**Validation**
- `npm run test:unit -- tests/unit/app.ui.test.ts`
- `npm run test:e2e -- tests/e2e/app.spec.ts`
- `npm run test:a11y:unit`

## Risk & Rollback Notes

- UI conditional complexity can regress rendering order; mitigate with targeted unit + e2e coverage.
