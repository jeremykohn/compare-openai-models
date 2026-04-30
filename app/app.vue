<script setup lang="ts">
import { ref } from "vue";
import { DEFAULT_MODEL } from "~~/shared/constants/models";
import ModelsSelector from "./components/ModelsSelector.vue";
import ModelOutputPanel from "./components/ModelOutputPanel.vue";
import ComparisonOutputPanel from "./components/ComparisonOutputPanel.vue";
import { useModelsState } from "./composables/use-models-state";
import { useModelQuery } from "./composables/use-model-query";
import { useComparisonUiState } from "./composables/use-comparison-ui-state";
import { validatePrompt } from "./utils/prompt-validation";

const prompt = ref("");
const submittedPrompt = ref("");
const selectedModelIdModel1 = ref("");
const selectedModelIdModel2 = ref("");
const selectedModelIdModel3 = ref("");
const submittedModelIdModel3 = ref(DEFAULT_MODEL);
const comparisonPromptResetKey = ref(0);
const validationError = ref<string | null>(null);
const promptRef = ref<HTMLTextAreaElement | null>(null);

const {
  state: model1RequestState,
  submittedModelId: submittedModelIdModel1,
  query: queryModel1,
} = useModelQuery("model1");
const {
  state: model2RequestState,
  submittedModelId: submittedModelIdModel2,
  query: queryModel2,
} = useModelQuery("model2");
const { state: modelsState, fetchModels } = useModelsState();
const {
  state: model3RequestState,
  query: queryModel3,
  reset: resetModel3,
} = useModelQuery("model3");

const {
  isLoading,
  showOutputPanels,
  outputPanels,
  isComparisonWaiting,
  hasAnyOuterError,
  generatedModel3Prompt,
  comparisonErrorText,
  comparisonPanelHeading,
  isModel3Loading,
} = useComparisonUiState({
  model1State: model1RequestState,
  model2State: model2RequestState,
  model3State: model3RequestState,
  submittedPrompt,
  submittedModelIdModel1,
  submittedModelIdModel2,
  submittedModelIdModel3,
});

async function handleSubmit(): Promise<void> {
  if (isLoading.value) {
    return;
  }

  validationError.value = null;
  const promptResult = validatePrompt(prompt.value);

  if (!promptResult.isValid) {
    validationError.value = promptResult.message;
    promptRef.value?.focus();
    return;
  }

  submittedModelIdModel3.value =
    selectedModelIdModel3.value.trim() || DEFAULT_MODEL;
  submittedPrompt.value = promptResult.trimmedPrompt;
  comparisonPromptResetKey.value += 1;
  resetModel3();

  await Promise.all([
    queryModel1(promptResult.trimmedPrompt, selectedModelIdModel1.value),
    queryModel2(promptResult.trimmedPrompt, selectedModelIdModel2.value),
  ]);

  if (
    model1RequestState.status === "success" &&
    model2RequestState.status === "success" &&
    generatedModel3Prompt.value
  ) {
    await queryModel3(generatedModel3Prompt.value, selectedModelIdModel3.value);
  }
}
</script>

<template>
  <div
    class="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100 px-6 text-slate-900"
  >
    <header class="mx-auto max-w-3xl pb-8 pt-12 text-center">
      <a href="#maincontent" class="sr-only">Skip to main</a>
      <h1 class="text-3xl font-semibold tracking-tight sm:text-4xl">
        ChatGPT prompt tester
      </h1>
      <p class="mt-3 text-base text-slate-600 sm:text-lg">
        Send a prompt and see the response.
      </p>
    </header>

    <main
      id="maincontent"
      class="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 pb-14"
    >
      <form
        class="grid gap-4 rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-lg shadow-slate-200/50 backdrop-blur"
        @submit.prevent="handleSubmit"
      >
        <ModelsSelector
          :selected-model-id-model1="selectedModelIdModel1"
          :selected-model-id-model2="selectedModelIdModel2"
          :selected-model-id-model3="selectedModelIdModel3"
          :status="modelsState.status"
          :models="modelsState.data"
          :error="modelsState.error"
          :show-fallback-note="modelsState.showFallbackNote"
          :disabled="isLoading"
          @update:selected-model-id-model1="selectedModelIdModel1 = $event"
          @update:selected-model-id-model2="selectedModelIdModel2 = $event"
          @update:selected-model-id-model3="selectedModelIdModel3 = $event"
          @retry="fetchModels"
        />

        <div class="grid gap-2">
          <label class="text-sm font-semibold text-slate-700" for="prompt-input"
            >Prompt *</label
          >
          <textarea
            id="prompt-input"
            ref="promptRef"
            v-model="prompt"
            maxlength="4000"
            :aria-required="true"
            :aria-invalid="Boolean(validationError)"
            :aria-describedby="
              validationError ? 'prompt-help prompt-error' : 'prompt-help'
            "
            class="min-h-32 w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
          />
          <p id="prompt-help" class="text-xs text-slate-500">
            Maximum 4000 characters.
          </p>
          <p
            v-if="validationError"
            id="prompt-error"
            role="alert"
            class="text-sm text-red-700"
          >
            {{ validationError }}
          </p>
        </div>

        <button
          type="submit"
          class="inline-flex items-center justify-center rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
          :disabled="isLoading"
          :aria-busy="isLoading"
        >
          Send
        </button>
      </form>

      <section aria-live="polite" aria-atomic="true" class="grid gap-3">
        <div v-if="showOutputPanels" class="grid gap-4">
          <div
            data-testid="model-output-panels-grid"
            class="grid items-start gap-4 md:grid-cols-2"
          >
            <ModelOutputPanel
              v-for="panel in outputPanels"
              :key="panel.key"
              :label="panel.label"
              :heading="panel.heading"
              :status="panel.status"
              :data="panel.data"
              :error="panel.error"
            />
          </div>

          <ComparisonOutputPanel
            :is-waiting="isComparisonWaiting"
            :heading="comparisonPanelHeading"
            :has-outer-error="hasAnyOuterError"
            :error-text="comparisonErrorText"
            :generated-prompt-text="generatedModel3Prompt"
            :prompt-reset-key="comparisonPromptResetKey"
            :model3-status="model3RequestState.status"
            :model3-data="model3RequestState.data"
            :model3-error="model3RequestState.error"
            :is-model3-loading="isModel3Loading"
          />
        </div>
      </section>
    </main>

    <footer
      class="mx-auto flex w-full max-w-3xl items-center gap-4 pb-8 text-xs text-slate-500"
    >
      <a
        href="https://openai.com/policies/terms-of-use"
        target="_blank"
        rel="noreferrer"
        class="underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
      >
        OpenAI Terms
      </a>
      <a
        href="https://openai.com/policies/privacy-policy"
        target="_blank"
        rel="noreferrer"
        class="underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
      >
        OpenAI Privacy Policy
      </a>
    </footer>
  </div>
</template>
