# Create Implementation Plan from Technical Design

Use this prompt with GitHub Copilot when you want Copilot to convert a technical design document into a concrete implementation plan with phased tasks.

Read and apply the rules in `.github/prompts/_shared-behavior-contract.md` before proceeding.

## Input Contract

- Source file path to `design.md`
- Optional constraints (use common input metadata defined in `.github/prompts/_shared-behavior-contract.md`)

## Prompt

Ask me for the path to the technical design document that should be used as the source, for example: `.github/specs/001-new-feature/design.md`.

After I provide the design file:

1. Read and analyze the technical design carefully.
2. Create a concrete implementation plan for delivering the design.
3. Before saving, check whether `implementation-plan.md` already exists in that folder. If it does, pause and ask the user whether to overwrite, append, or abort before continuing.
4. Save the implementation plan to `implementation-plan.md` in the same folder as the technical design document.

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
    - `Task ID: <canonical phase task ID defined in .github/prompts/_shared-behavior-contract.md>`
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
- Use the canonical phase task ID convention defined in `.github/prompts/_shared-behavior-contract.md` for every task.
- Include unit tests, integration tests, and end-to-end tests where applicable to scope.
- Ensure phases and tasks preserve coverage of requirement categories represented in the design, including security, accessibility, and performance concerns when present.
- Keep phases and tasks structured and traceable enough to support post-phase issue detection, fix mapping, and validation during Prompt 5 execution.
- Include a traceability section mapping phases or major tasks back to the design. This section is required. Use this column format:

  | Phase / Task ID | Design Section | Notes |
  | --------------- | -------------- | ----- |

- This traceability column format is prompt-specific for Prompt 4 and intentionally differs from Prompt 3.
- If there are gaps, contradictions, or missing implementation details in the design, pause and clarify before continuing. (Shared contract clarification-first rule applies.)

After writing the plan:

- Review the full plan and every task for completeness, consistency with the provided technical design, correctness of task format, uniqueness of task IDs, and traceability (each phase or task should map to a design section; include requirement references in `Notes` when needed).
- If any issues are found, correct the plan before finishing.
- If any issue cannot be self-corrected, pause and ask the user before finishing. (Shared contract clarification-first rule applies.)

---

**Next step:** `.github/prompts/prompt-5-implement-from-plan.md` — pass `implementation-plan.md` to begin implementation.
