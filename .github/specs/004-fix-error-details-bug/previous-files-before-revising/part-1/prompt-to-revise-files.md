You are a Senior Software Engineer and Senior Technical Writer.

Your task is to **update and correct** the following two files so they are accurate, consistent, and implementation-ready:

1. `.github/specs/004-fix-error-details-bug/find-cause-of-bug-and-propose-implementation-plan.md`
2. `.github/specs/004-fix-error-details-bug/findings-and-implementation-plan.md`

## Critical correction you MUST apply

`model_not_found` is **not** a field name. It is a possible **value** of the `code` field.

Use this canonical example shape when discussing typed API errors:
- `type`: `invalid_request_error`
- `code`: `model_not_found`
- `param`: `model`
- `status`: `400`
- `statusText`: `Bad Request`

## Goals

- Correct any inaccurate references that imply `model_not_found` is a field/key.
- Ensure both files use consistent error terminology, data contracts, and examples.
- Keep focus on secure error handling and user-safe error display.
- Preserve intent: analysis + remediation planning (no speculative code changes in these docs).

## Required updates

### A) Terminology and schema correctness
- Replace incorrect phrases like “field `model_not_found`” with correct wording such as:
  - “error `code` value `model_not_found`”
  - “typed error with `type`, `code`, `param`, and HTTP status metadata”
- Ensure every example distinguishes clearly between:
  - field names (`type`, `code`, `param`, `status`, `statusText`)
  - field values (`invalid_request_error`, `model_not_found`, `model`, `400`, `Bad Request`)

### B) Data-flow and root-cause precision
- In both files, update the data-flow discussion to explicitly track:
  - `type`
  - `code`
  - `param`
  - `status` / `statusCode`
  - `statusText`
  - user-facing `message` / sanitized `details`
- Identify where these are currently dropped, normalized, renamed, or not rendered.
- Ensure root-cause findings mention loss of `code` value (e.g., `model_not_found`) rather than “missing model_not_found field”.

### C) Security and disclosure policy
- Keep strict redaction posture:
  - never expose secrets, auth headers, bearer tokens, API keys, stack traces, internal file paths, internal hostnames.
- Clarify that user-visible error metadata may include safe fields (`type`, `code`, `param`, HTTP status) when sanitized and policy-approved.

### D) Remediation plan quality
- Ensure remediation tasks reference preserving and rendering a **typed error contract**.
- Require backward compatibility for legacy `{ message, details }` payloads while adding optional typed fields.
- Add acceptance criteria that verify:
  - `code = model_not_found` survives end-to-end
  - status is preserved from HTTP response
  - `Type` does not degrade to `Unknown` when typed metadata is available

### E) Test plan quality
- Add/adjust scenarios so tests explicitly cover:
  - typed upstream error (`type=invalid_request_error`, `code=model_not_found`, `param=model`, `status=400`, `statusText=Bad Request`)
  - missing fields / malformed payloads
  - non-JSON error responses
  - sanitization/redaction behavior
- Ensure assertions verify field-value correctness, not just presence of generic labels.

## Output requirements

- Edit both target files in place.
- Keep their structure/headings intact unless a minor restructure improves clarity.
- Ensure the two files do not contradict each other.
- Use precise, deterministic language.
- End each file with a short “Consistency Check” bullet list confirming:
  - `model_not_found` treated as a `code` value
  - field names vs values are used correctly
  - security constraints are preserved

## Style constraints

- Be concise but specific.
- Prefer concrete references to fields and data flow over generic wording.
- Avoid introducing new behavior not tied to the documented objective.
