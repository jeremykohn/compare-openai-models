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
3. Determine the repository default branch using this fallback order:
   - first, try `origin/HEAD` from git remote metadata (for example, run `git symbolic-ref refs/remotes/origin/HEAD | sed 's@^refs/remotes/origin/@@'`),
   - if unavailable, list remote names, sort them lexically, and use the first remote `HEAD` in that sorted order that can be resolved,
   - if still unavailable, pause and ask the user before continuing.
4. Carry forward the exact resolved branch/ref from step 3 as `<resolved-default-branch-ref>` and reuse it in all boundary commands and report metadata for this run.
5. Establish the review boundary: run `git diff $(git merge-base HEAD <resolved-default-branch-ref>) HEAD --name-only` to enumerate all files changed since the common ancestor with the resolved default branch ref. Use this file list as the boundary for all discrepancy analysis.
   - Note: `--name-only` produces only filenames. Discrepancy analysis (see below) must review actual file content. For each in-boundary file, use `git diff $(git merge-base HEAD <resolved-default-branch-ref>) HEAD -- <file>` or read the current file contents directly to examine changes.
6. Review the implemented code within that boundary and compare it against:
   - the technical design, and
   - the implementation plan.
7. Detect and classify discrepancies.
8. If no discrepancies are found:
   - if discrepancy report files already exist and contain open items, evaluate each open `DISC-{n}` item individually and collect explicit closure evidence before changing status.
   - move only open `DISC-{n}` items with explicit closure evidence to `Resolved Since Last Run`; carry forward all other open items in `Open Discrepancies` with a short boundary/context note when helpful.
   - apply archive rollover rules on every run (including no-discrepancy runs: move older items already present in `Resolved Since Last Run` to `Historical Discrepancies` before recording newly resolved items for the current run).
   - append a note under the `## Run History` section at the end of the implementation plan (create the section if it does not exist) using the canonical Prompt 6 no-discrepancies note format defined in `.github/prompts/_shared-behavior-contract.md`.
   - explicitly state that there is no need to continue implementing plan/tasks,
   - and stop.
9. If discrepancies are found:
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

At the end of each run, update the implementation plan file by appending either the no-discrepancy note (step 8) or remediation tasks (step 9).

## Discrepancy and Remediation Expectations

Each discrepancy report should:

- Contain these top-level sections in order:
   1. `Current Run Summary` — must include these labeled fields:
     - `Run Date:` YYYY-MM-DD
     - `Branch:` current branch name
     - `Resolved Default Branch Ref:` exact resolved branch/ref from step 3
     - `Review Boundary:` git boundary command used with the exact resolved ref (e.g., `git diff $(git merge-base HEAD <resolved-default-branch-ref>) HEAD --name-only`)
     - `Implementation Plan:` path to the implementation plan file
   2. `Open Discrepancies`
   3. `Resolved Since Last Run`
   4. `Historical Discrepancies` (archive) — at the start of each new run, move all items from `Resolved Since Last Run` that were already present in the prior run into this section before populating `Resolved Since Last Run` with newly resolved items from the current run.
- Archive rollover rules apply on every run, including no-discrepancy runs. See the canonical rule in `_shared-behavior-contract.md` for details.
- Assign each discrepancy a `DISC-{n}` ID using the convention defined in `.github/prompts/_shared-behavior-contract.md`. Include the ID at the start of each discrepancy entry.
- For each discrepancy, add expected evidence (tests, file diffs, command output)
- Explain what was expected and what was actually implemented.
- If the discrepancy report conflicts with the design, the design is the source of truth unless the user says otherwise.

Each discrepancy should:

- Include a severity label: `critical`, `important`, or `minor`.
- Note the likely impact or importance of the discrepancy.

The remediation plan appended to the implementation plan must:

- Focus only on resolving open discrepancies.
- Be detailed enough to guide implementation without writing code yet.
- Be actionable, clear, and traceable to the discrepancies and requirements.
- Be deterministic and reproducible: given the same input, the same plan must be produced.
- Use clear, direct, and concise language; avoid ambiguous or hedged statements.
- Note assumptions, risks, and constraints where helpful.
- Prioritize discrepancies by importance and dependency where appropriate.
- Break remediation into clear phases with rationales.
- Keep tasks small, specific, dependency-ordered, and independently verifiable.
- Use the canonical task format defined in `.github/prompts/_shared-behavior-contract.md` (task ID, description, dependencies, validation command, expected result) for remediation tasks.
- Ensure validation and testing expectations are captured through each task's `Validation command` and `Expected result` fields.
- Include a `Resolution Mapping` section: Discrepancy ID → Planned Tasks → Validation.

## Consistency Requirements

- Ensure discrepancy analysis and remediation planning are consistent with the technical design and implementation plan across these dimensions: completeness, consistency, correctness, and traceability (each implemented change should map back to a design section or plan task).
- Verify category-aware requirement coverage in discrepancy analysis: when requirement categories represented in the design or plan (including `FR-{n}`, `TR-{n}`, `SR-{n}`, `AR-{n}`, and `PR-{n}` when present) are in scope, confirm implementation evidence addresses them or record discrepancies explicitly.
- Limit discrepancy analysis to the established review boundary.
- If there are gaps, contradictions, or unresolved questions in either source file, pause and clarify before continuing. (Shared contract clarification-first rule applies.)
- If resolving a discrepancy would change requirements or design intent, pause and request approval before proceeding.

The discrepancy outputs and remediation tasks must be specific enough that Prompt 5 can execute them without introducing assumptions. (Shared contract specificity rule applies.)

---

**Next step:** workflow complete if no discrepancies were found; otherwise use `.github/prompts/prompt-5-implement-from-plan.md` — pass the updated implementation plan to implement appended remediation tasks.
