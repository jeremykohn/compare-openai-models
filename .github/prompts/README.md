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
| 5 | `prompt-5-implement-from-plan.md` | `implementation-plan.md` | Updated checkboxes + quality-gate notes, or no-open-tasks note |
| 6 | `prompt-6-report-discrepancies-and-create-remediation-plan.md` | `design.md` + `implementation-plan.md` | Discrepancy reports + remediation tasks appended to implementation plan, or no-unresolved-discrepancies note |

## What Each Step Does

- **Step 1 — Create Specific Description**:
  - Converts a general update idea into one or more detailed, scoped descriptions.
  - Creates a numbered spec folder (`{NNN}-{short-update-name}`) with collision re-scan if needed.
  - Writes `description.md`.

- **Step 2 — Create Requirements**:
  - Converts `description.md` into a requirements document.
  - Produces functional, technical, and performance requirement IDs where applicable.
  - Writes `requirements.md`.

- **Step 3 — Create Technical Design**:
  - Converts `requirements.md` into implementation-ready technical design details.
  - Requires traceability from requirement IDs to design sections.
  - Writes `design.md`.

- **Step 4 — Create Implementation Plan**:
  - Converts `design.md` into a phased implementation plan.
  - Uses standardized checkbox tasks with canonical task IDs.
  - Includes placeholders for quality-gate notes and follow-up tasks.
  - Writes `implementation-plan.md`.

- **Step 5 — Implement from Plan**:
  - Executes open tasks in `implementation-plan.md` and marks completed checkboxes (`- [x]`).
  - Runs per-phase and final quality gates on modified files.
  - Appends quality-gate findings/fixes notes in-place using the canonical schema.
  - Adds follow-up tasks when needed (`P{phase-number}-T{task-number}` for phase-scoped tasks; `QG-T{task-number}` for end-of-file quality-gate follow-up tasks).
  - If no open tasks exist at start, appends a no-open-tasks note and forwards to Step 6.

- **Step 6 — Review Discrepancies and Plan Remediation**:
  - Compares implemented code against `design.md` and `implementation-plan.md` within the active review boundary.
  - If no discrepancies exist, appends a no-unresolved-discrepancies note and ends.
  - If discrepancies exist:
    - Updates discrepancy report files in `discrepancy-reports/` inside the same spec folder as `design.md`.
    - Appends remediation tasks to `implementation-plan.md`.
    - Sends workflow back to Step 5.
  - For fallback boundary reviews (`all-branch-changes`), labels out-of-cycle findings as `fallback-scope` and requires user confirmation before remediation inclusion.

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

Example:

```markdown
- [ ] Add model comparison endpoint
  - Task ID: P2-T3
  - Description: Implement server route to compare outputs from two models.
  - Dependencies: P2-T1, P2-T2
  - Validation command: npm test -- server/api/compare.test.ts
  - Expected result: Comparison route returns valid JSON payload for both success and error paths.
```

## Standardized Quality-Gate Format (Description + Example)

Quality-gate note entries use the canonical schema defined by Prompt 4 and used in Prompt 5.

`prompt-4-create-implementation-plan-from-design.md` is the canonical schema source; `prompt-5-implement-from-plan.md` appends entries using that schema.

Example note entries:

```markdown
- Finding: Response schema omitted required `model` field.
- Proposed fix: Add `model` to response mapper and update related tests.
- Applied: Yes — mapper and tests updated.
- Task link: P2-T3
```

If a quality gate adds non-phase-scoped follow-up tasks, append them under `Quality Gate Follow-up Tasks` with next-available ascending `QG-T{task-number}` IDs.

Example follow-up task:

```markdown
- [ ] Add missing error-state assertion for response mapper
  - Task ID: QG-T4
  - Description: Add regression test for malformed response payload handling.
  - Dependencies: None
  - Validation command: npm test -- server/utils/mapper.test.ts
  - Expected result: Mapper test suite passes and covers malformed payload branch.
```

## Shared Behavior Contract

All prompts reference `_shared-behavior-contract.md`, which defines shared behavioral rules:
clarification-first policy, path clarification before file writes, in-place workflow artifact updates (including looped Prompt 5 ↔ Prompt 6 cycles), and scope guardrails.

## Re-running a Step

Each step can be re-run independently. Re-running a step will overwrite its output artifact; downstream artifacts (implementation plan files, discrepancy reports) may become stale and should be regenerated.

## Spec Artifacts

Artifacts are stored under `.github/specs/{NNN}-{short-update-name}/`, for example:
`.github/specs/001-new-feature/description.md`.
