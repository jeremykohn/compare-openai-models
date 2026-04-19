# Create Technical Design from Requirements

Use this prompt with GitHub Copilot when you want Copilot to convert a requirements document into a clear, detailed technical design.

Read and apply the rules in `.github/prompts/_shared-behavior-contract.md` before proceeding.

## Input Contract

- Source file path to `requirements.md`
- Optional constraints (use common input metadata defined in `.github/prompts/_shared-behavior-contract.md`)

## Prompt

Ask me for the path to the requirements document that should be used as the source, for example: `.github/specs/001-new-feature/requirements.md`.

After I provide the requirements file:

1. Read and analyze the requirements carefully.
2. Create a clear, detailed technical design for implementing the requested update.
3. Save the technical design to `design.md` in that folder.

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
- Performance considerations (required when performance requirements exist in `requirements.md`, such as `PR-xxx` IDs; see Output Structure)
- Testing strategy
- Assumptions, constraints, and open questions

## Output Structure

Required sections (must be present in every `design.md`):

- Overview
- Architecture
- Interfaces
- Data
- Validation/Error Handling
- Security
- Testing

Optional sections (include only when applicable):

- Performance (required when performance requirements exist in `requirements.md`, such as `PR-xxx` IDs)
- Open Questions
- Blocked Questions (include and stop here if requirement ambiguities remain unresolved after clarification attempts; once unblocked, re-run this prompt with the resolved inputs to complete and replace the partial `design.md`)

## Consistency Requirements

- Ensure the design is consistent with the provided requirements.
- If there are gaps, contradictions, or ambiguous requirements, pause and clarify before continuing. (Shared contract clarification-first rule applies.)
- Include a traceability section mapping requirement IDs to the design sections that address them. This section is required. Use this column format:

	| Requirement ID | Design Section | Notes |
	|---|---|---|
	This traceability column format is prompt-specific for Prompt 3 and intentionally differs from Prompt 4.

The design must be specific enough that the implementation-plan prompt can proceed without introducing assumptions. (Shared contract specificity rule applies.)

---

**Next step:** `.github/prompts/prompt-4-create-implementation-plan-from-design.md` — pass the generated `design.md` to create an implementation plan.
