# Implement Tasks from Plan

Use this prompt with GitHub Copilot when you want Copilot to execute implementation tasks from an existing plan.

Read and apply the rules in `.github/prompts/_shared-behavior-contract.md` before proceeding.

## Input Contract

- Source file path to the implementation plan file (`implementation-plan.md`)
  - Note: `design.md` is expected to be co-located in the same spec folder and will be passed to Prompt 6 at the end of this run.
- Optional constraints (use common input metadata defined in `.github/prompts/_shared-behavior-contract.md`)

## Prompt

Ask me for:

- The path to the implementation plan file, for example: `.github/specs/001-new-feature/implementation-plan.md`
  - Verify that `design.md` exists in the same spec folder. If it is missing, pause and ask the user to provide its location before continuing.

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
9. After completing each phase, run the `Post-Phase Find-and-Fix Cycle` for that phase.
10. Direct the user to `.github/prompts/prompt-6-report-discrepancies-and-create-remediation-plan.md` — pass the same `design.md` used for this implementation plan and the same `implementation-plan.md` to check discrepancies and, if needed, append remediation tasks.

## Post-Phase Find-and-Fix Cycle

After completing a phase, run this cycle before moving to the next phase:

1. **Scope capture**
  - Identify files modified during the just-completed phase.
  - Restrict detection and fixes to those files and in-scope phase behavior.
2. **Automated detection**
  - Run targeted checks relevant to phase-modified files (for example, lint/type/tests as applicable).
  - Prefer file-scoped or test-scoped commands to reduce unrelated noise.
3. **Issue review and fix planning**
  - Ask Copilot to review phase-modified files for phase-introduced, scope-relevant issues.
  - For each proposed fix, map it to an existing open task when possible; otherwise append a new follow-up task under the current phase task list using the next available canonical phase task ID before applying the fix.
4. **Apply fixes**
  - Apply only in-scope fixes tied to the just-completed phase.
  - Do not fix unrelated issues.
5. **Re-validation loop**
  - Re-run relevant checks/tests after fixes.
  - If regressions remain, iterate fix → re-check until checks pass or clarification is required.
6. **Plan updates**
  - Mark follow-up tasks as complete (`- [x]`) when fully applied and validated in the same run.
  - Keep unresolved follow-up tasks open (`- [ ]`) for subsequent work.

## Execution Requirements

- Follow the implementation plan as closely as practical.
- Use checkbox state as the source of truth for task completion status.
- Prefer small, reviewable changes.
- Use a Test-Driven Development (TDD) red-green-refactor loop while executing tasks.
- Use targeted validation and testing throughout the work.
- Run the post-phase find-and-fix cycle after each phase.
- Limit issue detection/fixes to files modified in that phase and in-scope behavior.
- Map each applied fix to an existing task or a newly appended follow-up task before applying.
- The implementation run is complete only when no open tasks (`- [ ]`) remain — including any tasks added during remediation.
- If there are no open tasks (`- [ ]`) at the start, append a note to the implementation plan (e.g., `Prompt 5 run [date]: no open tasks found — forwarding to Prompt 6`), state that implementation is already complete, and direct the user to Prompt 6.

The implementation execution must be specific enough that Prompt 6 can evaluate discrepancies without introducing assumptions. (Shared contract rule applies.)

---

**Next step:** `.github/prompts/prompt-6-report-discrepancies-and-create-remediation-plan.md` — pass the same `design.md` used for this implementation plan and the same `implementation-plan.md` to check discrepancies and, if needed, append remediation tasks.
