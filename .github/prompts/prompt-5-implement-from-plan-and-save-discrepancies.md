# Implement from Plan and Save Discrepancy Reports

Use this prompt with GitHub Copilot when you want Copilot to execute an implementation plan, validate the resulting changes, and save discrepancy reports comparing the work against the plan and technical design.

Read and apply the rules in `.github/prompts/_shared-behavior-contract.md` before proceeding.

## Prompt

Ask me for:
- The path to the technical design document, for example: `.github/specs/001-new-feature/design.md`
- The path to the implementation plan document, for example: `.github/specs/001-new-feature/implementation-plan.md` (this may also be `implementation-plan-resolve-discrepancies.md` if one was created during a prior remediation cycle)

## Input Contract
- Source file path to `design.md`
- Source file path to the implementation plan (`implementation-plan.md` or `implementation-plan-resolve-discrepancies.md`)
- Optional constraints (timeline, platform, compatibility, rollout limitations)

After I provide those files:

1. Read and analyze both documents carefully.
2. Implement the technical design by following the implementation plan.
3. Work phase-by-phase and task-by-task rather than trying to do everything at once.
4. If anything is vague, unclear, inconsistent, or ambiguous in the design or plan, pause and ask focused clarifying questions before continuing.
5. After completing each task, update the implementation plan file to mark that task's checkbox as checked (`- [x]`).
6. Compare the completed modifications against the implementation plan.
7. Compare the completed modifications against the technical design.
8. Save, update, or create discrepancy reports for both comparisons.

## Required Output Files

Save these files:
- `discrepancy-reports/modifications-vs-implementation-plan.md`
- `discrepancy-reports/modifications-vs-design.md`

If a report file already exists at either path, update it rather than replacing it:
- Mark each previously reported discrepancy as resolved, no longer present, or still open, based on the current state of the code.
- Add any new discrepancies found during this run.
- Preserve the history of prior discrepancy entries so the report reflects the full evolution of issues across runs.

If no discrepancies were found and the report file does not yet exist, create it with a brief note stating that no discrepancies were found.

If the destination folder is already clear, save them there.

## Discrepancy Report Expectations

Each discrepancy report should:
- Contain these top-level sections in order:
   1. `Current Run Summary`
   2. `Open Discrepancies`
   3. `Resolved Since Last Run`
   4. `Historical Discrepancies` (optional archive)
- Clearly identify each discrepancy.
- Explain what was expected.
- Explain what was actually implemented.
- Note the likely impact or importance of the discrepancy.
- State whether the discrepancy is unresolved, intentionally different, or already corrected.

Each discrepancy should: 
- Include a severity label: `critical`, `important`, or `minor`.
- If applicable, include a mapping table: Discrepancy → Planned Fix.

If resolving a discrepancy requires changing requirements or design intent, pause and request approval.

Do not resolve discrepancies by changing intended behavior without explicit user confirmation.

## Execution Requirements

- Follow the implementation plan as closely as practical.
- Keep changes focused on the requested update.
- Prefer small, reviewable changes.
- Use targeted validation and testing throughout the work.
- Do not fix unrelated issues unless I explicitly ask you to.

The implementation and discrepancy reports must be specific enough that remediation planning can proceed without introducing assumptions.

---

Next step: If there are open discrepancies, use `.github/prompts/prompt-6-create-remediation-plan-from-discrepancy-report.md` with `design.md` and `discrepancy-reports/modifications-vs-design.md`. If there are no discrepancies, or all discrepancies have been resolved, no remediation plan is needed.
