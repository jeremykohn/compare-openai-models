You are a Senior Software Engineer and Technical Design Editor.

Update this file in place:
- `.github/specs/004-fix-error-details-bug/design.md`

## Objective

Revise the technical design to incorporate newly resolved decisions and one additional fallback behavior, while preserving the existing structure and security posture.

## Required Changes

1. **Unsupported payload fallback behavior**
   - Add explicit behavior for unsupported OpenAI error payload formats:
     - If the OpenAI API returns an error payload in an unsupported format, the UI error details must fall back to displaying the **entire stringified error payload**.
     - This fallback output must be **sanitized before display** to prevent leaks.
   - Ensure this behavior is reflected consistently in:
     - `Architecture`
     - `Data`
     - `Validation / Error Handling`
     - `Security`
     - `Testing`

2. **Resolve OQ-1**
   - Apply this final decision:
     - The user-facing `Type` label maps to the upstream provider `type` field value.
   - Update any sections that currently imply `Type` maps to transport category (`api/network/unknown`).
   - Keep transport category available internally if needed, but ensure displayed `Type` reflects upstream `type`.

3. **Resolve OQ-2**
   - Apply this final decision:
     - `code` (e.g., `model_not_found`) is shown verbatim to users.
   - Remove any ambiguity about translation/mapping for `code` values.

4. **Resolve OQ-3**
   - Apply this final decision:
     - Maximum character length for `details` is **256**.
   - Update all conflicting references (including any `128` limits currently applied to `details`).
   - Ensure consistency between `Constraints`, `Security`, and `Validation / Error Handling`.

5. **Resolve OQ-4**
   - Apply this final decision:
     - Server routes keep fixed messages for safety.
   - Preserve this in interface and security guidance; do not re-open this as a question.

## Consistency Requirements

- Keep the existing top-level section structure in `design.md`.
- Make terminology consistent across sections:
  - `type`, `code`, `param`, `statusCode`, `statusText`, `details`.
- Ensure the fallback behavior for unsupported payload format is security-safe and testable.
- Update the `Traceability` section if needed to reflect newly clarified design decisions.
- Update `Assumptions, Constraints, and Open Questions` so OQ-1..OQ-4 are no longer open; replace with a brief “Resolved Decisions” subsection.

## Security Guardrails (must remain explicit)

- Never expose secrets, tokens, auth headers, stack traces, internal file paths, or sensitive internals.
- Stringified fallback payload must be sanitized before truncation/rendering.
- Preserve allowlist-oriented UI display policy.

## Testing Updates Required

Add/adjust test scenarios to explicitly verify:
- Unsupported-format payload fallback renders sanitized stringified payload in `details`.
- `Type` displays upstream `type` value.
- `code` displays verbatim (e.g., `model_not_found`).
- `details` truncation/limit behavior at 256 characters.
- Fixed server message behavior remains unchanged.

## Output Requirements

- Edit only `.github/specs/004-fix-error-details-bug/design.md`.
- Do not modify code in this step.
- Keep changes precise and deterministic.
- At the end of `design.md`, append a short **Consistency Check** bullet list confirming:
  - Unsupported payload fallback added with sanitization
  - `Type` maps to upstream `type`
  - `code` displayed verbatim
  - `details` max length is 256
  - Fixed server messages retained
