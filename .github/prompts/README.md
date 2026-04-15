# Copilot Prompt Workflow

This folder contains a sequence of Copilot prompts for making structured updates to this repository.
Each prompt produces an artifact that feeds the next step.

## Workflow Overview

| Step | Prompt file | Input | Output |
|------|-------------|-------|--------|
| 1 | `prompt-1-create-specific-descriptions-from-general-description.md` | General idea | `description.md` |
| 2 | `prompt-2-create-requirements-from-description.md` | `description.md` | `requirements.md` |
| 3 | `prompt-3-create-technical-design-from-requirements.md` | `requirements.md` | `design.md` (includes required requirement-ID-to-design-section traceability) |
| 4 | `prompt-4-create-implementation-plan-from-design.md` | `design.md` | `implementation-plan.md` (tasks formatted as checkboxes and double-checked for completeness, design consistency, task format correctness, and traceability) |
| 5 | `prompt-5-implement-from-plan.md` | implementation plan file (`implementation-plan.md`) | Code changes + updated task checkboxes (`- [x]`) + per-phase/final quality gates; or no-open-tasks note appended to plan |
| 6 | `prompt-6-report-discrepancies-and-create-remediation-plan.md` | `design.md` + implementation plan file (`implementation-plan.md`) | If discrepancies found: report files + remediation tasks appended to plan; otherwise: no-unresolved-discrepancies note appended to plan |

Step 5 is execution-only: it implements open plan tasks from `implementation-plan.md`, marks completed checkboxes (`- [x]`), runs per-phase and final quality gates over relevant modified files, appends quality-gate findings/fixes notes to the implementation plan, and requires each applied quality-gate fix to map to an open task or be appended as a new follow-up task. It includes tasks added by remediation and is complete only when no open tasks remain and the final quality gate passes. If there are no open tasks at start, it appends a no-open-tasks note to the implementation plan and forwards to Step 6.

Step 6 is review/remediation: it establishes a review boundary (preferring changes since the latest Prompt 5 run; falling back to all branch changes, labelled `fallback-scope`, if the boundary is unclear), compares implemented code within that boundary against design + implementation plan file, then either (a) appends a no-unresolved-discrepancies note and ends the workflow without creating discrepancy report files, or (b) creates discrepancy reports and saves them to files, appends remediation tasks to the implementation plan file, and directs the user back to Step 5. `fallback-scope` discrepancies are presented separately and require user confirmation before inclusion in remediation tasks. Discrepancy reports should use a stable section layout: `Current Run Summary`, `Open Discrepancies`, `Resolved Since Last Run`, and optionally `Historical Discrepancies`; `Current Run Summary` includes run date, branch, implementation plan path, and boundary mode.

## Shared Behavior Contract

All prompts reference `_shared-behavior-contract.md`, which defines shared behavioral rules:
clarification-first policy, path clarification before file writes, in-place workflow artifact updates (including looped Prompt 5 ↔ Prompt 6 cycles), and scope guardrails.

## Re-running a Step

Each step can be re-run independently. Re-running a step will overwrite its output artifact; downstream artifacts (implementation plan, discrepancy reports) may become stale and should be regenerated.

## Spec Artifacts

Artifacts are stored under `.github/specs/{NNN}-{short-update-name}/`, for example:
`.github/specs/001-new-feature/description.md`.
