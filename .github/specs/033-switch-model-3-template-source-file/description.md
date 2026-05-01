# Description

## General Description

Instead of reading the Model 3 prompt from `prompt-comparison-template.md`, read it from `model-3-prompt-template.md`.

## Specific Description

### Problem Statement

The current Model 3 prompt-generation flow reads template content from `prompt-comparison-template.md`. The desired template source has changed to `model-3-prompt-template.md`, but the app has not yet been updated to use this file as the authoritative input. This can cause the wrong prompt template content to be used at runtime.

### Intended Outcome

After this update:
- The Model 3 prompt template is loaded from `server/assets/prompt-templates/model-3-prompt-template.md`.
- The previous template source (`prompt-comparison-template.md`) is no longer used by the Model 3 prompt-generation path.
- Existing Model 3 submission behavior remains unchanged other than the template source file used to construct the prompt.

### Scope Boundaries

In scope:
- Updating the template import/reference in the Model 3 prompt-generation code path.
- Ensuring all dependent tests and assertions align with the new template source.
- Preserving current request orchestration and output rendering behavior.

Out of scope:
- Rewriting prompt-template interpolation/safety logic.
- Changing Model 1 / Model 2 query behavior.
- Changing Model 3 response rendering behavior beyond what is required by the source-file switch.
- Modifying API contracts or server route shapes.

### Key Behaviors and Expected User-Visible Results

- User-visible interaction flow remains the same.
- Model 3 requests continue to be sent in the same scenarios as before.
- Prompt generation now reflects the contents of `model-3-prompt-template.md` instead of `prompt-comparison-template.md`.
- Any tests that assert template text snippets should validate content from the new source file.

### Assumptions, Constraints, and Explicit Exclusions

Assumptions:
- `server/assets/prompt-templates/model-3-prompt-template.md` already exists and contains the intended template text.
- Existing prompt-safety and interpolation helpers remain the correct mechanism for constructing the final prompt.

Constraints:
- Keep the change minimal and localized to template-source selection and directly impacted tests.
- Maintain deterministic prompt-generation behavior and existing normalization/security safeguards.

Explicit exclusions:
- No fallback mechanism between old and new template files in this change.
- No prompt-template schema redesign.
- No unrelated refactors in UI or server modules.

## Non-Goals

- Introducing multi-template selection logic.
- Altering model selection UX.
- Changing retry/loading/error behavior for Model 3 requests.
