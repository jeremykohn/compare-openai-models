# General Description

Upgrade this repository to Node 24.

# Specific Description

## Problem Statement
The repository currently has mixed Node-version signals across local development, CI workflows, and package metadata. This can cause dependency lockfile drift, inconsistent `npm ci` behavior, and avoidable CI failures when local installs are performed under a different Node/npm runtime than GitHub Actions.

## Intended Outcome
Establish Node 24 as the primary runtime for this repo so local development and CI use consistent Node/npm behavior. The update should reduce environment-related install/build discrepancies and make dependency resolution reproducible.

## Scope
This update should include:

1. Runtime and toolchain alignment
   - Set Node 24 as the project’s default runtime signal for developers and CI.
   - Ensure npm behavior is deterministic across environments (for example via package manager version pinning where appropriate).

2. CI alignment
   - Update GitHub Actions workflows to use the same Node version source as local development (single source of truth).
   - Ensure `npm ci` runs under the intended Node 24 environment.

3. Validation and compatibility checks
   - Verify lint/typecheck/test commands still run successfully under Node 24.
   - Confirm no required scripts or build paths regress after the runtime upgrade.

4. Documentation and contributor guidance (if needed)
   - Clarify expected Node version for contributors.
   - Keep setup instructions consistent with the selected runtime signals.

## Expected User/Developer-Visible Results
- Developers can reliably use Node 24 without environment mismatch surprises.
- CI runs with the same major runtime assumptions as local development.
- Fewer lockfile/runtime mismatch errors during install and validation steps.

## Assumptions
- Core dependencies in this repo are compatible with Node 24.
- Team workflow accepts Node 24 as the default runtime for active development.

## Constraints
- Changes should remain focused on Node/runtime alignment and related workflow consistency.
- Avoid broad, unrelated refactors while making runtime/tooling updates.

## Exclusions
- No feature-level product behavior changes.
- No redesign of testing strategy beyond what is required to confirm Node 24 compatibility.

## Non-Goals
- Migrating package managers (for example npm to pnpm/yarn).
- Rewriting application architecture or refactoring unrelated modules.
- Expanding runtime support matrix beyond what is needed for Node 24 adoption.
