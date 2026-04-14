# Create Implementation Plan from Technical Design

Use this prompt with GitHub Copilot when you want Copilot to convert a technical design document into a concrete implementation plan with phased tasks.

Read and apply the rules in `.github/prompts/_shared-behavior-contract.md` before proceeding.

## Prompt

Ask me for the path to the technical design document that should be used as the source, for example: `.github/specs/001-new-feature/design.md`.

After I provide the design file:

1. Read and analyze the technical design carefully.
2. Create a concrete implementation plan for delivering the design.
3. Save the implementation plan to `implementation-plan.md` in the same folder as the technical design document.

## Input Contract

- Source file path to `design.md`
- Optional constraints (timeline, platform, compatibility, rollout limitations)

## Implementation Plan Expectations

The implementation plan should:

- Be detailed enough to guide execution without writing code yet.
- Be specific enough that implementation can proceed without introducing assumptions.
- Break work into clear phases with rationale.
- Include testing strategy throughout the plan, not just at the end.
- Make task order explicit when tasks depend on earlier work.
- Keep tasks small enough to verify independently.
- Identify risks, assumptions, dependencies, and validation steps where useful.

Each phase of the implementation plan should include these components:

- Objective
- Tasks (small, dependency-ordered; each task must follow this exact format)
  - `- [ ] <Task title>`
    - `Description: <what to implement>`
    - `Dependencies: <task IDs or 'None'>`
    - `Validation command: <exact command>`
    - `Expected result: <pass condition>`
- Validation
- Exit Criteria ("Done when...")

When writing the plan:

- Structure the plan into logical phases.
- For each phase, describe the approach in detail.
- For each phase, include a list of small, specific, independently testable tasks ordered by dependency.
- Use a Test-Driven Development (TDD) red-green-refactor approach for each task.
- Include unit tests, integration tests, and end-to-end tests where applicable to scope.
- If helpful, include a short traceability section mapping phases or major tasks back to the design.
- If there are gaps, contradictions, ambiguities, or missing implementation details in the design, pause and ask focused clarifying questions before continuing.

After writing each phase of the plan:

- Review the plan tasks added in that phase for completeness.
- Review the plan tasks added in that phase for consistency with the technical design.
- Review the plan tasks added in that phase for correctness of task format.
- Correct the plan tasks immediately if any issues are found.

After writing the entire plan:

- Review the entire plan to ensure it is consistent with the provided technical design.
- If any inconsistencies are found, report the inconsistencies to the user and offer to make corrections.

---

**Next step:** `.github/prompts/prompt-5-implement-from-plan.md` — pass `implementation-plan.md` to begin implementation.
