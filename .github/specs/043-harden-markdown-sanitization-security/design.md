# Technical Design

## Overview

This update hardens markdown text sanitization by replacing the current regex-centric `sanitizeText()` strategy with a vetted sanitization approach that is resilient to malformed HTML and multi-character attack patterns.

Primary goals:
- Eliminate brittle HTML filtering regex as the core security control.
- Reduce XSS risk for model-generated and user-provided markdown text.
- Preserve expected rendering behavior for legitimate non-malicious content.
- Add focused automated coverage for security and regression behavior.

Scope is limited to markdown sanitization paths and related tests. No broad parser redesign or UI layout changes are included.

## Architecture

### Current Architecture (Relevant Slice)

- Markdown parsing entry point: `app/utils/parse-markdown-safe.ts` (`parseMarkdownSafe`).
- Inline token parsing and node construction call `sanitizeText()` for text normalization/sanitization.
- Render path consumes sanitized AST via UI components such as `app/components/MarkdownRenderer.vue`.

### Proposed Architecture

1. Introduce a sanitizer adapter inside `app/utils/parse-markdown-safe.ts`:
- Keep `sanitizeText(value: string): string` as the stable function boundary.
- Internally route through a library-backed sanitizer function (for example `sanitize-html`) configured with restrictive defaults.

2. Restrictive sanitizer policy (deny-by-default style):
- Disallow all HTML tags for this text sanitization path unless explicitly needed.
- Disallow all attributes for this path.
- Disallow/neutralize unsafe protocol expressions (`javascript:`, unsafe `data:` payload patterns) by sanitizer policy and/or safe post-normalization checks.

3. Keep parser behavior deterministic:
- For identical input, output remains deterministic.
- No network/runtime external dependencies in sanitization.

4. Constrain change surface:
- Do not redesign parser token model.
- Do not add raw-HTML rendering support.

## Interfaces

### Function Interfaces

- Preserve existing signature:
  - `sanitizeText(value: string): string`
- Preserve current call sites in:
  - inline code content sanitization
  - text node sanitization
  - code block fallback sanitization

### Dependency Interface

If a third-party sanitizer is adopted:
- Add runtime dependency in `package.json`.
- Add/confirm TypeScript compatibility (`@types` package only if required by the selected version).
- Encapsulate sanitizer configuration in a local constant/helper in `app/utils/parse-markdown-safe.ts` to keep call sites unchanged.

### Affected Files

Expected direct edits:
- `app/utils/parse-markdown-safe.ts`
- `package.json` (if new dependency is added)
- lockfile (`package-lock.json`) if dependency changes
- unit test files covering parser sanitization behavior (likely under `tests/unit/`)

Potentially affected (if assertions need updates):
- `tests/unit/parse-markdown-safe.test.ts`
- related markdown rendering tests where sanitized output expectations are asserted

## Data

### Inputs

- Untrusted string content from model responses and/or user input, passed into markdown parser paths.

### Transformations

1. Existing markdown pre-processing remains unchanged where not security-critical.
2. `sanitizeText()` applies robust sanitizer policy to remove unsafe markup and executable constructs.
3. Sanitized strings flow into AST nodes (`text`, `inlineCode`, fallback paragraph text).

### Outputs

- Sanitized plain text suitable for safe markdown AST rendering.
- No executable HTML/script payloads in returned sanitized values.

## Validation/Error Handling

### Validation Strategy

- Treat all input strings as untrusted.
- Ensure sanitizer handles malformed HTML and encoded payloads without throwing.
- Keep empty/whitespace behavior compatible with existing parser contracts.

### Error Handling Strategy

- `sanitizeText()` must fail safely and not crash parser flow.
- If sanitizer library throws unexpectedly, fallback behavior should preserve app stability (for example returning a safely reduced string) while avoiding unsafe passthrough.
- Existing UI-facing error flows remain unchanged and understandable.

## Security

### Threats Addressed

- XSS through unsafe tags/attributes/protocol-like payloads in markdown text.
- Regex bypass via malformed HTML, nested patterns, and multi-character encoding tricks.

### Security Design Decisions

1. Replace regex-only core sanitization:
- Regex may remain only for narrowly scoped normalization where needed, not as the primary security barrier.

2. Use vetted sanitizer configuration:
- Configure restrictive allowed tags/attributes/protocol handling.
- Do not enable permissive options that preserve raw unsafe HTML.

3. Preserve least privilege:
- If no HTML is needed in this text path, allowlist remains empty for tags/attributes.

4. Test-driven security verification:
- Add payload-based tests covering script tags, event handlers, javascript/data protocol cases, and malformed/multi-character payload variants.

### OWASP Alignment

- A03 Injection/XSS: sanitized output blocks script execution vectors.
- A05 Security Misconfiguration: remove fragile regex-only sanitization as primary control.
- A06 Vulnerable Components: if dependency added, use maintained package and review configuration.

## Accessibility

### Accessibility Design Intent

Security hardening must preserve meaningful readable content for people using visual and assistive technology interfaces.

### Accessibility Decisions

- Maintain semantic markdown text flow by avoiding unnecessary removal of legitimate textual content.
- Avoid introducing rendering failures that degrade readability or cause silent output loss.
- Keep existing component-level semantics and error messaging behavior intact.

### Accessibility Verification

- Include regression tests for normal text and common markdown-like content to ensure security changes do not over-strip meaningful content.
- Validate at least one malformed hostile input path to confirm stable, understandable output behavior.

## Testing

### Unit Tests

1. Security hardening tests:
- `<script>` payloads are neutralized/removed.
- `on*=` event-handler payloads are neutralized/removed.
- `javascript:` protocol payload patterns are neutralized/removed.
- Unsafe `data:` payload patterns are neutralized/removed for this path.
- Multi-character/encoded bypass-like strings are handled safely.

2. Regression tests for legitimate content:
- Plain text and punctuation preserved.
- Supported markdown token text (headings/lists/inline code content as text) remains parseable.
- Parser does not crash on malformed hostile input.

### Integration/Rendering Confidence

- Re-run existing markdown parser/renderer unit tests that assert output text behavior.
- Update only expectations directly impacted by intentional security hardening.

### Quality Gates

- Lint/typecheck/tests for affected scope must pass.
- New security tests must pass and demonstrate inert output for malicious payloads.

## Assumptions and Constraints

- `sanitizeText()` currently lives in parser utilities and remains the sanitization boundary for this update.
- Change should remain minimal and localized to markdown sanitization and tests.
- Security correctness has priority over preserving risky edge-case behavior.

## Open Questions

- Should sanitizer configuration be centralized in a dedicated utility file for reuse, or kept local to `app/utils/parse-markdown-safe.ts` for minimum change scope?
- Do we want explicit snapshot-style tests for sanitizer output strings, or behavior-oriented assertions only?

## Traceability Matrix

| Requirement ID | Design Section | Notes |
|----------------|----------------|-------|
| FR-1 | Architecture; Security; Interfaces | Replaces regex-centric core with vetted sanitizer while preserving boundary function. |
| FR-2 | Overview; Data; Accessibility; Testing | Preserves legitimate content and verifies regressions. |
| FR-3 | Security; Data; Testing | Neutralizes unsafe patterns and validates payload classes. |
| FR-4 | Testing | Adds dedicated security + regression automated coverage. |
| TR-1 | Architecture; Interfaces; Security | Restrictive explicit sanitizer policy and auditable configuration. |
| TR-2 | Architecture; Interfaces; Validation/Error Handling | Keeps `sanitizeText()` deterministic and isolated. |
| TR-3 | Interfaces; Testing | Dependency integration and toolchain compatibility validation. |
| TR-4 | Validation/Error Handling; Testing | Parser stability and safe handling of malformed input. |
| SR-1 | Security; Testing | XSS prevention controls and payload tests. |
| SR-2 | Security; Architecture | Removes regex-only primary control model. |
| SR-3 | Security; Testing | Protocol and dangerous attribute handling validation. |
| SR-4 | Interfaces; Security; Testing | Maintained dependency with secure configuration and checks. |
| AR-1 | Accessibility; Data; Testing | Preserves meaningful readable output and semantics. |
| AR-2 | Validation/Error Handling; Accessibility; Testing | Keeps understandable behavior under sanitization edge cases. |
