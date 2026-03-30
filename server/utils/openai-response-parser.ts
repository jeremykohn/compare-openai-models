import type { OpenAIResponsesSuccess } from "../types/openai";

export function extractResponseText(payload: OpenAIResponsesSuccess): string {
  if (typeof payload.output_text === "string" && payload.output_text.trim()) {
    return payload.output_text;
  }

  const textFromOutput = (payload.output ?? [])
    .flatMap((item) => item.content ?? [])
    .map((content) => content.text)
    .find(
      (text): text is string =>
        typeof text === "string" && text.trim().length > 0,
    );

  if (textFromOutput) {
    return textFromOutput;
  }

  return "";
}
