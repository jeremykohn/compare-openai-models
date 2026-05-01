# General Description

Generate a comparison prompt for Model 3 from the template and expose it behind a toggle in the third output panel.

# Specific Description

## Problem Statement

The current comparison flow can include a third model, but users do not have a clear, inspectable view of the prompt that is built for Model 3 from prior Model 1 and Model 2 results. This makes it difficult to verify what context is being sent for the comparison step and reduces transparency when debugging or evaluating outputs.

## Intended Outcome

When Model 1 and Model 2 complete successfully, the app should generate the Model 3 comparison prompt by filling placeholders in `server/assets/prompt-templates/model-3-prompt-template.md` with:
- the original user prompt,
- Model 1 response text,
- Model 2 response text.

The generated Model 3 prompt should be available in the UI via a toggle control labeled `Prompt for Model 3`, shown in the third output panel above the existing placeholder/content area.

## Scope Boundaries

In scope:
- Use `server/assets/prompt-templates/model-3-prompt-template.md` as the source template for Model 3 prompt generation.
- Fill template placeholders with runtime values from the current comparison run.
- Show a toggle in the third panel labeled `Prompt for Model 3`.
- Expand/collapse a read-only view of the generated Model 3 prompt in that panel.
- Keep existing third-panel output behavior intact outside this prompt-visibility addition.

Out of scope:
- Changing the semantic purpose or wording of the template itself.
- Redesigning the full third-panel layout beyond the requested toggle and prompt visibility.
- Changing how Model 1/Model 2 prompts are authored.
- Backend/provider contract changes unrelated to generating or exposing the Model 3 prompt text.

## Key Behaviors and Expected User-Visible Results

- After Model 1 and Model 2 finish successfully, the app prepares the Model 3 prompt from the template and current run values.
- The third panel displays a toggle labeled `Prompt for Model 3` above the placeholder or output region.
- By default, the prompt view should be collapsed unless existing UI conventions require otherwise.
- Activating the toggle reveals the generated Model 3 prompt text; deactivating hides it.
- If required source data for template filling is missing (for example due to upstream failure), the app should avoid rendering misleading prompt text and maintain clear existing error/empty states.

## Assumptions, Constraints, and Explicit Exclusions

Assumptions:
- Template placeholders and substitution rules are already defined or can be inferred from existing template usage patterns.
- Model 1 and Model 2 outputs needed for substitution are available in state when comparison is triggered.

Constraints:
- Keep changes minimal and aligned with current Nuxt/Vue architecture and state flow.
- Preserve accessibility expectations for interactive controls and readable prompt text.
- Do not expose secrets or internal-only runtime configuration in rendered prompt content.

Explicit exclusions:
- No new comparison algorithm.
- No model-provider API contract redesign.
- No persistence/history feature for generated prompts.

# Non-Goals

- Rewriting the entire compare flow.
- Adding new model selectors or additional output panels.
- Introducing prompt editing for Model 3 in this update.
