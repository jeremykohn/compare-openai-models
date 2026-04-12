# Requirements: Upgrade Node Version to 24

## Overview

This document defines the requirements for standardizing this repository on Node 24 to eliminate runtime mismatch issues between local development and CI, and to improve dependency-install reproducibility.

## Assumptions

- Project dependencies used by development, CI, and test workflows support Node 24.
- Contributors can install and use Node 24 locally.
- GitHub Actions runners used by this repository can run Node 24.

## Constraints

- Keep the change set focused on runtime/toolchain alignment and workflow consistency.
- Do not introduce unrelated feature changes or broad refactors.
- Preserve existing developer workflows and commands unless an update is required for Node 24 alignment.

## Functional Requirements

- **FR-001**: The repository MUST declare Node 24 as the default local development runtime using a committed runtime indicator file.
- **FR-002**: CI workflows that run install/build/validation steps MUST resolve the Node version from the same source of truth used for local development.
- **FR-003**: The dependency installation path in CI MUST use `npm ci` under Node 24.
- **FR-004**: The repository MUST provide a deterministic npm toolchain signal so contributors and CI use a consistent npm major/minor version where supported.
- **FR-005**: The repository MUST preserve existing validation script entry points (`lint`, `typecheck`, `test`) after the runtime upgrade.
- **FR-006**: The runtime upgrade MUST avoid changing application feature behavior.
- **FR-007**: If Node/runtime expectations are documented, documentation MUST be updated to reflect Node 24.
- **FR-008**: The requirements implementation MUST include a verification record showing that key validation commands execute successfully on Node 24 or explicitly capture any blocking incompatibility.

## Technical Requirements

- **TR-001 (Runtime Signaling)**: Introduce or update a version-control-tracked runtime file (for example, `.nvmrc`) containing `24` (or an agreed Node 24-compatible expression) as the canonical runtime signal.
- **TR-002 (CI Version Resolution)**: GitHub Actions workflows MUST use `actions/setup-node` with `node-version-file` (or equivalent) pointing to the canonical runtime signal file; hardcoded conflicting Node versions in the same workflow are not allowed.
- **TR-003 (Package Manager Determinism)**: `package.json` MUST include a `packageManager` field aligned with the npm version used to produce `package-lock.json`.
- **TR-004 (Lockfile Integrity)**: `package-lock.json` MUST remain in sync with `package.json` after runtime/toolchain updates so `npm ci` succeeds in CI without lockfile drift errors.
- **TR-005 (Workflow Consistency)**: All workflows that execute npm commands (`install`, `ci`, `test`, `lint`, `build`) MUST run after Node setup has resolved Node 24.
- **TR-006 (Validation Coverage)**: At minimum, run the existing project validation commands relevant to the change (`npm run lint`, `npm run typecheck`, `npm test` where available) under Node 24.
- **TR-007 (Error Handling)**: If a validation command fails due to Node 24 compatibility, the failure MUST be surfaced with actionable error output and documented in the upgrade notes/artifacts rather than silently bypassed.
- **TR-008 (Security and Secrets)**: No secret values (tokens, keys, credentials) may be introduced or logged while updating runtime/CI configuration.
- **TR-009 (Data Flow Integrity)**: CI runtime selection flow MUST be: checkout repository -> read canonical Node version source -> configure Node -> run `npm ci` -> run validation commands.
- **TR-010 (Backward Safety)**: Changes MUST be limited to runtime metadata, workflow configuration, dependency metadata/lockfiles, and related documentation required for Node 24 adoption.
- **TR-011 (API/Contract Stability)**: No public API route shape, response contract, or user-facing endpoint behavior may change as part of this upgrade.
- **TR-012 (Documentation Coherence)**: Any contributor-facing setup section that references Node version selection MUST be consistent across `README.md`, CI config, and runtime signal files.

## Performance Requirements

- **PR-001**: Dependency installation in CI MUST remain reproducible and complete without additional manual recovery steps.
- **PR-002**: Local onboarding path (`install` + baseline validation command) MUST remain no more complex than pre-upgrade steps, except for explicitly requiring Node 24.

## Out of Scope / Non-Goals

- Migrating from npm to another package manager.
- Re-architecting application code, server routes, or UI components.
- Introducing new product features.
- Redesigning the test strategy beyond compatibility verification needed for Node 24.
- Expanding or formalizing multi-version Node support matrix beyond Node 24 adoption.

## Acceptance Criteria

- `requirements.md` exists in `.github/specs/002-upgrade-node-version-to-24/` with FR/TR/PR traceable IDs.
- Canonical Node runtime signal points to Node 24 and is consumed by CI workflows.
- `npm ci` succeeds in CI under Node 24 with lockfile consistency.
- Existing project validation entry points remain available and are executed for compatibility verification.
- No unrelated feature or API behavior changes are introduced.