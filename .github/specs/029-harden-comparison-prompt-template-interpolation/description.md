# Description

## General Description

Implement **Approach C (prompt template + comprehensive safeguards)** across the comparison-prompt generation flow so that untrusted model outputs are safely embedded in a canonical template before being sent to the comparison model. The app should preserve response fidelity for users while reducing prompt-injection risk through deterministic, testable, and centralized safeguards.

## Specific Description

The current app should be changed so prompt construction follows a single secure pipeline with explicit trusted/untrusted boundaries and consistent normalization rules.

### 1) Canonical prompt-template contract
- Keep one canonical comparison template file under server assets for model-3 comparison prompt generation.
- Ensure all comparison-prompt generation uses this template contract instead of ad-hoc string construction.
- Keep trusted instructions in template-owned sections only.

### 2) Centralized safe interpolation
- Route all untrusted content insertion through one dedicated utility function (single source of truth).
- Accept these inputs as untrusted: original user prompt, model-1 response, and model-2 response.
- Replace template placeholders only through this utility.

### 3) Explicit trusted/untrusted boundaries
- Wrap each untrusted value in deterministic sentinel markers (start/end pairs per field).
- Use unique marker names per field to avoid ambiguity.
- Ensure marker pairs are always present and correctly ordered.

### 4) Deterministic normalization and neutralization
- Normalize line endings to a single form.
- Strip disallowed control characters while preserving printable text and expected whitespace.
- Neutralize markdown fence-breakout sequences in untrusted content so payload text cannot escape wrapper structure.
- Apply transformations deterministically so identical input always produces identical output.

### 5) Token/size safeguards for robustness
- Add explicit limits for untrusted section size (character/token budget) to reduce context-smuggling pressure.
- Define behavior when limits are exceeded (e.g., deterministic truncation with visible indicator), while keeping behavior predictable and testable.

### 6) UI and request-path integration
- Keep the prompt-preview toggle behavior intact, but ensure previewed content is the **safeguarded** generated prompt.
- Ensure the same safeguarded prompt is used for the API request path to avoid preview/request mismatch.
- Preserve clear status/error UI behavior when prompt generation cannot proceed.

### 7) Verification and test coverage
- Add/maintain unit tests for:
  - marker insertion and integrity,
  - control-character handling,
  - fence neutralization,
  - deterministic output,
  - large-input limit behavior.
- Add/maintain UI/e2e assertions confirming safeguarded markers appear in generated prompt output and that feature behavior remains stable.

### 8) Security and architecture constraints
- Keep secrets server-side only (`runtimeConfig`), never in client prompt content.
- Prefer final prompt assembly/validation in server routes/utilities where possible, even if client-side preview is retained.
- Avoid unsafe rendering patterns for model text.

## Non-Goals

- Introducing a mandatory second "validator" LLM call for every request (Approach D as default).
- Rewriting user/model content semantically beyond structural safety normalization.
- Changing the user-facing comparison workflow or adding unrelated UI features.
- Replacing the template approach with ad-hoc dynamic prompt construction.
