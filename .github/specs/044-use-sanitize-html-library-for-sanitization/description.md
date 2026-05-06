# General Description

Update the code for sanitizing HTML so that it calls a well-maintained sanitization library such as sanitize-html, instead of using a series of regular expressions.

# Specific Description

## Problem Statement

The current sanitization approach relies on a chain of regular-expression replacements. This pattern is difficult to maintain, can be brittle for malformed or edge-case HTML inputs, and may not provide the same security confidence as a dedicated, maintained sanitization library.

This affects any code path that sanitizes untrusted HTML-like content before rendering or downstream processing.

## Intended Outcome

Replace the regex-based sanitization implementation with a well-maintained library-based sanitization approach, with `sanitize-html` as the preferred candidate unless a clearly justified equivalent is selected.

The updated sanitizer should provide stronger and more predictable protection behavior while keeping expected user-visible output stable for legitimate content.

## Scope Boundaries

In scope:

- Identify the current HTML sanitization logic currently implemented via multiple regex transforms.
- Replace the core sanitization mechanism with a maintained library API (prefer `sanitize-html`).
- Configure the sanitizer with explicit allow/deny rules appropriate to current rendering requirements.
- Keep the existing external call pattern/function boundary stable where practical to reduce downstream changes.
- Add or update automated tests that verify both security hardening behavior and non-malicious content handling.

Out of scope:

- Broad redesign of the markdown/parser/render architecture unrelated to sanitization replacement.
- UI layout or styling changes.
- Unrelated refactors outside sanitization and directly impacted tests.

## Key Behaviors and Expected User-Visible Results

- Unsafe tags/attributes/protocol payloads are removed or neutralized by the sanitizer library configuration.
- Legitimate text content continues to display correctly with minimal regression.
- Sanitization behavior becomes more consistent and maintainable than regex-chain filtering.

## Assumptions and Constraints

- The implementation should fit the existing Nuxt/Vue/TypeScript project setup.
- Dependency additions must be versioned and compatible with existing lint/type/test tooling.
- Security correctness takes priority over preserving unsafe edge-case behavior.
- Sanitizer configuration must be explicit and auditable rather than permissive-by-default.

# Non-Goals

- Implementing custom HTML parsing from scratch.
- Adding rich raw-HTML rendering features beyond current product scope.
- Performing unrelated repository-wide cleanup or architecture refactors.
