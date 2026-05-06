# Description

## General Description

Currently the app limits prompts to 4000 characters. Remove this limit and remove the UI message that says "Maximum 4000 characters."

## Specific Description

### Problem Statement

The current prompt input validation enforces a hard 4000-character limit on the shared prompt field (used by Models 1 and 2). This constraint restricts users from sending longer, more complex prompts to these models, reducing their ability to provide detailed context, examples, and instructions for substantive tasks.

People working with the app are affected because they cannot leverage Models 1 and 2 for tasks that require longer inputs, such as code analysis, documentation generation, and detailed explanations.

### Intended Outcome

Remove the 4000-character limit on the shared prompt field. Users should be able to submit prompts of any reasonable length, with the OpenAI API's native token limit as the effective ceiling.

After the update:
- The shared prompt input field no longer displays the "Maximum 4000 characters." help text.
- The `maxlength` HTML attribute is removed from the textarea.
- The `validatePrompt()` function no longer enforces a 4000-character limit.
- Backend validation is updated to remove the character-based check.
- Users can submit longer prompts to Models 1, 2, and 3.

### Scope Boundaries

In scope:
- Remove the 4000-character limit from frontend validation.
- Remove the "Maximum 4000 characters." UI message and maxlength attribute.
- Remove or update backend validation that checks for this limit.
- Update tests that currently assume the 4000-character limit.
- Update documentation to reflect the change.

Out of scope:
- Changing how prompts are sent to OpenAI models.
- Modifying response-length limits or handling.
- Redesigning the prompt input UI component.
- Adding token counting or pre-flight token validation.

### Key Behaviors and Expected User-Visible Results

- The shared prompt input field has no character limit indicated in the UI.
- Users can paste or type prompts longer than 4000 characters without error.
- Error handling gracefully displays messages if a prompt exceeds the OpenAI API's token limit.
- Behavior for Models 1 and 2 matches (or becomes consistent with) Model 3's unlimited prompt behavior.

### Assumptions

- Users understand that extremely large prompts may still encounter OpenAI API token limits.
- The OpenAI API will enforce its own token limits and return appropriate errors if exceeded.
- Removing the UI constraint is safe because the API enforces limits server-side.

### Constraints

- Maintain security and input validation for all prompts (sanitization, injection prevention, etc.).
- Keep validation logic simple and understandable to maintainers.
- Ensure backend gracefully handles oversized requests beyond OpenAI token limits with clear error messages.
- Preserve existing API response contracts and error handling patterns.

### Explicit Exclusions

- No implementation of dynamic limit adjustment based on user tier or account status.
- No client-side token counter or pre-submission token validation.
- No changes to model upload or file-based prompt input.
- No modifications to non-prompt input fields (model selectors, etc.).

## Non-Goals

- Implementing a universal tokenizer for accurate pre-submission token counting.
- Adding prompt compression or summarization features.
- Changing response-handling behavior.
- Adding premium/free tier distinction for limit access.
