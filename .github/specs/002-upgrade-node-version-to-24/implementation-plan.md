# Implementation Plan: Upgrade Node Version to 24

## Overview

This plan delivers the Node 24 runtime-alignment design in small, dependency-ordered phases. It focuses on runtime/toolchain consistency across local and CI environments, lockfile integrity, and validation evidence without introducing feature-level changes.

## Assumptions

- The repository can execute validation commands under Node 24.
- CI workflows are GitHub Actions-based and editable in this change.
- `npm ci` is the authoritative install path in CI.

## Constraints

- Scope is limited to runtime metadata, CI workflow configuration, lockfile/package metadata, and related docs.
- No product behavior, API contract, or unrelated refactor changes.

## Risks and Dependencies

- Dependency compatibility issues may surface under Node 24.
- CI drift can persist if any workflow still hardcodes a different Node version.
- Lockfile mismatch can break deterministic installs if regenerated with inconsistent npm runtime.

## Phase 1 — Baseline and Preconditions

### Objective

Establish a reproducible baseline and identify all runtime-related touchpoints before applying changes.

### Tasks

1. **Inventory runtime and CI version signals**
   - **Description**: Identify all files that define or imply Node/npm versions (runtime indicator files, workflow setup steps, `package.json` metadata).
   - **Dependencies**: None.
   - **Validation command**:
     - `grep -R "setup-node\|node-version\|node-version-file\|packageManager" .github package.json .nvmrc 2>/dev/null || true`
   - **Expected result**: Complete list of runtime-related configuration points to update or confirm.

2. **Capture pre-change validation baseline**
   - **Description**: Run existing repository validation entry points under Node 24 and capture outcomes for comparison and evidence.
   - **Dependencies**: Task 1.
   - **Validation command**:
     - `npm run lint && npm run typecheck && npm test`
   - **Expected result**: A pass/fail baseline is recorded; failures (if any) are clearly attributable.

### Validation

- Runtime/config inventory is complete and no known runtime signal is unreviewed.
- Baseline command outcomes are captured for later verification records.

### Exit Criteria

Done when runtime-touchpoint inventory exists and baseline validation outcomes are documented.

## Phase 2 — Runtime Source-of-Truth Alignment

### Objective

Ensure local development and CI share the same canonical Node runtime signal.

### Tasks

1. **Set canonical Node runtime indicator to Node 24**
   - **Description**: Add or update runtime indicator file (for example, `.nvmrc`) with Node 24.
   - **Dependencies**: Phase 1 complete.
   - **Validation command**:
     - `cat .nvmrc`
   - **Expected result**: Runtime indicator exists and resolves to Node 24.

2. **Align CI workflow runtime resolution**
   - **Description**: Update all relevant GitHub workflows to use `actions/setup-node` with `node-version-file` pointing to the canonical runtime file.
   - **Dependencies**: Task 1.
   - **Validation command**:
     - `grep -R "node-version-file" .github/workflows`
   - **Expected result**: CI workflows consistently source Node from the canonical runtime indicator.

3. **Remove conflicting hardcoded runtime entries**
   - **Description**: Remove or normalize hardcoded Node version values that conflict with canonical source-of-truth usage.
   - **Dependencies**: Task 2.
   - **Validation command**:
     - `grep -R "node-version:" .github/workflows || true`
   - **Expected result**: No conflicting hardcoded Node version remains in relevant workflows.

### Validation

- All workflow paths using npm commands are configured after Node setup.
- Runtime source is single and consistent across local + CI.

### Exit Criteria

Done when Node 24 source-of-truth is canonical and consumed by all relevant workflows.

## Phase 3 — npm Determinism and Lockfile Integrity

### Objective

Guarantee deterministic dependency installation behavior under Node 24.

### Tasks

1. **Align package manager metadata**
   - **Description**: Ensure `package.json` has an accurate `packageManager` field matching the npm used to generate lockfile updates.
   - **Dependencies**: Phase 2 complete.
   - **Validation command**:
     - `node -e "const p=require('./package.json'); console.log(p.packageManager || 'MISSING')"`
   - **Expected result**: `packageManager` is present and intentional.

2. **Regenerate/normalize lockfile if needed under aligned runtime**
   - **Description**: Refresh `package-lock.json` only if metadata/runtime changes require it; avoid unrelated dependency churn.
   - **Dependencies**: Task 1.
   - **Validation command**:
     - `npm ci`
   - **Expected result**: `npm ci` succeeds locally under Node 24 without lock drift errors.

3. **Verify CI install path determinism**
   - **Description**: Confirm workflows use `npm ci` for deterministic installs and do not fall back to inconsistent install patterns.
   - **Dependencies**: Task 2.
   - **Validation command**:
     - `grep -R "npm ci" .github/workflows`
   - **Expected result**: Relevant CI workflows install dependencies with `npm ci`.

### Validation

- Lockfile and package metadata are synchronized.
- Install path behaves deterministically under configured runtime.

### Exit Criteria

Done when local and CI dependency-install paths are reproducible and consistent.

## Phase 4 — Documentation and Contributor Guidance Alignment

### Objective

Keep contributor-facing setup documentation consistent with runtime/toolchain configuration.

### Tasks

1. **Update runtime references in documentation**
   - **Description**: Update Node-version setup references in `README.md` (and related docs, if present) to Node 24.
   - **Dependencies**: Phase 2 complete.
   - **Validation command**:
     - `grep -n "Node\|nvm\|runtime" README.md || true`
   - **Expected result**: Documentation reflects Node 24 expectations and matches config files.

2. **Validate documentation-to-config coherence**
   - **Description**: Check that runtime docs align with `.nvmrc`, workflows, and `package.json` metadata.
   - **Dependencies**: Task 1.
   - **Validation command**:
     - `git --no-pager diff -- README.md .nvmrc package.json .github/workflows`
   - **Expected result**: No contradictory runtime instructions remain.

### Validation

- Documentation and configuration state are coherent.

### Exit Criteria

Done when contributor instructions match runtime/toolchain implementation.

## Phase 5 — Verification and Delivery Evidence

### Objective

Produce final compatibility evidence and release-ready artifacts for the Node 24 upgrade.

### Tasks

1. **Execute post-change validation suite**
   - **Description**: Run lint/typecheck/test after all runtime updates.
   - **Dependencies**: Phases 2–4 complete.
   - **Validation command**:
     - `npm run lint && npm run typecheck && npm test`
   - **Expected result**: Validation commands pass or produce explicit, actionable incompatibility outputs.

2. **Create verification record for requirement compliance**
   - **Description**: Summarize command outputs and checks proving FR/TR/PR compliance.
   - **Dependencies**: Task 1.
   - **Validation command**:
     - `git --no-pager diff --stat`
   - **Expected result**: Change evidence is ready for PR review and requirement traceability.

3. **Finalize scope guardrails check**
   - **Description**: Confirm no unrelated feature/API/refactor changes were introduced.
   - **Dependencies**: Task 2.
   - **Validation command**:
     - `git --no-pager diff --name-only`
   - **Expected result**: Changed files remain within runtime, workflow, metadata, lockfile, and docs scope.

### Validation

- Validation suite outcomes are explicit and reproducible.
- Scope remains constrained to agreed Node 24 alignment work.

### Exit Criteria

Done when requirement-aligned evidence is complete and changes are PR-ready.

## TDD-Oriented Guidance (Applied to Configuration Work)

- Define expected workflow/runtime behavior first (source-of-truth Node file, `npm ci` path, validation command set).
- Make minimal config changes to satisfy one expected behavior at a time.
- Re-run focused checks after each change before moving to the next dependency-ordered task.
- Preserve a red/green feedback loop through command-level verification even when changes are infrastructure/config rather than application code.

## Traceability (Phases → Design Decisions / Requirements)

- **Phase 1** → D-005, FR-008, TR-006, TR-007
- **Phase 2** → D-001, D-002, FR-001, FR-002, TR-001, TR-002, TR-005, TR-009
- **Phase 3** → D-003, D-004, FR-003, FR-004, TR-003, TR-004
- **Phase 4** → D-007, FR-007, TR-012
- **Phase 5** → D-005, D-006, D-008, FR-005, FR-006, TR-010, TR-011, PR-001, PR-002

## Implementation Notes

- If Node 24 incompatibilities appear, capture exact failing command output and affected dependency/version before any remediation.
- Avoid introducing workaround scripts that bypass deterministic install or validation paths.
- Keep commits small and phase-aligned to simplify review and rollback if needed.