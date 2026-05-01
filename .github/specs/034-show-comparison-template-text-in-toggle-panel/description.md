# Description

## General Description

When the `Comparison prompt for Model 3` toggle is clicked, instead of displaying the exact prompt that is sent to Model 3, display the text of `server/assets/prompt-templates/comparison-prompt.md`.

## Specific Description

### Problem Statement

The current toggle reveals the fully assembled runtime prompt sent to Model 3. That output includes interpolated user/model response content and reflects dynamic runtime data rather than a stable template reference. The desired behavior is to show a static, canonical prompt template document when users expand the toggle.

### Intended Outcome

After this update:
- Clicking `Comparison prompt for Model 3` shows the raw text contents of `server/assets/prompt-templates/comparison-prompt.md`.
- The displayed text is no longer the dynamically assembled Model 3 request prompt.
- Model 3 request generation and submission continue to use the current runtime prompt assembly flow unchanged.

### Scope Boundaries

In scope:
- Updating third-panel prompt-toggle display source from runtime-generated prompt text to template-file text.
- Wiring the UI to load/render `comparison-prompt.md` content in the toggle region.
- Updating tests that currently assert interpolated prompt content in the toggle panel.

Out of scope:
- Changing how Model 3 prompt payload is generated/sanitized/sent.
- Modifying Model 3 loading/success/error lifecycle behavior.
- Changing model selection or API route contracts.
- Rewriting template safety helpers or interpolation utilities.

### Key Behaviors and Expected User-Visible Results

- Toggle label remains `Comparison prompt for Model 3`.
- Expanding the toggle displays the template text from `server/assets/prompt-templates/comparison-prompt.md`.
- Expanded content no longer includes submission-specific values (for example: user prompt text or model response strings) unless present directly in the template file.
- Model 3 requests still run as before, with no user-visible regression in request lifecycle states.

### Assumptions, Constraints, and Explicit Exclusions

Assumptions:
- `server/assets/prompt-templates/comparison-prompt.md` exists and is the intended display artifact.
- Existing UI structure for toggle and preformatted text remains reusable.

Constraints:
- Keep change localized to prompt-preview display source and directly affected tests.
- Preserve current accessibility semantics for toggle interaction and expanded region.

Explicit exclusions:
- No new debug/developer mode for runtime prompt inspection.
- No changes to server-side prompt assembly logic.
- No additional toggles or alternate prompt-preview modes.

## Non-Goals

- Exposing both runtime prompt and template prompt simultaneously.
- Refactoring unrelated third-panel rendering logic.
- Altering request orchestration for Model 1/Model 2/Model 3.
