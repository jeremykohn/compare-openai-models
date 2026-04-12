# Discrepancy Report: Modifications vs Technical Design

## Summary

Implemented changes align with the design objective of Node 24 runtime consistency across local development and CI:

- Canonical runtime source-of-truth (`.nvmrc`) is used by CI workflows updated in this execution pass.
- npm install path remains `npm ci` in CI workflows that install project dependencies.
- Contributor documentation now reflects Node 24 runtime expectation.
- Validation commands were executed and recorded.

## Resolved Discrepancies

- The previously reported verification-path discrepancy is resolved.
- Commit `31479d9` formatted `server/assets/models/openai-models.json`.
- `npm run lint` now passes, so `lint`, `typecheck`, and `test` satisfy the intended verification path.

## Discrepancies

### 1) Testing strategy target vs lint gate outcome

- **Severity**: `important`
- **Expected (Design)**: Testing strategy calls for running lint/typecheck/test under Node 24 as compatibility verification targets.
- **Actual (Implemented)**: A follow-up commit (`31479d9`, `fix(style): Format json file so 'npm run lint' passes`) reformatted `server/assets/models/openai-models.json`. `lint`, `typecheck`, and `test` now satisfy the intended verification path.
- **Impact**: The design verification path is no longer blocked by the prior formatting issue.
- **Status**: `already corrected`

## Mapping Table (Discrepancy → Planned Fix)

| Discrepancy | Planned Fix |
|---|---|
| Lint failure on pre-existing file formatting. | Fixed in commit `31479d9` by formatting `server/assets/models/openai-models.json`; `npm run lint` now passes. |

## Notes

- No discrepancy found for runtime source-of-truth direction (`node-version-file: .nvmrc`) in updated workflows.
- No discrepancy found for scope constraints (no feature/API changes).
- The previously reported design-verification discrepancy has been corrected.