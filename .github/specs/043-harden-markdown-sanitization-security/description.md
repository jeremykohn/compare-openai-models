# General Description

The function `sanitizeText()` in `MarkdownRenderer.vue` has been flagged with security concerns such as "Incomplete multi-character sanitization" and "Bad HTML filtering regexp". Modify the function to resolve these concerns, and import libraries such as `sanitize-html` if that would be helpful in improving security.

# Specific Description

## Problem Statement

The current markdown text sanitization logic is considered insufficiently robust and may allow unsafe content patterns to bypass filtering due to incomplete multi-character sanitization and brittle regular-expression-based HTML filtering. This creates risk in any rendering path that displays model-generated or user-provided markdown content.

## Intended Outcome

Replace or redesign the current `sanitizeText()` sanitization approach so it provides stronger, defense-in-depth protection against unsafe markup and script injection patterns.

The update should prioritize a proven sanitization strategy over custom regex filtering, including adoption of a well-maintained sanitization library such as `sanitize-html` if appropriate for the current architecture.

## Scope Boundaries

In scope:

- Update the implementation used by `sanitizeText()` for markdown-rendering safety.
- Address the two flagged concerns directly:
  - Incomplete multi-character sanitization.
  - Bad HTML filtering regexp.
- Add any required dependency and integration changes needed to support safer sanitization behavior.
- Preserve expected markdown rendering behavior for legitimate, non-malicious content as much as practical.
- Ensure the resulting behavior is validated by automated tests, including security-focused cases.

Out of scope:

- Broad redesign of the entire markdown parser or renderer unrelated to the sanitization concerns.
- UI styling or layout changes.
- Unrelated security refactors in other subsystems.

## Expected User-Visible Results

- Normal markdown content continues to render as expected.
- Potentially unsafe HTML/script-like payloads are neutralized or removed.
- Security warning conditions tied to the current sanitizer implementation are resolved.

## Assumptions and Constraints

- The update should be implemented within the existing Nuxt/Vue codebase and testing setup.
- Security correctness takes priority over preserving unsupported or risky markdown/HTML edge behavior.
- Any newly added library must be actively maintained and used with a restrictive, explicit configuration.

# Non-Goals

- Introducing rich raw-HTML rendering features.
- Supporting every possible markdown extension.
- Refactoring unrelated files solely for style or architectural preference.
