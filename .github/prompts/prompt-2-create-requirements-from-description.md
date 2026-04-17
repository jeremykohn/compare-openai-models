# Create Requirements from Description

Use this prompt with GitHub Copilot when you want Copilot to convert a saved update description into a clear, detailed requirements document.

Read and apply the rules in `.github/prompts/_shared-behavior-contract.md` before proceeding.

## Prompt

Ask me for the path to the description document that should be used as the source, for example: `.github/specs/001-new-feature/description.md`.

After I provide the description file:

1. Create a clear, detailed set of requirements for the update.
2. Separate the requirements into at least these sections:
   - Functional requirements
   - Technical requirements
3. If there are gaps, missing details, conflicting expectations, or anything vague or ambiguous, pause and ask me focused clarifying questions before continuing.
4. Save the requirements to `requirements.md` in that folder.

## Input Contract

- Source file path to `description.md`
- Optional constraints (use common input metadata defined in `.github/prompts/_shared-behavior-contract.md`)

## Output Expectations

When generating `requirements.md`:

- Organize the document with clear headings.
- Use numbered requirement IDs for traceability:
  - Functional Requirements (`FR-001`, `FR-002`, ...)
  - Technical Requirements (`TR-001`, ...)
  - Performance Requirements (`PR-001`, ...)
- Each functional requirement must be testable and unambiguous.
- Include an "Out of Scope / Non-Goals" section.
- Include assumptions and constraints.
- Include concrete technical requirements covering architecture, APIs, data flow, validation, error handling, security, and testing where applicable to scope.
- Prefer precise language over vague wording.
- Make the requirements detailed enough to support later design and implementation planning. (See shared contract for the workflow-wide specificity rule.)

---

**Next step:** `.github/prompts/prompt-3-create-technical-design-from-requirements.md` — pass the generated `requirements.md` to create a technical design.
