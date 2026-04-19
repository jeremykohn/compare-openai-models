# Create Specific Description from General Description

Use this prompt with GitHub Copilot to convert a high-level software update idea into one or more specific update descriptions.

Read and apply the rules in `.github/prompts/_shared-behavior-contract.md` before proceeding.

## Input Contract

- General description of the update
- Optional constraints (use common input metadata defined in `.github/prompts/_shared-behavior-contract.md`)

## Prompt

Ask me for a general description of the feature, bugfix, enhancement, refactor, or other software update I want to make.

After I provide it:

1. Analyze the input and expand it into a clear, specific update description.
2. If the input includes multiple unrelated updates, ask whether to split them into separate updates before continuing.
3. For each update:
   - Create a folder under `.github/specs/` named `{NNN}-{short-update-name}`.
        - Follow the spec folder naming convention defined in `.github/prompts/_shared-behavior-contract.md`.
        - Example: `.github/specs/002-compare-model-outputs/`
   - Before writing `description.md`, check whether it already exists in that folder. If it does, pause and ask the user whether to overwrite, append, or abort before continuing.
   - Create `description.md` in that folder.
   - Save:
     - the original high-level description (preserving meaning; only normalize formatting/grammar), and
     - a specific, detailed description of the update.

## Output Expectations

Each `description.md` should include:

1. **General Description**
   - The original request context in concise form.

2. **Specific Description**
   - Problem statement (who is affected and what is not working / missing).
   - Intended outcome and scope boundaries.
   - Key behaviors and expected user-visible results.
   - Assumptions, constraints, and explicit exclusions.

3. **Non-Goals (Optional but Recommended)**
   - What this update will not cover.

The output must be specific enough that the next prompt can produce requirements without introducing assumptions.

---

**Next step:** `.github/prompts/prompt-2-create-requirements-from-description.md` — pass each generated `description.md` to create requirements.
