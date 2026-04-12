# Implement from Plan and Save Discrepancy Reports

Use this prompt with GitHub Copilot when you want Copilot to execute an implementation plan, validate the resulting changes, and save discrepancy reports comparing the work against the plan and technical design.

Apply the behavior rules from `.github/prompts/_shared-behavior-contract.md`.

## Prompt

Ask me for:
- The path to the technical design document, for example: `.github/specs/001-new-feature/design.md`
- The path to the implementation plan document, for example: `.github/specs/001-new-feature/implementation-plan.md`

## Input Contract
- Source file path to `design.md`
- Source file path to `implementation-plan.md`
- Optional constraints (timeline, platform, compatibility, rollout limitations)

After I provide those files:

1. Read and analyze both documents carefully.
2. Implement the technical design by following the implementation plan.
3. Work phase-by-phase and task-by-task rather than trying to do everything at once.
4. If anything is vague, unclear, inconsistent, or ambiguous in the design or plan, pause and ask focused clarifying questions before continuing.
5. After each phase is complete:
   - Check the newly modified files for problems.
   - Propose how to fix scope-relevant problems.
   - Implement the fixes that are relevant to the work you just completed.
6. After all phases are complete:
   - Check all modified files for problems.
   - Propose how to fix scope-relevant problems.
   - Implement the fixes that are relevant to the requested work.
7. Run formatting on the modified code files.
8. Compare the completed modifications against the implementation plan.
9. Compare the completed modifications against the technical design.
10. Save discrepancy reports for both comparisons.

## Required Output Files

If destination folder is not explicitly provided, ask for it.
If destination folder is implied by the source paths, confirm before saving.
Confirm output filenames before saving.

Save these files:
- `discrepancy-reports/modifications-vs-implementation-plan.md`
- `discrepancy-reports/modifications-vs-design.md`

If the destination folder is already clear, save them there.

## Discrepancy Report Expectations

Each discrepancy report should:
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

Next step: Use `.github/prompts/prompt-6-create-remediation-plan-from-discrepancy-report.md` with `design.md` and `discrepancy-reports/modifications-vs-design.md`.
