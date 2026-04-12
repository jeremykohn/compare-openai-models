# Technical Design: Upgrade Node Version to 24

## Overview

This design standardizes repository runtime behavior on Node 24 across local development and GitHub Actions CI. The design focuses on deterministic runtime/toolchain configuration, lockfile integrity, and validation-path consistency while avoiding feature-level application changes.

## Goals and Scope

### Goals

- Establish a single source of truth for Node runtime selection.
- Ensure CI and local environments resolve equivalent Node/npm behavior.
- Preserve existing validation entry points and user-facing behavior.
- Reduce `npm ci` failures caused by runtime/toolchain mismatch.

### In Scope

- Runtime signaling files and metadata updates.
- CI workflow runtime setup alignment.
- npm toolchain determinism metadata.
- Lockfile synchronization and validation verification.
- Minimal documentation alignment for contributor setup.

### Out of Scope

- Product feature changes.
- API contract changes.
- Package manager migration.
- Broad refactoring unrelated to runtime alignment.

## Architecture

### Design Summary

The runtime alignment architecture uses a canonical runtime declaration that is consumed by both developer tooling and CI workflows. Package manager metadata in `package.json` complements this runtime declaration to reduce version drift in lockfile generation.

### Components

- **Runtime Signal**: Version-controlled file declaring Node 24 (for example, `.nvmrc`).
- **Toolchain Metadata**: `package.json` `packageManager` field specifying npm version used for lockfile generation.
- **Dependency Lock**: `package-lock.json` kept synchronized with runtime/toolchain metadata.
- **CI Setup Layer**: Workflow `actions/setup-node` configured to read Node version from the canonical runtime signal.
- **Validation Layer**: Existing project scripts (`lint`, `typecheck`, `test`) executed under configured runtime.
- **Documentation Layer**: Contributor-facing runtime expectations updated where referenced.

### Affected Files and Modules

- `.nvmrc` (or equivalent canonical runtime indicator)
- `package.json`
- `package-lock.json`
- `.github/workflows/ci.yml`
- Other GitHub workflows that run npm commands (for example `.github/workflows/lint.yml`, if present)
- `README.md` runtime/setup sections (if runtime version is documented)

## Interfaces

### CI Runtime Interface

- **Input**: Canonical runtime indicator file in repository root.
- **Processor**: `actions/setup-node` reading `node-version-file`.
- **Output**: Node 24 runtime available to all subsequent workflow steps.

### Dependency Install Interface

- **Input**: `package.json` + `package-lock.json` + configured Node/npm runtime.
- **Processor**: `npm ci`.
- **Output**: Reproducible dependency tree or explicit lock consistency failure.

### Validation Interface

- **Input**: Installed dependencies and configured Node 24 runtime.
- **Processor**: Existing project script commands.
- **Output**: Pass/fail signals for lint/typecheck/test compatibility.

## Data and State Flow

### Local Development Flow

1. Developer resolves Node version from canonical runtime indicator.
2. npm version is inferred/enforced by `packageManager` metadata where supported.
3. Developer runs install (`npm ci` preferred for deterministic installs, or existing team practice).
4. Developer runs validation scripts.

### CI Flow

1. Checkout repository.
2. Configure Node via runtime indicator (`node-version-file`).
3. Install dependencies via `npm ci`.
4. Run validation commands (`lint`, `typecheck`, `test` as configured).
5. Publish pass/fail status and logs.

### State Guarantees

- Runtime state in CI is derived from the same source as local development.
- Lockfile/install behavior remains deterministic under Node 24.
- Validation behavior remains consistent with pre-upgrade command entry points.

## Validation and Error Handling

- Fail fast on runtime setup errors (invalid or unreadable runtime indicator).
- Fail fast on lockfile mismatch during `npm ci`.
- Do not bypass validation failures caused by Node 24 incompatibility.
- Report actionable failure output in CI logs and implementation artifacts.
- Keep failure handling explicit; no silent retries that can mask incompatibilities.

## Security Considerations

- Do not introduce secrets into runtime config files, workflows, or logs.
- Maintain existing secret handling patterns (environment variables and GitHub secrets where already used).
- Avoid expanding workflow permissions while updating Node runtime setup.
- Keep modifications limited to runtime/toolchain alignment to reduce change-surface risk.

## Performance Considerations

- Preserve CI job structure to avoid unnecessary runtime increases.
- Reuse existing dependency caching strategy if present in workflows.
- Avoid adding extra install/validation passes unless required for compatibility diagnostics.

## Testing Strategy

### Verification Targets

- Runtime indicator correctly specifies Node 24.
- CI uses runtime indicator for Node setup in all relevant workflows.
- `npm ci` succeeds with synchronized lockfile.
- Existing validation entry points continue to execute under Node 24.
- No user-facing feature or API contract changes are introduced.

### Test Execution Plan

- Run targeted local checks under Node 24:
  - `npm run lint`
  - `npm run typecheck`
  - `npm test` (if configured in repository)
- Validate corresponding CI workflow execution with Node resolved from runtime signal.
- Record verification outcomes and any incompatibilities for remediation.

## Traceability (Design Decisions → Requirements)

- **D-001 Canonical runtime signal** → FR-001, TR-001
- **D-002 CI consumes runtime source of truth** → FR-002, TR-002, TR-005, TR-009
- **D-003 Deterministic npm metadata** → FR-004, TR-003
- **D-004 Lockfile sync enforcement via `npm ci`** → FR-003, TR-004
- **D-005 Preserve validation entry points and execute under Node 24** → FR-005, FR-008, TR-006, TR-007
- **D-006 No application/API behavior change** → FR-006, TR-010, TR-011
- **D-007 Documentation coherence** → FR-007, TR-012
- **D-008 Reproducible install and onboarding simplicity** → PR-001, PR-002

## Assumptions and Constraints

### Assumptions

- Current dependency set remains compatible with Node 24.
- CI runners support Node 24 without custom image changes.

### Constraints

- Keep the solution limited to runtime/toolchain/workflow/documentation alignment.
- Avoid introducing unrelated cleanup or refactor changes in this workstream.

## Resolved Questions

- Resolved: CI does not need to enforce a specific npm patch version globally; `packageManager` metadata alignment is sufficient for this repository.