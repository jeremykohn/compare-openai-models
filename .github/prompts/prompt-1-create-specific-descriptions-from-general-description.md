# Create Specific Description from General Description

Use this prompt with GitHub Copilot to convert a high-level software update idea into one or more specific update descriptions.

Read and apply the rules in `.github/prompts/_shared-behavior-contract.md` before proceeding.

## Prompt

Ask me for a general description of the feature, bugfix, enhancement, refactor, or other software update I want to make.

After I provide it:

1. Analyze the input and expand it into a clear, specific update description.
2. If the input includes multiple unrelated updates, ask whether to split them into separate updates before continuing.
3. For each update:
   - Create a folder under `.github/specs/` named `{NNN}-{short-update-name}`.
     - `NNN` = next sequential number after the highest existing numbered folder (for example: `002`, `003`, `004`). If no numbered folder exists yet, use `001`.
     - Before writing files, if the computed `{NNN}-{short-update-name}` folder already exists (for example due to a concurrent run), rescan and choose the next available `NNN`.
     - `short-update-name` = short kebab-case phrase describing the update.
     - Example: `.github/specs/002-compare-model-outputs/`
   - Create `description.md` in that folder.
   - Save:
     - the original high-level description (preserving meaning; only normalize formatting/grammar), and
     - a specific, detailed description of the update.

## Input Contract

- General description of the update
- Optional constraints (use common input metadata defined in `.github/prompts/_shared-behavior-contract.md`)

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
