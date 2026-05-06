# Technical Design

## Overview

This update replaces the default Nuxt app document title string with `Compare OpenAI Models` to align browser metadata with current product naming in the visible UI.

Scope is intentionally narrow:
- Update one app-level metadata title source.
- Update/add only directly impacted automated tests for title verification.
- Preserve all existing user-visible copy and runtime behavior outside the page title.

## Architecture

Current architecture uses Nuxt app-level head metadata in `nuxt.config.ts` under `app.head.title` as the canonical default title.

Design decision:
- Keep title ownership in `nuxt.config.ts` (single-source pattern).
- Replace only the stale title value.
- Do not introduce route-level `useHead`/`useSeoMeta` title overrides.

Affected files (expected):
- `nuxt.config.ts` (title literal update)
- One or more test files only if needed for title assertion coverage

## Interfaces

No API interfaces, request/response payloads, or component contracts change.

Metadata interface impact:
- Nuxt app config value `app.head.title` remains a string.
- New string value: `Compare OpenAI Models`.

## Data

No new data models or persistence.

Data/state flow impact:
- None to app runtime state.
- Static metadata value replacement only.

## Validation/Error Handling

No new validation or error-handling paths are introduced.

Implementation safeguards:
- Keep title as static trusted literal (no interpolation from user input).
- Verify unchanged behavior by running targeted tests and lint/type checks for touched files.

## Security

Security-relevant design constraints:
- Title remains a hardcoded trusted configuration value (`SR-1`).
- No runtime pathway from untrusted input to metadata title is introduced (`SR-1`).
- Remove the stale title string from authoritative source metadata (`SR-2`).

OWASP alignment (scope-limited):
- A03 Injection: avoid introducing any user-controlled output path for title construction.
- A05 Security Misconfiguration: maintain deterministic metadata configuration and eliminate deprecated active value.

## Accessibility

The document title is a key non-visual orientation signal for people using assistive technologies and for tab switching.

Accessibility design decisions:
- Use concise, descriptive title text matching current app identity (`AR-1`).
- Keep title semantically aligned with visible page heading while remaining appropriate for browser tab context (`AR-1`).

## Testing

Testing strategy:
- Update existing title assertions if present.
- If missing, add a focused test that verifies final page title equals `Compare OpenAI Models`.
- Ensure unaffected visible copy remains unchanged by avoiding unnecessary test fixture/copy edits.

Validation commands (targeted then broad):
- `npm run test:unit` (or targeted unit test if title assertion is unit-scoped)
- `npm run test:e2e` (only if title is asserted in e2e scope)
- `npm run lint`

Given scope, minimum required execution is targeted tests for touched test files plus lint/type checks as needed.

## Assumptions and Constraints

Assumptions:
- `nuxt.config.ts` is the canonical source of the default title.
- Existing tests can be updated in place or minimally extended.

Constraints:
- Exact title output must be `Compare OpenAI Models`.
- No unrelated functional, UI copy, or architecture changes.
- Keep change set minimal and reversible.

## Open Questions

None.

## Traceability Matrix

| Requirement ID | Design Section | Notes |
|----------------|----------------|-------|
| FR-1 | Architecture; Interfaces; Testing | Defines exact title source/value and verification path. |
| FR-2 | Overview; Testing | Explicitly preserves non-title UI copy and behavior. |
| FR-3 | Testing | Requires assertion updates/additions for title behavior. |
| TR-1 | Architecture | Single-source metadata ownership in `nuxt.config.ts`. |
| TR-2 | Overview; Architecture | Scope constrained to metadata + directly impacted tests. |
| TR-3 | Testing | Validation commands and pass criteria included. |
| SR-1 | Security; Validation/Error Handling | Title remains static trusted literal, no untrusted input flow. |
| SR-2 | Security; Architecture | Removes stale title from authoritative metadata source. |
| AR-1 | Accessibility | Title clarity and consistency for assistive-technology context. |
