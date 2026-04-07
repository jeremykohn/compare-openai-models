export type OpenAIModelsResponse = {
  object: "list";
  data: Array<{
    id: string;
    object?: string;
    created?: number;
    owned_by?: string;
  }>;
};

export type OpenAIResponsesSuccess = {
  id?: string;
  output_text?: string;
  output?: Array<{
    type?: string;
    content?: Array<{
      type?: string;
      text?: string;
    }>;
  }>;
};
