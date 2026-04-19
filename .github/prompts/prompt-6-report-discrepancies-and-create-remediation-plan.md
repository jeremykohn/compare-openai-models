# Check Implementation, Report Discrepancies, and Append Remediation Plan

Use this prompt with GitHub Copilot when you want Copilot to evaluate implemented code against the technical design and implementation plan, then produce discrepancy artifacts and remediation tasks when needed.

Read and apply the rules in `.github/prompts/_shared-behavior-contract.md` before proceeding.

## Input Contract

- Source file path to `design.md`
- Source file path to the implementation plan file (`implementation-plan.md`)
- Optional constraints (use common input metadata defined in `.github/prompts/_shared-behavior-contract.md`)

## Prompt

Ask me for:

- The path to the technical design document, for example: `.github/specs/001-new-feature/design.md`
- The path to the implementation plan file, for example: `.github/specs/001-new-feature/implementation-plan.md`

After I provide those files:

1. Read and analyze both documents carefully.
2. Determine the current branch name from repository state (for example, run `git branch --show-current`) and include it in `Current Run Summary`.
3. Determine the repository default branch from git remote metadata (for example, run `git symbolic-ref refs/remotes/origin/HEAD | sed 's@^refs/remotes/origin/@@'`). If the default branch cannot be determined, pause and ask the user before continuing.
4. Establish the review boundary: run `git diff $(git merge-base HEAD <default-branch>) HEAD --name-only` to enumerate all files changed since the common ancestor with the repository default branch. Use this file list as the boundary for all discrepancy analysis.
   - Note: `--name-only` produces only filenames. Step 5 analysis must review actual file content. For each in-boundary file, use `git diff $(git merge-base HEAD <default-branch>) HEAD -- <file>` or read the current file contents directly to examine changes.
5. Review the implemented code within that boundary and compare it against:
   - the technical design, and
   - the implementation plan.
6. Detect and classify discrepancies.
7. If no discrepancies are found:
   - If discrepancy report files already exist and contain open items, move those items to the `Resolved Since Last Run` section before appending the run-history note.
   - Append a note under the `## Run History` section at the end of the implementation plan (create the section if it does not exist) using the canonical Prompt 6 no-discrepancies note format defined in `.github/prompts/_shared-behavior-contract.md`.
   - Explicitly state that there is no need to continue implementing plan/tasks,
   - and stop.
8. If discrepancies are found:
   - create discrepancy reports for:
     - code vs. design,
     - code vs. implementation plan,
   - save discrepancy reports to files,
   - create a remediation plan with dependency-ordered checkbox tasks,
   - append remediation phases/tasks to the implementation plan file,
   - and direct the user to return to Prompt 5 to implement newly added remediation tasks.

## Required Output Files

If discrepancies are found, save these files inside the same spec folder as the provided `design.md` (e.g., `.github/specs/001-new-feature/discrepancy-reports/`):

- `discrepancy-reports/modifications-vs-design.md`
- `discrepancy-reports/modifications-vs-implementation-plan.md`

If either report already exists, update it in place and preserve prior history.

Always update the implementation plan file by appending:

- the no-unresolved-discrepancy note, or
- remediation tasks.

## Discrepancy and Remediation Expectations

Each discrepancy report should:

- Contain these top-level sections in order:
  1. `Current Run Summary` — must include these labeled fields:
     - `Run Date:` YYYY-MM-DD
     - `Branch:` current branch name
     - `Review Boundary:` git boundary command used (e.g., `git diff $(git merge-base HEAD <default-branch>) HEAD --name-only`)
     - `Implementation Plan:` path to the implementation plan file
  2. `Open Discrepancies`
  3. `Resolved Since Last Run`
  4. `Historical Discrepancies` (optional archive)
- Clearly identify each discrepancy.
- For each discrepancy, add expected evidence (tests, file diffs, command output)
- Explain what was expected and what was actually implemented.
- If the discrepancy report conflicts with the design, the design is the source of truth unless the user says otherwise.

Each discrepancy should:

- Include a severity label: `critical`, `important`, or `minor`.
- Note the likely impact or importance of the discrepancy.

The remediation plan appended to the implementation plan should:

- Focus only on resolving open discrepancies.
- Be detailed enough to guide implementation without writing code yet.
- Note assumptions, risks, and constraints where helpful.
- Prioritize discrepancies by importance and dependency where appropriate.
- Break remediation into clear phases with rationales.
- Keep tasks small, specific, dependency-ordered, and independently verifiable.
- For each task, include validation steps, testing steps, and expected outcomes.
- Remediation tasks must use the canonical task format defined in `.github/prompts/_shared-behavior-contract.md` (task ID, description, dependencies, validation command, expected result).
- Include a `Resolution Mapping` section: Discrepancy ID → Planned Tasks → Validation.

## Consistency Requirements

- Ensure discrepancy analysis and remediation planning are consistent with the technical design and implementation plan across these dimensions: completeness, consistency, correctness, and traceability (each implemented change should map back to a design section or plan task).
- Limit discrepancy analysis to the established review boundary.
- If there are gaps, contradictions, or unresolved questions in either source file, pause and clarify before continuing. (Shared contract clarification-first rule applies.)
- If resolving a discrepancy would change requirements or design intent, pause and request approval before proceeding.

The discrepancy outputs and remediation tasks must be specific enough that Prompt 5 can execute them without introducing assumptions. (Shared contract specificity rule applies.)

---

**Next step:** workflow complete if no discrepancies were found; otherwise use `.github/prompts/prompt-5-implement-from-plan.md` — pass the updated implementation plan to implement appended remediation tasks.
