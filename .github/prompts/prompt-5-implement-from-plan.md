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
9. Direct the user to `.github/prompts/prompt-6-report-discrepancies-and-create-remediation-plan.md` — pass the same `design.md` used for this implementation plan and the same `implementation-plan.md` to check discrepancies and, if needed, append remediation tasks.

## Execution Requirements

- Follow the implementation plan as closely as practical.
- Use checkbox state as the source of truth for task completion status.
- Prefer small, reviewable changes.
- Use a Test-Driven Development (TDD) red-green-refactor loop while executing tasks.
- Use targeted validation and testing throughout the work.
- The implementation run is complete only when no open tasks (`- [ ]`) remain — including any tasks added during remediation.
- If there are no open tasks (`- [ ]`) at the start, append a note to the implementation plan (e.g., `Prompt 5 run [date]: no open tasks found — forwarding to Prompt 6`), state that implementation is already complete, and direct the user to Prompt 6.

The implementation execution must be specific enough that Prompt 6 can evaluate discrepancies without introducing assumptions. (Shared contract rule applies.)

---

**Next step:** `.github/prompts/prompt-6-report-discrepancies-and-create-remediation-plan.md` — pass the same `design.md` used for this implementation plan and the same `implementation-plan.md` to check discrepancies and, if needed, append remediation tasks.
