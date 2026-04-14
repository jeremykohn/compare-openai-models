# Implement Tasks from Plan

Use this prompt with GitHub Copilot when you want Copilot to execute implementation tasks from an existing plan.

Read and apply the rules in `.github/prompts/_shared-behavior-contract.md` before proceeding.

## Prompt

Ask me for:

- The path to the technical design document, for example: `.github/specs/001-new-feature/design.md`
- The path to the implementation plan document, for example: `.github/specs/001-new-feature/implementation-plan.md`

## Input Contract

- Source file path to `design.md`
- Source file path to the implementation plan `implementation-plan.md`
- Optional constraints (timeline, platform, compatibility, rollout limitations)

After I provide those files:

1. Read and analyze both documents carefully.
2. Implement each incomplete task from the implementation plan.
3. Work phase-by-phase and task-by-task rather than trying to do everything at once.
4. If anything is vague, unclear, inconsistent, or ambiguous in the design or plan, pause and ask focused clarifying questions before continuing.
5. Detect all tasks already marked complete (`- [x]`) and skip re-implementing them.
6. Continue with tasks still open (`- [ ]`), including tasks added during remediation cycles.
7. After completing each task, update the implementation plan file to mark that task's checkbox as checked (`- [x]`).
8. End by directing the user to run `.github/prompts/prompt-6-report-discrepancies-and-create-remediation-plan.md` for discrepancy checking and remediation planning.

## Execution Requirements

- Follow the implementation plan as closely as practical.
- Use checkbox state as the source of truth for task completion status.
- Keep changes focused on the requested update.
- Prefer small, reviewable changes.
- Use targeted validation and testing throughout the work.
- Do not fix unrelated issues unless I explicitly ask you to.
- If there are no open tasks (`- [ ]`) at the start, append a note to the implementation plan (e.g., `Prompt 5 run [date]: no open tasks found — forwarding to Prompt 6`), state that implementation is already complete, and direct the user to Prompt 6.

The implementation execution must be specific enough that Prompt 6 can evaluate discrepancies without introducing assumptions.

---

**Next step:** `.github/prompts/prompt-6-report-discrepancies-and-create-remediation-plan.md` — pass `design.md` and the same implementation plan to check discrepancies and, if needed, append remediation tasks.
