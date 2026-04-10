import type { PromptValidationResult } from "~~/types/api";

const EMPTY_PROMPT_MESSAGE = "Please enter a prompt.";
const MAX_PROMPT_MESSAGE = "Prompt must be 4000 characters or fewer.";

export function validatePrompt(input: string): PromptValidationResult {
  const trimmedPrompt = input.trim();

  if (!trimmedPrompt) {
    return {
      isValid: false,
      message: EMPTY_PROMPT_MESSAGE,
      trimmedPrompt,
    };
  }

  if (trimmedPrompt.length > 4000) {
    return {
      isValid: false,
      message: MAX_PROMPT_MESSAGE,
      trimmedPrompt,
    };
  }

  return {
    isValid: true,
    trimmedPrompt,
  };
}
