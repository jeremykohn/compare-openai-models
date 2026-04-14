# Copilot Prompt Workflow

This folder contains a sequence of Copilot prompts for making structured updates to this repository.
Each prompt produces an artifact that feeds the next step.

## Workflow Overview

| Step | Prompt file | Input | Output |
|------|-------------|-------|--------|
| 1 | `prompt-1-create-specific-descriptions-from-general-description.md` | General idea | `description.md` |
| 2 | `prompt-2-create-requirements-from-description.md` | `description.md` | `requirements.md` |
| 3 | `prompt-3-create-technical-design-from-requirements.md` | `requirements.md` | `design.md` |
| 4 | `prompt-4-create-implementation-plan-from-design.md` | `design.md` | `implementation-plan.md` (tasks formatted as checkboxes) |
| 5 | `prompt-5-implement-from-plan.md` | implementation plan file (`implementation-plan.md`) | Code changes + updated task checkboxes (`- [x]`) |
| 6 | `prompt-6-report-discrepancies-and-create-remediation-plan.md` | `design.md` + implementation plan file (`implementation-plan.md`) | If discrepancies found: report files + remediation tasks appended to plan; otherwise: no-discrepancy note appended to plan |

Step 5 is execution-only: it implements open plan tasks from `implementation-plan.md`, marks completed checkboxes (`- [x]`), runs a quality gate after each phase (check newly modified files, document and apply scope-relevant fixes), and runs a final quality gate after all phases (check all modified files, document and apply remaining fixes).

Step 6 is review/remediation: it compares implemented code against design + implementation plan file, then either (a) appends a no-discrepancy note and ends the workflow without creating discrepancy report files, or (b) creates discrepancy reports and saves them to files, appends remediation tasks to the implementation plan file, and directs the user back to Step 5. Discrepancy reports should use a stable section layout: `Current Run Summary`, `Open Discrepancies`, `Resolved Since Last Run`, and optionally `Historical Discrepancies`.

## Shared Behavior Contract

All prompts reference `_shared-behavior-contract.md`, which defines shared behavioral rules:
clarification-first policy, destination confirmation before writing files, and scope guardrails.

## Re-running a Step

Each step can be re-run independently. Re-running a step will overwrite its output artifact; downstream artifacts (implementation plan, discrepancy reports) may become stale and should be regenerated.

## Spec Artifacts

Artifacts are stored under `.github/specs/{NNN}-{short-update-name}/`, for example:
`.github/specs/001-new-feature/description.md`.
