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
  - **Red:** Write or update a failing test that captures the intended behavior.
  - **Green:** Implement the minimal code change needed to make the test pass.
  - **Refactor:** Refactor while keeping tests passing.
4. Work phase-by-phase and task-by-task rather than trying to do everything at once.
5. If anything in the plan is vague, unclear, or ambiguous, pause and clarify before continuing. (Shared contract clarification-first rule applies.)
6. Detect all tasks already marked complete (`- [x]`) and skip re-implementing them.
7. Continue with tasks still open (`- [ ]`), including tasks added during remediation cycles.
8. After completing each task, update the implementation plan file to mark that task's checkbox as checked (`- [x]`).
9. When all open tasks under the current phase are completed, and before starting tasks under the next phase heading, run the `Post-Phase Find-and-Fix Cycle` for that phase.
10. When all tasks are complete, proceed to the next step (see footer below).

## Post-Phase Find-and-Fix Cycle

After completing a phase, run this cycle before moving to the next phase. A phase is complete when all open tasks under the current phase are completed.
Repeat this cycle for the current phase until no open tasks remain in that phase after follow-up task insertions.

**Round tracking:** Maintain a per-phase round counter starting at 1. Increment by 1 each time this cycle runs for the same phase. Reset to 1 when starting a new phase. Use the current round number when naming subsections (see step 3).

**Permission gate:** Rounds 1 through 3 for each phase run without additional permission. After completing round 3, stop and ask the user before running round 4. For every additional round beyond 3 in the same phase (round 4, 5, 6, ...), ask again before each round. Deterministic behavior at the gate:

- If the user says yes (or equivalent), run exactly one additional round, then ask again before the next.
- If the user says no, pause until the user says to resume.
- If the user says to skip to the next phase, stop find-and-fix for the current phase and proceed to the next phase immediately, even when unresolved fixes remain. Unresolved issues may remain open in the current phase when the user directs a skip; this is allowed. Preserve any existing open tasks — do not force additional rounds to close them.
- If the user does not respond, or if the response is unclear, vague, or ambiguous, pause and ask the user to clarify.

The 3-round threshold applies independently to each phase. The per-phase round counter resets to 1 at the start of each new phase.

1. **Scope capture**
  - Identify files modified during the just-completed phase.
  - Restrict detection and fixes to those files and in-scope phase behavior.
2. **Automated detection**
  - Run targeted checks relevant to phase-modified files (for example, lint/type/tests as applicable).
  - Prefer file-scoped or test-scoped commands to reduce unrelated noise.
3. **Issue review and fix planning**
  - Ask Copilot to review phase-modified files for phase-introduced, scope-relevant issues.
  - For each issue found, propose a fix.
  - For each proposed fix, map it to an existing open task when possible; otherwise create a new follow-up task in a dedicated subsection for this round under the current phase task list:
    - If no subsection for this round exists yet, create it with the heading `#### Find-and-Fix Round {n}` (where `{n}` is the current phase round counter) immediately before appending the first task.
    - Append new follow-up tasks inside this round's subsection using the same full canonical task format as the implementation plan (checkbox line, `Task ID`, `Description`, `Dependencies`, `Validation command`, and `Expected result`) and the next available canonical phase task ID.
    - Include a `Severity` field on each follow-up task using only: `critical`, `important`, or `minor`.
    - `Severity` is an additional required field for find-and-fix-created follow-up tasks and does not replace or redefine the shared canonical task format.
    - When appending one or more follow-up tasks for the round, append in deterministic severity order: all `critical` tasks first, then all `important` tasks, then all `minor` tasks.
    - For tasks with the same severity, preserve discovery order within that severity bucket.
    - Place the subsection under the same phase section where the fix was detected; do not create global or cross-phase subsections.
4. **Apply fixes**
  - Apply only in-scope fixes tied to the just-completed phase.
  - Do not fix unrelated issues.
5. **Re-validation loop**
  - Re-run relevant checks/tests after fixes.
  - If regressions remain, iterate fix → re-check until checks pass or clarification is required.
6. **Plan updates**
  - Mark follow-up tasks as complete (`- [x]`) when fully applied and validated in the same run.
  - Keep unresolved follow-up tasks open (`- [ ]`) until they are revisited and completed later in the same Prompt 5 run, before starting the next phase or ending the Prompt 5 run (for the final phase).

## Execution Requirements

- Follow the implementation plan as closely as practical.
- Preserve in-scope requirement-category coverage represented in the implementation plan, including security, accessibility, and performance concerns when present.
- Use checkbox state as the source of truth for task completion status.
- Prefer small, reviewable changes.
- Follow the TDD red-green-refactor loop as defined in step 3 above.
- Use targeted validation and testing throughout the work.
- Run the post-phase find-and-fix cycle after each phase.
- Limit issue detection/fixes to files modified in that phase and in-scope behavior.
- Map each applied fix to an existing task or a newly appended follow-up task before applying.
- The implementation run is complete only when no open tasks (`- [ ]`) remain — including any tasks added during remediation.
- If there are no open tasks (`- [ ]`) at the start, append a note under the `## Run History` section at the end of the implementation plan (create the section if it does not exist) using the canonical Prompt 5 no-open-tasks note format defined in `.github/prompts/_shared-behavior-contract.md`.

  State that implementation is already complete and direct the user to Prompt 6.

The implementation execution must be specific enough that Prompt 6 can evaluate discrepancies without introducing assumptions. (Shared contract specificity rule applies.)

---

**Next step:** `.github/prompts/prompt-6-report-discrepancies-and-create-remediation-plan.md` — pass the same `design.md` used for this implementation plan and the same `implementation-plan.md` to check discrepancies and, if needed, append remediation tasks.
