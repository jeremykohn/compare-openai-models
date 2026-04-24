You are a Senior Software Engineer and debugging lead.

I need a root-cause analysis and remediation plan (no code changes yet) for this bug:

- In the UI error panel, under **Error Details**, it shows `Type: Unknown`
- It does **not** show expected details such as HTTP status code or specific error identifiers/messages like `model_not_found`
- This appears to be a bug in error normalization, propagation, or rendering

## Objective

Find the cause and propose a concrete, secure implementation plan so the UI shows all useful error details while still preventing sensitive information disclosure.

## Constraints

- Do **not** write or modify code yet
- Do **not** change behavior yet
- Perform analysis only
- Be security-conscious: no exposure of secrets, tokens, internal stack traces, auth headers, internal paths, or sensitive backend internals

## What to analyze

1. End-to-end error flow:
   - Where errors originate (API/server/client)
   - How they are normalized/sanitized
   - How they are stored in state/composables
   - How they are passed into UI components
   - How `Type`, status code, and message/details are rendered

2. Why `Type` becomes `Unknown`:
   - Determine whether this is due to:
     - loss of metadata during normalization
     - fallback behavior in classification
     - state shape mismatch
     - prop mismatch between components
     - conditional rendering logic suppressing fields
     - server response not including expected fields

3. Why status code / specific error detail (e.g., `model_not_found`) is not displayed:
   - Identify exact drop-off point(s) in the data path
   - Confirm whether values are absent upstream or present but not rendered

4. Security posture of current and proposed behavior:
   - Identify what can safely be shown to users
   - Identify what must be redacted or omitted

## Required output format

Produce the result in this exact structure:

### 1) Executive Summary
- Briefly explain what is broken and why

### 2) Evidence-Based Findings
For each finding, include:
- **Finding ID**
- **Observed behavior**
- **Likely cause**
- **Evidence** (file paths, symbols/functions/components involved)
- **Impact**

### 3) Data-Flow Trace
- Step-by-step trace of error object from origin to UI
- Highlight where type/status/message/details are lost, overwritten, or filtered

### 4) Security Review
- Fields safe to show in UI
- Fields that must be redacted/hidden
- Recommended sanitization/display policy

### 5) Remediation Plan (No Code Yet)
- Phase-based plan with dependency order
- For each task:
  - Task ID
  - Purpose
  - Files likely impacted
  - Acceptance criteria
  - Validation approach (unit/integration/e2e)
- Include backward-compatibility considerations

### 6) Test Plan
- Specific test scenarios for:
  - known typed API errors (e.g., `model_not_found`)
  - network errors
  - unknown/untyped exceptions
  - status code presence/absence
  - sanitization/redaction behavior

### 7) Risks and Open Questions
- Risks of implementing the fix
- Any ambiguities requiring confirmation before coding

## Additional quality bar

- Be precise and deterministic
- Prefer concrete file/symbol references over generic statements
- If multiple root-cause candidates exist, rank them by confidence and explain how to verify each

## Output file

Save the output to .github/specs/004-fix-error-details-bug/findings-and-implementation-plan.md
