# Implement Tasks from Plan

Use this prompt with GitHub Copilot when you want Copilot to execute implementation tasks from an existing plan.

Read and apply the rules in `.github/prompts/_shared-behavior-contract.md` before proceeding.

## Prompt

Ask me for:

- The path to the implementation plan file, for example: `.github/specs/001-new-feature/implementation-plan.md`

## Input Contract

- Source file path to the implementation plan file (`implementation-plan.md`)
- Optional constraints (timeline, platform, compatibility, rollout limitations)

After I provide that file:

1. Read and analyze the implementation plan carefully.
2. Implement each incomplete task from the implementation plan.
3. Work phase-by-phase and task-by-task rather than trying to do everything at once.
4. If anything is vague, unclear, inconsistent, or ambiguous in the plan, pause and ask focused clarifying questions before continuing.
5. Detect all tasks already marked complete (`- [x]`) and skip re-implementing them.
6. Continue with tasks still open (`- [ ]`), including tasks added during remediation cycles.
7. After completing each task, update the implementation plan file to mark that task's checkbox as checked (`- [x]`).
8. After completing each phase, run a per-phase quality gate for files modified in that phase:
	1. Run `eslint --fix` on the modified files.
	2. Ask Copilot to:
		1. Review the modified files and check for problems.
		2. Document scope-relevant findings and proposed fixes as notes appended to the relevant phase section of the implementation plan.
		3. For each fix to apply: either map it to an existing open task, or append it as a new follow-up task to the implementation plan before applying it.
		4. Apply the proposed fixes.
	3. Re-run tests to verify there are no regressions.
	4. If regressions are detected, ask Copilot to fix the code so tests pass.
	5. After all fixes are applied, re-run `eslint` (without `--fix`) and re-run tests to confirm no new issues were introduced by the fixes.
9. After all phases are complete, run a final quality gate (this may be a separate final phase) for files modified across the entire plan execution:
	1. Run `eslint --fix` on the modified files.
	2. Ask Copilot to:
		1. Review the modified files and check for problems.
		2. Document scope-relevant findings and proposed fixes as notes appended to the final phase section of the implementation plan.
		3. For each fix to apply: either map it to an existing open task, or append it as a new follow-up task to the implementation plan before applying it.
		4. Apply the proposed fixes.
	3. Re-run tests to verify there are no regressions.
	4. If regressions are detected, ask Copilot to fix the code so tests pass.
	5. After all fixes are applied, re-run `eslint` (without `--fix`) and re-run tests to confirm no new issues were introduced by the fixes.
10. End by directing the user to the next step shown at the bottom of this prompt.

## Execution Requirements

- Follow the implementation plan as closely as practical.
- Use checkbox state as the source of truth for task completion status.
- Keep changes focused on the requested update.
- Prefer small, reviewable changes.
- Use targeted validation and testing throughout the work.
- Run quality gates after each phase and after all phases are complete, and keep each gate scoped to the relevant modified files.
- The implementation run is complete only when no open tasks (`- [ ]`) remain — including any tasks added during remediation — and the final quality gate passes.
- Do not fix unrelated issues unless I explicitly ask you to.
- If there are no open tasks (`- [ ]`) at the start, append a note to the implementation plan (e.g., `Prompt 5 run [date]: no open tasks found — forwarding to Prompt 6`), state that implementation is already complete, and direct the user to Prompt 6.

The implementation execution must be specific enough that Prompt 6 can evaluate discrepancies without introducing assumptions.

---

**Next step:** `.github/prompts/prompt-6-report-discrepancies-and-create-remediation-plan.md` — pass the same `design.md` used for this implementation plan and the same `implementation-plan.md` to check discrepancies and, if needed, append remediation tasks.
