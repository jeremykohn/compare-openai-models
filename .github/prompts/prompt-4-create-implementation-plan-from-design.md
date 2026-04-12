# Create Implementation Plan from Technical Design

Use this prompt with GitHub Copilot when you want Copilot to convert a technical design document into a concrete implementation plan with phased tasks.

Read and apply the rules in `.github/prompts/_shared-behavior-contract.md` before proceeding.

## Prompt

Ask me for the path to the technical design document that should be used as the source, for example: `.github/specs/001-new-feature/design.md`.

After I provide the design file:

1. Read and analyze the technical design carefully.
2. Create a concrete implementation plan for delivering the design.
3. Structure the plan into logical phases.
4. For each phase, describe the approach in detail.
5. For each phase, include a list of small, specific, independently testable tasks ordered by dependency.
6. Use a Test-Driven Development approach where appropriate, including unit tests, integration tests, and end-to-end tests where applicable to scope.
7. If destination folder is not explicitly provided, ask for it.
8. If destination folder is implied by the source path, confirm before saving.
9. Save the implementation plan to `implementation-plan.md` in that folder.

## Input Contract
- Source file path to `design.md`
- Optional constraints (timeline, platform, compatibility, rollout limitations)

## Implementation Plan Expectations

The implementation plan should:
- Be detailed enough to guide execution without writing code yet.
- Break work into clear phases with rationale.
- Include testing strategy throughout the plan, not just at the end.
- Make task order explicit when tasks depend on earlier work.
- Keep tasks small enough to verify independently.
- Identify risks, assumptions, dependencies, and validation steps where useful.

For each phase, include:
- Objective
- Tasks (small, dependency-ordered)
  - Each task should have: description, dependencies, validation command, expected result
- Validation
- Exit Criteria ("Done when...")

Optionally, flag design ambiguities before writing the full plan.

## Consistency Requirements

- Ensure the implementation plan is consistent with the provided technical design.
- If there are gaps, contradictions, ambiguities, or missing implementation details in the design, pause and ask focused clarifying questions before continuing.
- If helpful, include a short traceability section mapping phases or major tasks back to the design.

The plan must be specific enough that implementation can proceed without introducing assumptions.

---

Next step: Use `.github/prompts/prompt-5-implement-from-plan-and-save-discrepancies.md` with `design.md` and `implementation-plan.md`.
