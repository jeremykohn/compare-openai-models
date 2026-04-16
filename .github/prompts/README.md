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

## Shared Behavior Contract

All prompts reference `_shared-behavior-contract.md`, which defines shared behavioral rules:
clarification-first policy, path clarification before file writes, in-place workflow artifact updates (including looped Prompt 5 ↔ Prompt 6 cycles), and scope guardrails.

## Re-running a Step

Each step can be re-run independently. Re-running a step will overwrite its output artifact; downstream artifacts (implementation plan files, discrepancy reports) may become stale and should be regenerated.

## Spec Artifacts

Artifacts are stored under `.github/specs/{NNN}-{short-update-name}/`, for example:
`.github/specs/001-new-feature/description.md`.
