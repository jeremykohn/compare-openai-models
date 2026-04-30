# General Description

Add safeguards to prevent prompt injection when the template `server/assets/prompt-templates/prompt-comparison-template.md` is filled in to create a prompt.

# Specific Description

## Problem Statement

The current prompt-construction path fills a comparison template with user-controlled or model-generated text. Without explicit prompt-injection safeguards, untrusted content can introduce adversarial instructions into the assembled prompt and influence downstream model behavior in unintended ways. This affects reliability and security of comparison results and can make outputs less trustworthy.

## Intended Outcome

Introduce deterministic, defense-in-depth safeguards in the template-filling workflow so untrusted inserted content cannot override or subvert the intended instruction hierarchy of the generated comparison prompt.

The update should ensure the final generated prompt preserves intended system/task framing and treats interpolated user/model text as data, not executable instructions.

## Scope Boundaries

In scope:
- Add safeguards around interpolation into `server/assets/prompt-templates/prompt-comparison-template.md`.
- Normalize and delimit inserted fields (for example, strong data boundaries and explicit quoting/fencing rules) so embedded instructions are treated as plain content.
- Add validation/sanitization rules for inserted segments as needed for prompt-safety goals.
- Add or update tests covering prompt-injection patterns and expected safe prompt assembly behavior.
- Keep template-fill behavior deterministic and auditable.

Out of scope:
- Replacing the overall compare feature architecture.
- Provider-side policy enforcement changes beyond application-level prompt assembly.
- Building a generalized moderation platform or external security service integration.
- Unrelated UX redesigns.

## Key Behaviors and Expected User-Visible Results

- Prompt assembly continues to work for normal inputs and produces a valid comparison prompt.
- Inputs containing instruction-like text (for example, "ignore previous instructions") are preserved as data within bounded sections and do not change the intended framing of the generated prompt.
- Comparison feature behavior remains functional, with no user-facing regression in standard workflows.
- If an input fails new safety checks (if applicable), handling is explicit and consistent with existing error patterns.

## Assumptions, Constraints, and Explicit Exclusions

Assumptions:
- `server/assets/prompt-templates/prompt-comparison-template.md` is the canonical template for this prompt-assembly path.
- Interpolated values originate from user prompt text and/or model output text, and must be treated as untrusted.

Constraints:
- Keep changes minimal and focused on prompt-construction safety.
- Preserve current APIs and response shapes unless a clearly scoped change is required.
- Avoid introducing heavy dependencies unless strictly necessary.

Explicit exclusions:
- No secret exposure in logs or prompt payloads.
- No change to unrelated model-selection UI behavior.
- No broad refactors outside template-fill and directly related tests.

# Non-Goals

- Guaranteeing complete elimination of all prompt-injection risk in every possible model behavior scenario.
- Implementing unrelated content policy features.
- Redesigning template authoring workflows beyond what is required for safety hardening.
