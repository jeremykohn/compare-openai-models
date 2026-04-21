# Shared Behavior Contract

**Workflow artifacts** are the files produced and consumed by the workflow prompts: `description.md`, `requirements.md`, `design.md`, `implementation-plan.md`, and `discrepancy-reports/*.md`. Source code files are not workflow artifacts.

- If anything in any prompts, requirements, design, tasks, or other input is unclear, vague, conflicting, incomplete, or ambiguous, pause and ask focused clarifying questions before proceeding.
- If any paths for source or destination files are uncertain or unspecified, pause and ask which path to use.
- Common input metadata for prompts: optional constraints may include timeline, platform, compatibility, and rollout limitations.
- Do not overwrite unrelated files. If the active prompt requires updating an existing workflow artifact (for example, implementation plan files or discrepancy reports), update it in place. If replacement of non-workflow content seems required, pause and ask what to do.
- Create only requested output files; do not create extra documentation or reports unless asked.
- Keep output focused on the requested update.
- Each workflow artifact must be specific enough for the next step to proceed without introducing assumptions.
- When the workflow loops (for example, `prompt-5-implement-from-plan.md` → `prompt-6-report-discrepancies-and-create-remediation-plan.md` → `prompt-5-implement-from-plan.md`):
	- Update the existing `implementation-plan.md` and `discrepancy-reports/*.md` files in place by appending new content (phases, tasks, run history).
	- Updates to `discrepancy-reports/*.md` follow the structured section model defined in Prompt 6: update `Current Run Summary`, move newly resolved items to `Resolved Since Last Run`, and append any new open discrepancies.
	- Do not create new artifact files for additional loop iterations unless the user requests a new artifact.
- Do not write or implement any code unless the active prompt explicitly authorizes it. `prompt-5-implement-from-plan.md` overrides this default.
- When writing or implementing code based on an implementation prompt, do not fix unrelated issues unless explicitly asked.
- When an active prompt explicitly requires post-phase issue detection and fixing, applying those fixes is allowed when they remain in scope.
- When possible, keep reports and outputs concise but specific.

## Standard Prompt Header

Workflow prompts in `.github/prompts/` use this standardized header near the top of the file to ensure Copilot reads and applies this shared contract before executing the prompt:

```
Read and apply the rules in `.github/prompts/_shared-behavior-contract.md` before proceeding.
```


## Canonical ID Conventions

All tasks, requirements, and discrepancies must have a unique, stable, and traceable ID.

Shared rules for all ID types:

- Preserve all existing IDs. Do not renumber, replace, or delete existing IDs for unchanged items.
- Do not reuse gaps left by removed, merged, superseded, or resolved items.
- Deterministic uniqueness rule: when assigning a new ID, scan existing IDs in that item's scope and use the next available number after the highest existing ID number.
- When updating an artifact in place, preserve original IDs unless an item is split or merged (in that case, assign new IDs using the deterministic uniqueness rule).

### Task IDs

- Task IDs, including follow-up tasks appended during execution, use the format `P{phase-number}-T{n}`.
- Task ID scope is per phase within the implementation plan.

### Requirement IDs

- Functional requirements use `FR-{n}`.
- Technical requirements use `TR-{n}`.
- Security requirements use `SR-{n}`.
- Accessibility requirements use `AR-{n}`.
- Performance requirements use `PR-{n}`.
- Requirement ID scope is per `requirements.md` artifact (per spec folder), per category.
- Numbering starts at `1` for each requirements category, and increments sequentially (`1`, `2`, `3`, ...).
- Assign new requirement IDs only to newly added requirements.

### Discrepancy IDs

- Discrepancies use `DISC-{n}`.
- Discrepancy ID scope is per spec folder across all discrepancy report files.
- Numbering starts at `1` and increments sequentially (`DISC-1`, `DISC-2`, ...).
- Include the assigned `DISC-{n}` ID at the start of each discrepancy entry and in the `Resolution Mapping`.

### Discrepancy Report Archive Rollover

- Discrepancy reports must maintain these sections in order: `Current Run Summary`, `Open Discrepancies`, `Resolved Since Last Run`, `Historical Discrepancies`.
- Apply archive rollover on every Prompt 6 run, including no-discrepancy runs.
- Before recording newly resolved discrepancies for the current run, move any items that were already present in `Resolved Since Last Run` from the prior run into `Historical Discrepancies`.
- Then record newly resolved discrepancies for the current run in `Resolved Since Last Run`.

## Spec Folder Naming Convention

When creating a new spec folder under `.github/specs/`:

- Name the folder `{NNN}-{short-update-name}`, where `NNN` is the next sequential number after the highest existing numbered folder (e.g., `002`, `003`). Use `001` if no numbered folder exists yet.
- `short-update-name` is a short kebab-case phrase describing the update.
- Before writing any files, verify the computed folder name does not already exist. If it does (for example, due to a concurrent run), re-scan and choose the next available `NNN`.

## Implementation Plan Run History Notes

When Prompt 5 or Prompt 6 appends run-history notes to `implementation-plan.md`:

- Append notes under a dedicated `## Run History` section at the end of the file.
- If the section does not exist yet, create it before appending the new note.
- Append new notes in chronological order.
- Use the canonical note formats below. Prompts 5 and 6 must not redefine these formats inline.
- In the formats below, replace `[YYYY-MM-DD]` with the actual run date in ISO 8601 format (e.g., `2026-04-19`). Use an em-dash (`—`) not a hyphen (`-`).

Canonical Prompt 5 no-open-tasks note:
```
> **Prompt 5 run — [YYYY-MM-DD]:** No open tasks found. Forwarding to Prompt 6.
```

Canonical Prompt 6 no-discrepancies note:
```
> **Prompt 6 run — [YYYY-MM-DD]:** No unresolved discrepancies found. Workflow complete.
```
