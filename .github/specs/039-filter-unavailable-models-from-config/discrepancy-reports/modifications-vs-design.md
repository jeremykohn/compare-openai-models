# Discrepancy Report: Modifications vs Design

## Current Run Summary
- Run Date: 2026-05-06
- Branch: improve-app-ux
- Resolved Default Branch Ref: main
- Review Boundary: `git diff $(git merge-base HEAD main) HEAD --name-only`
- Implementation Plan: `.github/specs/039-filter-unavailable-models-from-config/implementation-plan.md`

## Open Discrepancies
- None.

## Resolved Since Last Run

### DISC-1 — [important] Missing explicit E2E assertion for fallback-note absence when `showFallbackNote=false`
- Resolution evidence:
  - Added test `does not show fallback note when server indicates filtered mode` in `tests/e2e/models-selector.spec.ts`.
  - User-provided passing targeted run: `npm run test:e2e -- models-selector.spec.ts` (4 passed).
  - User-provided passing full run includes `tests/e2e/models-selector.spec.ts` and full suite success (17 passed).
- Status: Resolved.

## Historical Discrepancies
- None.
