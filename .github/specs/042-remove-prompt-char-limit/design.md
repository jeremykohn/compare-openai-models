# Design

## Overview

Spec 042 removes the 4000-character limit from the shared prompt field used by Models 1 and 2. The change is strictly subtractive: no new UI elements, no new validation rules, and no new routes. The OpenAI API's native token limits remain the effective ceiling.

## Architecture

No structural changes to the application architecture. All changes are confined to:
- `validatePrompt()` (removes the length check branch)
- `app.vue` template (removes `maxlength` attribute and help text paragraph)
- Unit tests (removes/replaces over-limit test case)

## Data Structures

### PromptValidationResult (types/api.ts)
Unchanged. The union type already supports both success and failure shapes without reference to any numeric limit.

## Interfaces

### Updated validatePrompt()
**File**: `app/utils/prompt-validation.ts`

Before:
```typescript
// Rejected if empty OR length > 4000
```

After:
```typescript
// Rejected only if empty
```

The function signature `validatePrompt(input: string): PromptValidationResult` is unchanged. Return shape is unchanged. Only the body changes: the `if (trimmedPrompt.length > 4000)` guard and `MAX_PROMPT_MESSAGE` constant are removed.

## Data Flow

No change to data flow. Prompts continue to be:
1. Validated client-side via `validatePrompt()` on form submit.
2. Sent to `/api/respond` via fetch.
3. Validated server-side via the same `validatePrompt()` called in `respond.post.ts`.
4. Forwarded to the OpenAI API.

The only difference: prompts longer than 4000 characters now pass validation in steps 1 and 3 and proceed to step 4.

## Validation Strategy

### Shared Prompt (Models 1 & 2)
- **Rule**: Required (non-empty after trim). No length limit.
- **Error Handling**: Display inline error and block submission only for empty prompts.
- **Token Limit**: OpenAI API enforces; error response displayed to user via existing error handling.

## Security Considerations

Removing the character limit does not change the security posture:
- Input sanitization (control character stripping, prompt injection markers) is applied in `buildSafeComparisonPrompt` independently of prompt length.
- Server-side prompt validation still rejects empty prompts.
- Larger payloads are bounded by OpenAI API token limits and standard HTTP request size limits of the hosting environment.

## Accessibility

### Help Text
The `<p id="prompt-help">` element currently reads "Maximum 4000 characters." This text is referenced by `aria-describedby` on the textarea. Two options:

**Option A (selected)**: Remove the paragraph element entirely and remove `aria-describedby` pointing to it from the textarea. This is the cleanest option since the text served only to communicate the (now-removed) limit.

**Option B**: Replace with generic help text (e.g., "Enter your prompt"). This adds noise without value since the field purpose is already described by the label. Rejected.

With Option A applied, the textarea retains its `aria-required`, `aria-invalid`, and error `aria-describedby` attributes (pointing to `prompt-error` when present). The `aria-describedby` pointing to `prompt-help` is removed.

## Testing Strategy

### Unit Tests (tests/unit/prompt-validation.test.ts)
- **Remove**: `"returns error for prompt over 4000 chars after trim"` — this behavior no longer exists.
- **Add**: `"returns valid result for prompt longer than 4000 characters"` — asserts a 4001-character prompt now passes validation.
- **Keep**: all other existing tests (empty prompt, valid prompt with whitespace).

### UI Tests (tests/unit/app.ui.test.ts)
- **Remove** or **update**: any assertion that `maxlength` is `"4000"` on the prompt textarea.

## Traceability

| Requirement | Design Section | Files Affected |
|-------------|-----------------|---------------|
| FR-1 | Validation Strategy | `app/utils/prompt-validation.ts` |
| FR-2 | Accessibility / Help Text | `app/app.vue` (template) |
| FR-3 | Interfaces | `app/app.vue` (template) |
| FR-4 | Interfaces | `app/utils/prompt-validation.ts` |
| FR-5 | Data Flow | `server/api/respond.post.ts` (via shared `validatePrompt`) |
| TR-1 | Interfaces | `app/utils/prompt-validation.ts` |
| TR-2 | Data Structures | `types/api.ts` (no change needed) |
| TR-3 | Interfaces | `app/utils/prompt-validation.ts` |
| TR-4 | Testing Strategy | `tests/unit/prompt-validation.test.ts` |
| AR-1 | Accessibility / Help Text | `app/app.vue` (template) |
| PR-1 | Architecture | All (subtractive only) |
