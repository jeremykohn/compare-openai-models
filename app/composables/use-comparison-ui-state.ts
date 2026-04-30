import { computed, type Ref } from "vue";
import type { RequestStatus } from "~~/types/api";
import type { NormalizedUiError } from "../utils/error-normalization";
import model3PromptTemplate from "../../server/assets/prompt-templates/model-3-prompt-template.md?raw";

type ModelRequestState = {
  status: RequestStatus;
  data: string | null;
  error: NormalizedUiError | null;
};

export type OutputPanelState = {
  key: "model1" | "model2";
  label: "Model 1" | "Model 2";
  heading: string;
  status: RequestStatus;
  data: string | null;
  error: NormalizedUiError | null;
};

export function useComparisonUiState(options: {
  model1State: ModelRequestState;
  model2State: ModelRequestState;
  submittedPrompt: Ref<string>;
  submittedModelIdModel1: Ref<string>;
  submittedModelIdModel2: Ref<string>;
  submittedModelIdModel3: Ref<string>;
}) {
  const model1OutputHeading = computed(
    () => `Response from Model 1 (${options.submittedModelIdModel1.value})`,
  );

  const model2OutputHeading = computed(
    () => `Response from Model 2 (${options.submittedModelIdModel2.value})`,
  );

  const outputPanels = computed<OutputPanelState[]>(() => [
    {
      key: "model1",
      label: "Model 1",
      heading: model1OutputHeading.value,
      status: options.model1State.status,
      data: options.model1State.data,
      error: options.model1State.error,
    },
    {
      key: "model2",
      label: "Model 2",
      heading: model2OutputHeading.value,
      status: options.model2State.status,
      data: options.model2State.data,
      error: options.model2State.error,
    },
  ]);

  const isLoading = computed(
    () =>
      options.model1State.status === "loading" ||
      options.model2State.status === "loading",
  );

  const showOutputPanels = computed(
    () =>
      options.model1State.status === "loading" ||
      options.model2State.status === "loading" ||
      options.model1State.status === "success" ||
      options.model1State.status === "error" ||
      options.model2State.status === "success" ||
      options.model2State.status === "error",
  );

  const isComparisonWaiting = computed(
    () =>
      options.model1State.status === "loading" ||
      options.model2State.status === "loading",
  );

  const hasModel1Error = computed(() => options.model1State.status === "error");
  const hasModel2Error = computed(() => options.model2State.status === "error");
  const hasAnyOuterError = computed(
    () => hasModel1Error.value || hasModel2Error.value,
  );
  const hasBothOuterSuccess = computed(
    () =>
      options.model1State.status === "success" &&
      options.model2State.status === "success",
  );

  const comparisonPlaceholderText = computed(
    () =>
      `New feature coming soon: Using ${options.submittedModelIdModel3.value} to compare responses from ${options.submittedModelIdModel1.value} and ${options.submittedModelIdModel2.value}`,
  );

  const generatedModel3Prompt = computed(() => {
    if (!hasBothOuterSuccess.value) {
      return null;
    }

    const originalPrompt = options.submittedPrompt.value.trim();
    const response1 = options.model1State.data?.trim();
    const response2 = options.model2State.data?.trim();

    if (!originalPrompt || !response1 || !response2) {
      return null;
    }

    return model3PromptTemplate
      .replaceAll("{{ORIGINAL_PROMPT}}", originalPrompt)
      .replaceAll("{{RESPONSE_1}}", response1)
      .replaceAll("{{RESPONSE_2}}", response2);
  });

  const comparisonErrorText = computed(() => {
    const erroredModelDescriptors: string[] = [];

    if (hasModel1Error.value) {
      erroredModelDescriptors.push(
        `Model 1 (${options.submittedModelIdModel1.value})`,
      );
    }

    if (hasModel2Error.value) {
      erroredModelDescriptors.push(
        `Model 2 (${options.submittedModelIdModel2.value})`,
      );
    }

    return `Unable to compare model outputs due to errors when querying ${erroredModelDescriptors.join(", ")}`;
  });

  const comparisonPanelHeading = computed(() => {
    if (hasAnyOuterError.value) {
      return "Error: Cannot produce comparison";
    }

    return "Comparison of responses from Model 1 and Model 2";
  });

  return {
    isLoading,
    showOutputPanels,
    outputPanels,
    isComparisonWaiting,
    hasAnyOuterError,
    hasBothOuterSuccess,
    comparisonPlaceholderText,
    generatedModel3Prompt,
    comparisonErrorText,
    comparisonPanelHeading,
  };
}
