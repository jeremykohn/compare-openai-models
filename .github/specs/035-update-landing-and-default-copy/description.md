# Description

## General Description

Change the text on the app's web page as follows:
- Change the main title from `ChatGPT prompt tester` to `Compare OpenAI Models`.
- Change the subtitle from `Send a prompt and see the response.` to `Send a prompt to two models, and compare the two responses using a third model.`
- Change the text on the input form, under the dropdown menus, from `Uses gpt-4.1-mini by default if none is selected.` to `Each model is gpt-4.1-mini by default if not otherwise selected.`

## Specific Description

### Problem Statement

The landing and helper copy currently reflects an older app message and does not clearly communicate the current three-model comparison flow. The page title/subtitle and default-model helper text need to be updated so users immediately understand that two models are queried and a third model performs the comparison.

### Intended Outcome

After this update:
- The main page heading displays exactly: `Compare OpenAI Models`.
- The subtitle displays exactly: `Send a prompt to two models, and compare the two responses using a third model.`
- The helper text below the model dropdown area displays exactly: `Each model is gpt-4.1-mini by default if not otherwise selected.`

### Scope Boundaries

In scope:
- Updating the visible UI copy strings for:
  - main title,
  - subtitle,
  - default-model helper text under the dropdown section.
- Updating affected automated tests that assert these strings.

Out of scope:
- Any behavior changes to model selection/query logic.
- Any API/server contract changes.
- Any layout/styling redesign not required for text replacement.

### Key Behaviors and Expected User-Visible Results

- On page load, users see the updated title and subtitle text.
- In the form section beneath model selectors, users see the updated default-model helper copy.
- No functional behavior changes occur; only user-facing copy changes.

### Assumptions, Constraints, and Explicit Exclusions

Assumptions:
- Existing UI structure already contains locations for the three strings.
- Existing tests include copy assertions that can be updated in-place.

Constraints:
- Use exact target strings as provided.
- Keep the change minimal and limited to copy + directly impacted tests.

Explicit exclusions:
- No renaming of components/composables/routes.
- No additional messaging or content sections.
- No i18n framework introduction in this change.

## Non-Goals

- Rewriting broader UX copy outside the three specified text strings.
- Altering accessibility semantics beyond what naturally follows from text replacement.
- Refactoring unrelated code paths.
