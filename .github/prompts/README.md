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
| 5 | `prompt-5-implement-from-plan-and-save-discrepancies.md` | `design.md` + `implementation-plan.md` | Code changes + discrepancy reports (created, updated, or initialized with no-discrepancy note) |
| 6 | `prompt-6-create-remediation-plan-from-discrepancy-report.md` | `design.md` + discrepancy report | Remediation tasks appended to `implementation-plan.md` if it exists, otherwise new `implementation-plan-resolve-discrepancies.md` |

After step 6, re-run step 5 with the updated implementation plan to close remaining discrepancies. Each task in the implementation plan is formatted as a markdown checkbox (`- [ ]`); step 5 checks off each task as it is completed (`- [x]`). Step 5 will update the existing discrepancy reports in place — marking resolved issues and adding any new ones — rather than replacing them. Discrepancy reports should use a stable section layout: `Current Run Summary`, `Open Discrepancies`, `Resolved Since Last Run`, and optionally `Historical Discrepancies`. Step 6 is only needed when there are open discrepancies; if none exist, or all have been resolved, the workflow is complete.

## Shared Behavior Contract

All prompts reference `_shared-behavior-contract.md`, which defines shared behavioral rules:
clarification-first policy, destination confirmation before writing files, and scope guardrails.

## Spec Artifacts

Artifacts are stored under `.github/specs/{NNN}-{short-update-name}/`, for example:
`.github/specs/001-new-feature/description.md`.
