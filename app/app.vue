<script setup lang="ts">
import { computed, ref } from "vue";
import ModelsSelector from "./components/ModelsSelector.vue";
import ModelOutputPanel from "./components/ModelOutputPanel.vue";
import { useModelsState } from "./composables/use-models-state";
import { useModelQuery } from "./composables/use-model-query";
import { validatePrompt } from "./utils/prompt-validation";

const prompt = ref("");
const selectedModelIdModel1 = ref("");
const selectedModelIdModel2 = ref("");
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

const isLoading = computed(
  () =>
    model1RequestState.status === "loading" ||
    model2RequestState.status === "loading",
);

const showOutputPanels = computed(
  () =>
    model1RequestState.status === "loading" ||
    model2RequestState.status === "loading" ||
    model1RequestState.status === "success" ||
    model1RequestState.status === "error" ||
    model2RequestState.status === "success" ||
    model2RequestState.status === "error",
);

const model1OutputHeading = computed(
  () => `Response from Model 1 (${submittedModelIdModel1.value})`,
);

const model2OutputHeading = computed(
  () => `Response from Model 2 (${submittedModelIdModel2.value})`,
);

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

  await Promise.all([
    queryModel1(promptResult.trimmedPrompt, selectedModelIdModel1.value),
    queryModel2(promptResult.trimmedPrompt, selectedModelIdModel2.value),
  ]);
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
          :status="modelsState.status"
          :models="modelsState.data"
          :error="modelsState.error"
          :show-fallback-note="modelsState.showFallbackNote"
          :disabled="isLoading"
          @update:selected-model-id-model1="selectedModelIdModel1 = $event"
          @update:selected-model-id-model2="selectedModelIdModel2 = $event"
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
        <div v-if="showOutputPanels" class="grid gap-4 md:grid-cols-2">
          <ModelOutputPanel
            label="Model 1"
            :heading="model1OutputHeading"
            :status="model1RequestState.status"
            :data="model1RequestState.data"
            :error="model1RequestState.error"
          />
          <ModelOutputPanel
            label="Model 2"
            :heading="model2OutputHeading"
            :status="model2RequestState.status"
            :data="model2RequestState.data"
            :error="model2RequestState.error"
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
