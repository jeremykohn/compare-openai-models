# Implement Tasks from Plan

Use this prompt with GitHub Copilot when you want Copilot to execute implementation tasks from an existing plan.

Read and apply the rules in `.github/prompts/_shared-behavior-contract.md` before proceeding.

## Prompt

Ask me for:

- The path to the implementation plan file, for example: `.github/specs/001-new-feature/implementation-plan.md`

## Input Contract

- Source file path to the implementation plan file (`implementation-plan.md`)
  - Note: `design.md` is expected to be co-located in the same spec folder and will be passed to Prompt 6 at the end of this run.
- Optional constraints (use common input metadata defined in `.github/prompts/_shared-behavior-contract.md`)

After I provide that file:

1. Read and analyze the implementation plan carefully.
2. Implement each incomplete task from the implementation plan.
3. Use a Test-Driven Development (TDD) red-green-refactor loop while implementing each task:
   1. Write or update a failing test that captures the intended behavior (`red`).
   2. Implement the minimal code change needed to make the test pass (`green`).
   3. Refactor while keeping tests passing (`refactor`).
4. Work phase-by-phase and task-by-task rather than trying to do everything at once.
5. If anything in the plan is vague, unclear, or ambiguous, pause and clarify before continuing. (Shared contract clarification-first rule applies.)
6. Detect all tasks already marked complete (`- [x]`) and skip re-implementing them.
7. Continue with tasks still open (`- [ ]`), including tasks added during remediation cycles.
8. After completing each task, update the implementation plan file to mark that task's checkbox as checked (`- [x]`).
9. After completing each phase, run a per-phase quality gate for files modified in that phase:
   1. Run `eslint --fix` on the modified files.
   2. Ask Copilot to:
      1. Review the modified files and check for problems.
      2. Document scope-relevant findings and proposed fixes under the `Quality Gate Notes` subsection in the relevant phase of the implementation plan file. If the section already exists, append entries in place; do not create duplicate `Quality Gate Notes` sections. Use the `Canonical Quality-Gate Note Entry Schema` section in `.github/prompts/_shared-behavior-contract.md`.
      3. For each fix to apply: either map it to an existing open task, or append it as a new follow-up task before applying it. Place new follow-up tasks in the same phase task list when phase-scoped (using the canonical phase task ID convention in `.github/prompts/_shared-behavior-contract.md`); otherwise append them under the `Quality Gate Follow-up Tasks` section at the end of the implementation plan file (using the canonical non-phase-scoped quality-gate follow-up task ID convention in `.github/prompts/_shared-behavior-contract.md`).
      4. Apply the proposed fixes.
      5. If a new follow-up task was added in this quality gate and the fix is fully applied and validated in this same run, mark that follow-up task as complete (`- [x]`) before ending the quality gate, and keep the same task ID in both the task checkbox entry and its `Task link` note entry; otherwise leave it open (`- [ ]`) for subsequent execution.
   3. Re-run tests to verify there are no regressions.
   4. If regressions are detected, ask Copilot to fix the code so tests pass.
   5. After all fixes are applied, re-run `eslint` (without `--fix`) and re-run tests to confirm no new issues were introduced by the fixes.
10. After all phases are complete, run a final quality gate (this may be a separate final phase) for files modified across the entire plan execution:
   1. Run `eslint --fix` on the modified files.
   2. Ask Copilot to:
      1. Review the modified files and check for problems.
      2. Document scope-relevant findings and proposed fixes under the `Final Quality Gate Notes` section of the implementation plan file. If the section already exists, append entries in place; do not create duplicate `Final Quality Gate Notes` sections. Use the `Canonical Quality-Gate Note Entry Schema` section in `.github/prompts/_shared-behavior-contract.md`.
      3. For each fix to apply: either map it to an existing open task, or append it as a new follow-up task before applying it under the `Quality Gate Follow-up Tasks` section at the end of the implementation plan file (using the canonical non-phase-scoped quality-gate follow-up task ID convention in `.github/prompts/_shared-behavior-contract.md`).
      4. Apply the proposed fixes.
      5. If a new follow-up task was added in this quality gate and the fix is fully applied and validated in this same run, mark that follow-up task as complete (`- [x]`) before ending the quality gate, and keep the same task ID in both the task checkbox entry and its `Task link` note entry; otherwise leave it open (`- [ ]`) for subsequent execution.
   3. Re-run tests to verify there are no regressions.
   4. If regressions are detected, ask Copilot to fix the code so tests pass.
   5. After all fixes are applied, re-run `eslint` (without `--fix`) and re-run tests to confirm no new issues were introduced by the fixes.
11. Direct the user to `.github/prompts/prompt-6-report-discrepancies-and-create-remediation-plan.md` — pass the same `design.md` used for this implementation plan and the same `implementation-plan.md` to check discrepancies and, if needed, append remediation tasks.

## Execution Requirements

- Follow the implementation plan as closely as practical.
- Use checkbox state as the source of truth for task completion status.
- Prefer small, reviewable changes.
- Use a Test-Driven Development (TDD) red-green-refactor loop while executing tasks.
- Use targeted validation and testing throughout the work.
- Run quality gates after each phase and after all phases are complete, and keep each gate scoped to the relevant modified files.
- The implementation run is complete only when no open tasks (`- [ ]`) remain — including any tasks added during remediation — and the final quality gate passes.
- If there are no open tasks (`- [ ]`) at the start, append a note to the implementation plan (e.g., `Prompt 5 run [date]: no open tasks found — forwarding to Prompt 6`), state that implementation is already complete, and direct the user to Prompt 6.

The implementation execution must be specific enough that Prompt 6 can evaluate discrepancies without introducing assumptions. (Shared contract rule applies.)

---

**Next step:** `.github/prompts/prompt-6-report-discrepancies-and-create-remediation-plan.md` — pass the same `design.md` used for this implementation plan and the same `implementation-plan.md` to check discrepancies and, if needed, append remediation tasks.
