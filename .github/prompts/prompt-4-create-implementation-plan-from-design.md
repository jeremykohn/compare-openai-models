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
- Optional constraints (use common input metadata defined in `.github/prompts/_shared-behavior-contract.md`)

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
    - `Task ID: P{phase-number}-T{task-number}`
    - `Description: <what to implement>`
    - `Dependencies: <task IDs or 'None'>`
    - `Validation command: <exact command>`
    - `Expected result: <pass condition>`
- Validation
- Exit Criteria ("Done when...")
- Quality Gate Notes (placeholder section, to be populated during Prompt 5 quality gates using this format)
  - `Finding: <what was detected>`
  - `Proposed fix: <how to address it>`
  - `Applied: <Yes/No + short outcome>`
  - `Task link: <existing task ID or newly added follow-up task ID, using canonical task IDs from the plan>`

Canonical quality-gate note entry schema for this workflow:

- `Finding: <what was detected>`
- `Proposed fix: <how to address it>`
- `Applied: <Yes/No + short outcome>`
- `Task link: <existing task ID or newly added follow-up task ID, using canonical task IDs from the plan>`

When writing the plan:

- Structure the plan into logical phases.
- For each phase, describe the approach in detail.
- For each phase, include a list of small, specific, independently testable tasks ordered by dependency.
- Use canonical task IDs in this format for every task: `P{phase-number}-T{task-number}`.
- Use a Test-Driven Development (TDD) red-green-refactor approach for each task.
- Include unit tests, integration tests, and end-to-end tests where applicable to scope.
- Include a traceability section mapping phases or major tasks back to the design. Keep it brief; a short table is sufficient. This section is required.
- If there are gaps, contradictions, ambiguities, or missing implementation details in the design, pause and ask focused clarifying questions before continuing.

After all phases are defined, include a `Final Quality Gate Notes` section (placeholder, same canonical quality-gate note entry schema) for Prompt 5 final-gate outputs.

Also include a `Quality Gate Follow-up Tasks` section (placeholder) at the end of the implementation plan file for Prompt 5 to append non-phase-scoped follow-up tasks generated during quality gates.

If Prompt 5 appends tasks under `Quality Gate Follow-up Tasks`, use task IDs in this format: `QG-T{task-number}`, assigning the next available `QG-T{n}` in ascending order.

After writing the plan:

- Review the full plan and every task for completeness, consistency with the provided technical design, correctness of task format, and traceability (each phase or task should map to a design section or requirement).
- If any issues are found, correct the plan before finishing.

---

**Next step:** `.github/prompts/prompt-5-implement-from-plan.md` — pass `implementation-plan.md` to begin implementation.
