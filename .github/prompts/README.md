# Copilot Prompt Workflow

This folder contains a sequence of Copilot prompts for making structured updates to this repository.
Each prompt produces an artifact that feeds the next step.

## Workflow Overview

| Step | Prompt file | Input | Output |
|------|-------------|-------|--------|
| 1 | `prompt-1-create-specific-descriptions-from-general-description.md` | General idea | One spec folder per update, each with `description.md` |
| 2 | `prompt-2-create-requirements-from-description.md` | `description.md` | `requirements.md` |
| 3 | `prompt-3-create-technical-design-from-requirements.md` | `requirements.md` | `design.md` |
| 4 | `prompt-4-create-implementation-plan-from-design.md` | `design.md` | `implementation-plan.md` |
| 5 | `prompt-5-implement-from-plan.md` | `implementation-plan.md` | Implemented code changes + updated task checkboxes (including post-phase follow-up tasks); or no-open-tasks note if no open tasks at start |
| 6 | `prompt-6-report-discrepancies-and-create-remediation-plan.md` | `design.md` + `implementation-plan.md` | Discrepancy report files + remediation tasks appended to `implementation-plan.md`, or no-unresolved-discrepancies note |

## Prompt Header Convention

Executable workflow prompts in `.github/prompts/` use this standardized header near the top of the file:

```markdown
Read and apply the rules in `.github/prompts/_shared-behavior-contract.md` before proceeding.
```

This is intentional prompt boilerplate, not accidental duplication.

## Optional Constraints Convention

Every prompt's `## Input Contract` section includes this standard cross-reference line for optional constraints:

```markdown
- Optional constraints (use common input metadata defined in `.github/prompts/_shared-behavior-contract.md`)
```

This is intentional shared-contract boilerplate. The line is intentionally repeated in each prompt so each file remains usable on its own. The supported constraint types (timeline, platform, compatibility, rollout limitations) are defined once in `_shared-behavior-contract.md`.

## What Each Step Does

- **Step 1 — Create Specific Description**:
  - Converts a general update idea into one or more detailed, scoped descriptions.
  - Creates a numbered spec folder (`{NNN}-{short-update-name}`) with collision re-scan if needed.
  - Writes `description.md`.

- **Step 2 — Create Requirements**:
  - Converts `description.md` into a requirements document.
  - Produces functional, technical, security, accessibility, and performance requirement IDs where applicable.
  - Writes `requirements.md`.

- **Step 3 — Create Technical Design**:
  - Converts `requirements.md` into implementation-ready technical design details.
  - Ensures the design addresses all requirement categories in scope (including security, accessibility, and performance requirements when present).
  - Requires traceability from requirement IDs to design sections.
  - Writes `design.md`.

- **Step 4 — Create Implementation Plan**:
  - Converts `design.md` into a phased implementation plan.
  - Uses standardized checkbox tasks with canonical task IDs.
  - Preserves in-scope design concerns such as security, accessibility, and performance when present.
  - Writes `implementation-plan.md`.

- **Step 5 — Implement from Plan**:
  - Executes open tasks in `implementation-plan.md` and marks completed checkboxes (`- [x]`).
  - Preserves in-scope requirement-category coverage represented in the plan, including security, accessibility, and performance concerns when present.
  - Uses a Test-Driven Development (TDD) red-green-refactor loop while executing tasks.
  - After each phase, runs a post-phase find-and-fix cycle scoped to files modified in that phase.
  - If no open tasks exist at start, appends a no-open-tasks note and forwards to Step 6.

- **Step 6 — Review Discrepancies and Plan Remediation**:
  - Reviews all changes on the current git branch compared to the repository default branch derived from git remote metadata for consistency with `design.md` and `implementation-plan.md`
  - Checks whether implementation evidence covers requirement categories represented in the design and plan, including security, accessibility, and performance when present.
  - If no discrepancies exist, appends a no-unresolved-discrepancies note and ends.
  - Existing discrepancy reports may still be updated on no-discrepancy runs to maintain structured history rollover/closure tracking.
  - If discrepancies exist:
    - Updates discrepancy report files in `discrepancy-reports/` inside the same spec folder as `design.md`, maintaining structured discrepancy history (Open Discrepancies, Resolved Since Last Run, Historical Discrepancies) across runs rather than treating each run as an isolated report.
    - Appends remediation tasks to `implementation-plan.md`.
    - Sends workflow back to Step 5.

## Folder Structure (Description + Example)

The workflow stores artifacts under a numbered spec folder per update.

Example:

```text
.github/
  prompts/
    README.md
    prompt-1-create-specific-descriptions-from-general-description.md
    ...
  specs/
    001-compare-model-outputs/
      description.md
      requirements.md
      design.md
      implementation-plan.md
      discrepancy-reports/
        modifications-vs-design.md
        modifications-vs-implementation-plan.md
```

## Standardized Task Format (Description + Example)

Plan tasks in `implementation-plan.md` use a standardized checkbox format with canonical task IDs.
`.github/prompts/_shared-behavior-contract.md` is the canonical source for workflow task ID conventions.

Example:

```markdown
- [ ] Add model comparison endpoint
  - Task ID: P2-T3
  - Description: Implement server route to compare outputs from two models.
  - Dependencies: P2-T1, P2-T2
  - Validation command: npm test -- server/api/compare.test.ts
  - Expected result: Comparison route returns valid JSON payload for both success and error paths.
```

## Shared Behavior Contract

All prompts reference `.github/prompts/_shared-behavior-contract.md`, which defines shared behavioral rules:
clarification-first policy, path clarification before file writes, in-place workflow artifact updates (including looped Prompt 5 ↔ Prompt 6 cycles), scope guardrails, canonical task ID conventions, canonical requirement ID conventions, canonical discrepancy ID conventions, spec folder naming, and run-history note formats.

## Re-running a Step

Each step can be re-run independently. Re-running a step may overwrite an output artifact or append/update an existing workflow artifact in place (depending on the step); downstream artifacts may become stale and should be reviewed and regenerated where needed.

Staleness guide:

- Re-running **Step 1** makes `requirements.md`, `design.md`, `implementation-plan.md`, and all discrepancy artifacts stale.
- Re-running **Step 2** makes `design.md`, `implementation-plan.md`, and all discrepancy artifacts stale.
- Re-running **Step 3** makes `implementation-plan.md` and all discrepancy artifacts stale.
- Re-running **Step 4** makes task checkbox state in `implementation-plan.md`, any code implemented against the old plan, and all discrepancy artifacts stale.
- Re-running **Step 5** can make discrepancy reports and remediation tasks stale if implementation changes after the last Prompt 6 run.
- Re-running **Step 6** updates discrepancy reports and remediation tasks in place; any older remediation assumptions should be re-validated against the current implementation plan.

## Spec Artifacts

Artifacts are stored under `.github/specs/{NNN}-{short-update-name}/`, for example:
`.github/specs/001-new-feature/description.md`.
