# Shared Behavior Contract

**Workflow artifacts** are the files produced and consumed by the workflow prompts: `description.md`, `requirements.md`, `design.md`, `implementation-plan.md`, and `discrepancy-reports/*.md`. Source code files are not workflow artifacts.

- If anything in any prompts, requirements, design, tasks, or other input is unclear, vague, conflicting, incomplete, or ambiguous, pause and ask focused clarifying questions before proceeding.
- If any paths for source or destination files are uncertain or unspecified, pause and ask which path to use.
- Common input metadata for prompts: optional constraints may include timeline, platform, compatibility, and rollout limitations.
- Do not overwrite unrelated files. If the active prompt requires updating an existing workflow artifact (for example, implementation plan files or discrepancy reports), update it in place. If replacement of non-workflow content seems required, pause and ask what to do.
- Create only requested output files; do not create extra documentation or reports unless asked.
- Keep output focused on the requested update.
- Each workflow artifact must be specific enough for the next step to proceed without introducing assumptions.
- When the workflow loops (for example, `prompt-5-implement-from-plan.md` → `prompt-6-report-discrepancies-and-create-remediation-plan.md` → `prompt-5-implement-from-plan.md`), update the existing `implementation-plan.md` and `discrepancy-reports/*.md` files in place by appending new content (phases, tasks, run history). Do not create new artifact files for additional loop iterations unless the user requests a new artifact.
- Do not write or implement any code unless the active prompt explicitly authorizes it. `prompt-5-implement-from-plan.md` overrides this default.
- When writing or implementing code based on an implementation prompt, do not fix unrelated issues unless explicitly asked.
- When an active prompt explicitly requires post-phase issue detection and fixing, applying those fixes is allowed when they remain in scope.
- When possible, keep reports and outputs concise but specific.

## Standard Prompt Header

Workflow prompts in `.github/prompts/` may include this standardized header near the top of the file to ensure Copilot reads and applies this shared contract before executing the prompt:

```
Read and apply the rules in `.github/prompts/_shared-behavior-contract.md` before proceeding.
```

## Canonical Workflow Task ID Conventions

Use these canonical task ID conventions throughout the workflow:

- Phase task IDs use `P{phase-number}-T{task-number}`.
- When appending a new phase-scoped follow-up task, preserve all existing task IDs and assign the next highest available `T{n}` within that phase.
- Do not reuse gaps left by removed, completed, or renumbered tasks.
- If a proposed phase task ID collides with an existing ID, increment to the next available `T{n}` in that phase.

## Spec Folder Naming Convention

When creating a new spec folder under `.github/specs/`:

- Name the folder `{NNN}-{short-update-name}`, where `NNN` is the next sequential number after the highest existing numbered folder (e.g., `002`, `003`). Use `001` if no numbered folder exists yet.
- `short-update-name` is a short kebab-case phrase describing the update.
- Before writing any files, verify the computed folder name does not already exist. If it does (for example, due to a concurrent run), re-scan and choose the next available `NNN`.
