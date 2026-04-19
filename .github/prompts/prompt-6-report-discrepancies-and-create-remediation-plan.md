# Check Implementation, Report Discrepancies, and Append Remediation Plan

Use this prompt with GitHub Copilot when you want Copilot to evaluate implemented code against the technical design and implementation plan, then produce discrepancy artifacts and remediation tasks when needed.

Read and apply the rules in `.github/prompts/_shared-behavior-contract.md` before proceeding.

## Prompt

Ask me for:

- The path to the technical design document, for example: `.github/specs/001-new-feature/design.md`
- The path to the implementation plan file, for example: `.github/specs/001-new-feature/implementation-plan.md`

## Input Contract

- Source file path to `design.md`
- Source file path to the implementation plan file (`implementation-plan.md`)
- Optional constraints (use common input metadata defined in `.github/prompts/_shared-behavior-contract.md`)

After I provide those files:

1. Read and analyze both documents carefully.
2. Establish the review boundary: all changes on the current git branch compared to the main branch.
3. Review the implemented code within that boundary and compare it against:
   - the technical design, and
   - the implementation plan.
4. Detect and classify discrepancies.
5. If no discrepancies are found:
   - append a note to the implementation plan stating that no unresolved discrepancies were found,
   - explicitly state that there is no need to continue implementing plan/tasks,
   - and stop.
6. If discrepancies are found:
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
  1.  `Current Run Summary` — must include: run date, branch name, and implementation plan path
  2.  `Open Discrepancies`
  3.  `Resolved Since Last Run`
  4.  `Historical Discrepancies` (optional archive)
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
- Include a `Resolution Mapping` section: Discrepancy ID → Planned Tasks → Validation.

## Consistency Requirements

- Ensure discrepancy analysis and remediation planning are consistent with the technical design and implementation plan across these dimensions: completeness, consistency, correctness, and traceability (each implemented change should map back to a design section or plan task).
- Limit discrepancy analysis to the established review boundary.
- If there are gaps, contradictions, or unresolved questions in either source file, pause and clarify before continuing. (Shared contract clarification-first rule applies.)
- If resolving a discrepancy would change requirements or design intent, pause and request approval before proceeding.

The discrepancy outputs and remediation tasks must be specific enough that Prompt 5 can execute them without introducing assumptions. (Shared contract rule applies.)

---

**Next step:** workflow complete if no discrepancies were found; otherwise use `.github/prompts/prompt-5-implement-from-plan.md` — pass the updated implementation plan to implement appended remediation tasks.
