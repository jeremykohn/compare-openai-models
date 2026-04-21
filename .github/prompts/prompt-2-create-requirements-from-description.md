# Create Requirements from Description

Use this prompt with GitHub Copilot when you want Copilot to convert a saved update description into a clear, detailed requirements document.

Read and apply the rules in `.github/prompts/_shared-behavior-contract.md` before proceeding.

## Input Contract

- Source file path to `description.md`
- Optional constraints (use common input metadata defined in `.github/prompts/_shared-behavior-contract.md`)

## Prompt

Ask me for the path to the description document that should be used as the source, for example: `.github/specs/001-new-feature/description.md`.

After I provide the description file:

1. Create a clear, detailed set of requirements for the update.
2. Separate the requirements into at least these always-expected sections:
    - Functional requirements
    - Technical requirements
3. Include these additional sections when applicable to scope:
    - Security requirements
      - Include when the update affects authentication, authorization, data handling, input validation, secrets, external integrations, or other security-relevant behavior
      - Include OWASP Top 10-aligned controls relevant to scope, plus additional security requirements derived from the description and optional constraints
    - Accessibility requirements
      - Include when user-facing interfaces, content, forms, workflows, documents, or assistive-technology interaction are in scope
      - Include WCAG-aligned controls relevant to scope, plus additional accessibility requirements derived from the description and optional constraints
    - Performance requirements
      - Include when the description or constraints mention latency, throughput, load, scalability, SLA, or response time targets
4. If there are gaps, missing details, conflicting expectations, or anything vague or ambiguous, pause and ask me focused clarifying questions before continuing.
5. Before saving, check whether `requirements.md` already exists in that folder. If it does, pause and ask the user whether to overwrite, append, or abort before continuing.
6. Save the requirements to `requirements.md` in that folder.

## Output Expectations

When generating `requirements.md`:

- Organize the document with clear headings.
- Use numbered requirement IDs for traceability (these mirror the canonical requirement ID conventions defined in `.github/prompts/_shared-behavior-contract.md`):
    - Functional Requirements (`FR-1`, `FR-2`, ...)
    - Technical Requirements (`TR-1`, ...)
    - Security Requirements (`SR-1`, ...)
    - Accessibility Requirements (`AR-1`, ...)
    - Performance Requirements (`PR-1`, ...)
- Each functional requirement must be testable and unambiguous.
- Each technical requirement must be specific, testable, and implementation-relevant.
  - Technical requirements should address areas such as architecture, APIs, data flow, validation, error handling, and testing where applicable to scope.
- Each security requirement must be specific, testable, and scoped to the requested update.
- Security requirements should include OWASP Top 10-aligned controls relevant to scope and additional security requirements indicated by the source `description.md` and/or optional constraints.
- Each accessibility requirement must be specific, testable, and scoped to the requested update.
- Accessibility requirements should include WCAG-aligned controls relevant to scope and additional accessibility requirements indicated by the source `description.md` and/or optional constraints.
- Each performance requirement must be measurable and tied to observable thresholds where applicable.
- For all requirement categories, include clear acceptance criteria where applicable.
- Include an "Out of Scope / Non-Goals" section.
- Include assumptions and constraints.
- Prefer precise language over vague wording.
- Make the requirements detailed enough to support later design and implementation planning. (See `.github/prompts/_shared-behavior-contract.md` for the workflow-wide specificity rule.)

---

**Next step:** `.github/prompts/prompt-3-create-technical-design-from-requirements.md` — pass the generated `requirements.md` to create a technical design.
