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
| 5 | `prompt-5-implement-from-plan.md` | `design.md` + implementation plan (`implementation-plan.md`) | Code changes + updated task checkboxes (`- [x]`) |
| 6 | `prompt-6-report-discrepancies-and-create-remediation-plan.md` | `design.md` + implementation plan (`implementation-plan.md`) | Discrepancy reports saved to files + remediation tasks (if needed) appended to implementation plan |

Step 5 is execution-only: it implements open plan tasks and marks completed checkboxes (`- [x]`), including tasks added by remediation. Step 6 is review/remediation: it compares implemented code against design + implementation plan, then either (a) appends a no-discrepancy note and ends the workflow, or (b) creates discrepancy reports and saves them to files, appends remediation tasks to the implementation plan, and directs the user back to Step 5. Discrepancy reports should use a stable section layout: `Current Run Summary`, `Open Discrepancies`, `Resolved Since Last Run`, and optionally `Historical Discrepancies`.

## Shared Behavior Contract

All prompts reference `_shared-behavior-contract.md`, which defines shared behavioral rules:
clarification-first policy, destination confirmation before writing files, and scope guardrails.

## Spec Artifacts

Artifacts are stored under `.github/specs/{NNN}-{short-update-name}/`, for example:
`.github/specs/001-new-feature/description.md`.
