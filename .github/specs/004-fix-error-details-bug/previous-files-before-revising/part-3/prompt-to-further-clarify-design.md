You are a Senior Software Engineer and Technical Design Editor.

Update this file in place:
- `.github/specs/004-fix-error-details-bug/design.md`

## Objective

Apply one additional clarification to the design:
- The UI must not display `unknown` for unknown errors or unknown error formats.
- Instead, it must display the entire stringified error payload in `details`, but only after sanitizing the payload content for security.

## Required Change

Make this behavior explicit and consistent across relevant design sections:

1. **Display behavior update**
   - Replace any guidance that allows user-facing `unknown` values for error type display.
   - For unknown/unrecognized error shapes, the UI should show:
     - fixed safe message (per existing policy), and
     - `details` containing sanitized stringified full error payload.

2. **Unknown/error-format fallback rule**
   - If the error is unknown OR its format is unsupported, normalization should:
     - stringify the full payload,
     - sanitize the stringified payload,
     - apply current `details` length cap,
     - store in `details`,
     - and avoid surfacing `unknown` as a user-facing type value.

3. **Security alignment**
   - Keep strict redaction policy intact:
     - no secrets, tokens, auth headers, stack traces, internal paths, or sensitive internals.
   - Clarify that sanitization must happen before truncation and rendering.

4. **Testing alignment**
   - Update/add test scenarios so they verify:
     - unknown error objects do not render user-facing `unknown` type,
     - unsupported payloads render sanitized stringified `details`,
     - sensitive patterns are redacted in fallback details.

## Sections to update in `design.md`

Reflect this change in:
- `Overview`
- `Architecture`
- `Data`
- `Validation / Error Handling`
- `Security`
- `Testing`
- `Traceability` (if notes need to reflect this clarification)

## Constraints

- Keep the existing top-level structure of `design.md`.
- Do not modify application code in this step.
- Keep all previous resolved decisions unless directly superseded by this clarification.
- Keep wording precise and deterministic.

## Output requirements

- Edit only `.github/specs/004-fix-error-details-bug/design.md`.
- At the end of `design.md`, update the existing **Consistency Check** bullets so they explicitly confirm:
  - unknown/unsupported errors do not display user-facing `unknown`, and
  - fallback uses sanitized stringified payload in `details`.
