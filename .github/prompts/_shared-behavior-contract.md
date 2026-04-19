# Shared Behavior Contract

- If anything in any prompts, requirements, design, tasks, or other input is unclear, vague, conflicting, incomplete, or ambiguous, pause and ask focused clarifying questions before proceeding.
- If any paths for source or destination files are uncertain or unspecified, pause and ask which path to use.
- Common input metadata for prompts: optional constraints may include timeline, platform, compatibility, and rollout limitations.
- Do not overwrite unrelated files. If the active prompt requires updating an existing workflow artifact (for example, implementation plan files or discrepancy reports), update it in place. If replacement of non-workflow content seems required, pause and ask what to do.
- Create only requested output files; do not create extra documentation or reports unless asked.
- Keep output focused on the requested update.
- Each workflow artifact must be specific enough for the next step to proceed without introducing assumptions.
- When the workflow loops (for example, `prompt-5-implement-from-plan.md` → `prompt-6-report-discrepancies-and-create-remediation-plan.md` → `prompt-5-implement-from-plan.md`), continue updating the same plan and report artifacts in place unless the user requests a new artifact.
- Do not write or implement any code unless the active prompt explicitly authorizes it. `prompt-5-implement-from-plan.md` overrides this default.
- When writing or implementing code based on an implementation prompt, do not fix unrelated issues unless explicitly asked.
- When possible, keep reports and outputs concise but specific.

## Standard Prompt Header

Workflow prompts in `.github/prompts/` may include this standardized header near the top of the file to ensure Copilot reads and applies this shared contract before executing the prompt:

```
Read and apply the rules in `.github/prompts/_shared-behavior-contract.md` before proceeding.
```

## Canonical Workflow Task ID Conventions

Use these canonical task ID conventions throughout the workflow:

- Phase task IDs use `P{phase-number}-T{task-number}`.
