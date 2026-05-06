import type { PromptValidationResult } from "~~/types/api";

const EMPTY_PROMPT_MESSAGE = "Please enter a prompt.";

export function validatePrompt(input: string): PromptValidationResult {
  const trimmedPrompt = input.trim();

  if (!trimmedPrompt) {
    return {
      isValid: false,
      message: EMPTY_PROMPT_MESSAGE,
      trimmedPrompt,
    };
  }

  return {
    isValid: true,
    trimmedPrompt,
  };
}
