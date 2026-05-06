# Requirements

## Functional Requirements

### FR-1: Remove Character Limit from Shared Prompt Field
The shared prompt input field (used for Models 1 and 2) shall no longer enforce a maximum character limit. Users shall be able to type or paste prompts of any length.

### FR-2: Remove "Maximum 4000 characters." UI Message
The help text "Maximum 4000 characters." displayed below the prompt textarea shall be removed. No replacement help text referencing a character count limit shall be shown.

### FR-3: Remove maxlength HTML Attribute
The `maxlength="4000"` attribute shall be removed from the shared prompt textarea element, allowing the browser to accept input of any length.

### FR-4: Update Validation Logic
The `validatePrompt()` function shall no longer check the prompt length against a 4000-character cap. The only validation applied is that the trimmed prompt must not be empty.

### FR-5: Backend Consistency
The backend route (`/api/respond.post.ts`) applies `validatePrompt()` server-side. After removing the character-limit branch from that function, backend validation shall only reject empty prompts.

## Technical Requirements

### TR-1: Remove Length Check from validatePrompt
The `validatePrompt()` function shall remove the `trimmedPrompt.length > 4000` guard and the associated `MAX_PROMPT_MESSAGE` constant.

### TR-2: Update Return Type Consistency
The `PromptValidationResult` type is unchanged. The `validatePrompt()` function continues to return `{ isValid: false, message, trimmedPrompt }` only for empty prompts, and `{ isValid: true, trimmedPrompt }` for all non-empty prompts.

### TR-3: Remove Unused Constant
The `MAX_PROMPT_MESSAGE` constant in `prompt-validation.ts` shall be removed.

### TR-4: Update Unit Tests
Existing tests that assert a 4000-character over-limit error shall be removed or replaced with tests verifying that long prompts are now accepted.

## Accessibility Requirements

### AR-1: Accurate Help Text
The help text element below the shared prompt textarea shall not reference a character limit that no longer applies. If help text is retained, it shall be accurate and informative without false constraints.

## Performance Requirements

### PR-1: No Additional Overhead
Removing the length check introduces no additional computation or UI footprint. The change is strictly subtractive.
