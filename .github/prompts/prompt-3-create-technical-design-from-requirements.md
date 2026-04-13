# Create Technical Design from Requirements

Use this prompt with GitHub Copilot when you want Copilot to convert a requirements document into a clear, detailed technical design.

Read and apply the rules in `.github/prompts/_shared-behavior-contract.md` before proceeding.

## Prompt

Ask me for the path to the requirements document that should be used as the source, for example: `.github/specs/001-new-feature/requirements.md`.

After I provide the requirements file:

1. Read and analyze the requirements carefully.
2. Create a clear, detailed technical design for implementing the requested update.
3. Save the technical design to `design.md` in that folder.

## Input Contract
- Source file path to `requirements.md`
- Optional constraints (timeline, platform, compatibility, rollout limitations)

## Technical Design Expectations

The design should be detailed enough to support implementation planning.

Include, where applicable to scope:
- Goals and scope
- Architecture overview
- Affected files, modules, components, routes, and services
- Data flow and state flow
- API contracts and request/response shapes
- Validation and error-handling approach
- Security considerations
- Performance considerations
- Testing strategy
- Assumptions, constraints, and open questions

## Output Structure Recommendation
- Overview
- Architecture
- Interfaces
- Data
- Validation/Error Handling
- Security
- Testing
- Open Questions

If unresolved requirement ambiguities remain after clarification attempts, include a `Blocked Questions` section and stop before finalizing.

## Consistency Requirements

- Ensure the design is consistent with the provided requirements.
- If there are gaps, contradictions, unclear expectations, or ambiguous requirements, pause and ask focused clarifying questions before continuing.
- If helpful, include a short traceability section mapping major design decisions back to the requirements.

The design must be specific enough that the implementation-plan prompt can proceed without introducing assumptions.

---

Next step: Use `.github/prompts/prompt-4-create-implementation-plan-from-design.md` with the generated `design.md`.
