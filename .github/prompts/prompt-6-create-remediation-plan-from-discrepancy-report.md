# Create Remediation Plan from Discrepancy Report

Use this prompt with GitHub Copilot when you want Copilot to convert a discrepancy report into a concrete remediation plan that brings implemented code back into alignment with the technical design.

Read and apply the rules in `.github/prompts/_shared-behavior-contract.md` before proceeding.

## Prompt

Ask me for:
- The path to the technical design document, for example: `.github/specs/001-new-feature/design.md`
- The path to the discrepancy report, for example: `.github/specs/001-new-feature/discrepancy-reports/modifications-vs-design.md`

## Input Contract
- Source file path to `design.md`
- Source file path to discrepancy report (for example, `discrepancy-reports/modifications-vs-design.md`)
- Optional constraints (timeline, platform, compatibility, rollout limitations)

After I provide those files:
1. Read the discrepancy report. If there are no open discrepancies, inform me that no remediation plan is needed and stop.
2. Read and analyze both documents carefully.
3. Identify the discrepancies that still need to be resolved.
4. Create a concrete remediation implementation plan for closing those discrepancies.
5. Structure the plan into logical phases.
6. For each phase, describe the approach in detail.
7. For each phase, include a list of small, specific, independently testable tasks ordered by dependency, each formatted as a markdown checkbox: `- [ ] Task description`.
8. Include testing strategy throughout the plan, including unit tests, integration tests, and end-to-end tests where applicable to scope.
9. Check whether an `implementation-plan.md` or `implementation-plan-resolve-discrepancies.md` already exists in the destination folder.
    - If `implementation-plan.md` exists, add the remediation tasks to it as a new phase rather than creating a separate file.
    - If `implementation-plan-resolve-discrepancies.md` exists (and `implementation-plan.md` does not), append the new remediation tasks to it as a new phase.
    - If neither file exists, confirm the output filename (`implementation-plan-resolve-discrepancies.md`) before saving and create that file.
10. Save the plan to the determined file in that folder.

## Remediation Plan Expectations

The remediation plan should:
- Focus only on resolving the reported discrepancies.
- Be detailed enough to guide implementation without writing code yet.
- Prioritize discrepancies by importance and dependency where appropriate.
- Break the work into clear phases with rationale.
- Keep tasks small, specific, and independently verifiable.
- Include validation and testing steps throughout the plan.
- Note assumptions, risks, and constraints where helpful.
- If the discrepancy report conflicts with the design, the design is the source of truth unless the user says otherwise.
- For each discrepancy, add expected evidence (tests, file diffs, command output).
- Include a `Resolution Mapping` section: Discrepancy ID → Planned Tasks → Validation.

## Consistency Requirements

- Ensure the remediation plan is consistent with the technical design.
- Use the discrepancy report as the source of issues to resolve.
- If there are gaps, contradictions, ambiguities, or unresolved questions in either source file, pause and ask focused clarifying questions before continuing.
- If helpful, include a short traceability section mapping remediation phases or tasks back to individual discrepancies.

The remediation plan must be specific enough that execution can proceed without introducing assumptions.

---

Next step: Use `.github/prompts/prompt-5-implement-from-plan-and-save-discrepancies.md` with `design.md` and the updated or newly created implementation plan to execute the remediation plan and produce updated discrepancy reports.