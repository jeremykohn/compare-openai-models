# Technical Design

## Overview

This update migrates sanitization in the markdown-safe parser path from a custom regex-heavy approach to a maintained sanitizer library (`sanitize-html`) while preserving existing parser interfaces.

Goals:
- Make `sanitize-html` the primary sanitization mechanism.
- Reduce security and maintenance risk from regex-chain sanitization.
- Preserve expected behavior for legitimate text content.
- Add targeted test coverage for both security and regression confidence.

## Architecture

- Sanitization boundary remains `sanitizeText()` in `app/utils/parse-markdown-safe.ts`.
- `sanitizeText()` calls `sanitize-html` with explicit restrictive configuration.
- Post-sanitization lightweight normalization may remain only for non-security formatting needs.
- Parser/tokenization flow remains unchanged outside sanitization internals.

Affected files:
- `app/utils/parse-markdown-safe.ts`
- `tests/unit/parse-markdown-safe.test.ts`
- `package.json`
- `package-lock.json`

## Interfaces

- Keep signature: `sanitizeText(value: string): string`.
- Keep existing call sites and parse-node flow unchanged.
- Add internal sanitizer options constant for explicit, auditable behavior.

`sanitize-html` policy intent for this path:
- No allowed tags by default for plain text sanitization path.
- No allowed attributes.
- Restrictive handling for parser usage where raw HTML is not a feature.

## Data

Inputs:
- Untrusted markdown/model/user text strings.

Flow:
1. Receive raw string input in parser path.
2. Pass through `sanitize-html` with restrictive options.
3. Return sanitized string for AST node construction.

Outputs:
- Sanitized plain text content suitable for safe AST rendering.
- Deterministic string output for equivalent input.

## Validation/Error Handling

- Guard empty input consistently.
- Ensure sanitizer invocation cannot crash parser path; behavior should remain stable for malformed hostile input.
- Preserve current parser output conventions (for example, empty nodes when content becomes empty).

## Security

- Replace regex-only primary control with parser-based sanitization from `sanitize-html`.
- Enforce restrictive configuration to minimize unsafe passthrough.
- Cover script tags, encoded variants, mixed-case payloads, and protocol abuse examples with tests.
- OWASP alignment:
  - A03 Injection/XSS: block script execution vectors.
  - A05 Security Misconfiguration: avoid fragile ad-hoc filter behavior.
  - A06 Vulnerable Components: use maintained dependency and explicit config.

## Accessibility

- Preserve readable non-malicious text output after sanitization.
- Avoid over-sanitization that removes meaningful content needed for comprehension.
- Keep parser outcomes stable so assistive-technology-facing rendered content remains predictable.

## Testing

Unit testing strategy:
- Add/update tests in `tests/unit/parse-markdown-safe.test.ts` for:
  - Script tag payload removal.
  - Encoded and mixed-case attack payload handling.
  - Non-malicious text preservation (symbols, quotes, normal prose).
  - No-throw behavior on malformed markdown inputs.

Validation commands:
- `npm run test:unit -- tests/unit/parse-markdown-safe.test.ts`
- `npm run lint`
- `npm test`

## Assumptions and Constraints

- Sanitization change is localized and does not require parser architecture changes.
- Dependency addition is acceptable in this repository.
- Existing testing/linting stack remains the validation gate.

## Open Questions

- Should sanitizer options remain local to `parse-markdown-safe.ts` or move to a shared utility for future reuse?

## Traceability Matrix

| Requirement ID | Design Section | Notes |
|----------------|----------------|-------|
| FR-1 | Overview; Architecture; Interfaces; Security | Migrates to `sanitize-html` primary control. |
| FR-2 | Overview; Data; Accessibility; Testing | Preserves legitimate rendering behavior with regression tests. |
| FR-3 | Security; Testing | Covers unsafe payload classes. |
| FR-4 | Testing | Adds automated verification gates. |
| TR-1 | Architecture; Interfaces | Keeps `sanitizeText()` boundary and signature. |
| TR-2 | Interfaces; Security | Explicit restrictive sanitizer configuration. |
| TR-3 | Architecture; Testing | Dependency + toolchain compatibility validation. |
| TR-4 | Data; Validation/Error Handling; Testing | Deterministic behavior and stability on malformed input. |
| SR-1 | Security; Testing | XSS-focused coverage and mitigation. |
| SR-2 | Security; Architecture | Removes regex-only primary sanitization. |
| SR-3 | Security; Testing | Protocol abuse handling and tests. |
| AR-1 | Accessibility; Testing | Readable output preservation. |
| AR-2 | Validation/Error Handling; Accessibility | Stable understandable behavior on malformed input. |
