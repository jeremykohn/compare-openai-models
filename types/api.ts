export type RequestStatus = "idle" | "loading" | "success" | "error";

export type OpenAIModel = {
  id: string;
  object: "model";
  created: number;
  owned_by: string;
};

export type ModelsApiResponse = {
  object: "list";
  data: OpenAIModel[];
  usedConfigFilter: boolean;
  showFallbackNote: boolean;
};

export type ApiErrorResponse = {
  message: string;
  details?: string;
  code?: string;
  type?: string;
  param?: string;
  statusText?: string;
};

export type RespondRequest = {
  prompt: string;
  model?: string;
};

export type RespondSuccessResponse = {
  response: string;
  model: string;
};

export type PromptValidationResult =
  | {
      isValid: true;
      trimmedPrompt: string;
    }
  | {
      isValid: false;
      message: string;
      trimmedPrompt: string;
    };
