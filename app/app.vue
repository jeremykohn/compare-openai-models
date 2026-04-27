<script setup lang="ts">
import { computed, ref } from "vue";
import { DEFAULT_MODEL } from "~~/shared/constants/models";
import ModelsSelector from "./components/ModelsSelector.vue";
import UiErrorAlert from "./components/UiErrorAlert.vue";
import { useModelsState } from "./composables/use-models-state";
import { useRequestState } from "./composables/use-request-state";
import { normalizeUiError } from "./utils/error-normalization";
import type { NormalizedUiError } from "./utils/error-normalization";
import { logNormalizedUiError } from "./utils/log-normalized-ui-error";
import { isRespondSuccessPayload } from "./utils/type-guards";
import { validatePrompt } from "./utils/prompt-validation";

const prompt = ref("");
const selectedModelIdModel1 = ref("");
const selectedModelIdModel2 = ref("");
const submittedModelIdModel1 = ref(DEFAULT_MODEL);
const submittedModelIdModel2 = ref(DEFAULT_MODEL);
const validationError = ref<string | null>(null);
const promptRef = ref<HTMLTextAreaElement | null>(null);

const {
  state: model1RequestState,
  start: startModel1Request,
  succeed: succeedModel1Request,
  fail: failModel1Request,
} = useRequestState();
const {
  state: model2RequestState,
  start: startModel2Request,
  succeed: succeedModel2Request,
  fail: failModel2Request,
} = useRequestState();
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

async function runSingleQuery(
  promptText: string,
  modelId: string,
  modelRole: "model1" | "model2",
): Promise<
  | { ok: true; response: string; model: string }
  | { ok: false; error: NormalizedUiError }
> {
  const body: { prompt: string; model?: string } = {
    prompt: promptText,
  };

  if (modelId.trim()) {
    body.model = modelId.trim();
  }

  try {
    const response = await fetch("/api/respond", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    let payload: unknown;

    try {
      payload = await response.json();
    } catch {
      payload = {
        statusCode: response.status,
        statusText: response.statusText,
      };
    }

    const payloadObject =
      payload !== null && typeof payload === "object" && !Array.isArray(payload)
        ? (payload as Record<string, unknown>)
        : {};

    const normalizedInput = {
      ...payloadObject,
      statusCode: response.status,
      statusText: response.statusText,
    };

    if (!response.ok || !isRespondSuccessPayload(normalizedInput)) {
      const normalized = normalizeUiError(normalizedInput);
      logNormalizedUiError(`app.handleSubmit.${modelRole}`, normalized);
      return {
        ok: false,
        error: normalized,
      };
    }

    return {
      ok: true,
      response: normalizedInput.response,
      model: normalizedInput.model,
    };
  } catch (error) {
    const normalized = normalizeUiError(error);
    logNormalizedUiError(`app.handleSubmit.${modelRole}`, normalized);
    return {
      ok: false,
      error: normalized,
    };
  }
}

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

  startModel1Request();
  startModel2Request();

  submittedModelIdModel1.value =
    selectedModelIdModel1.value.trim() || DEFAULT_MODEL;
  submittedModelIdModel2.value =
    selectedModelIdModel2.value.trim() || DEFAULT_MODEL;

  const model1Promise = runSingleQuery(
    promptResult.trimmedPrompt,
    selectedModelIdModel1.value,
    "model1",
  ).then((model1Result) => {
    if (model1Result.ok) {
      submittedModelIdModel1.value = model1Result.model;
      succeedModel1Request(model1Result.response);
      return;
    }

    failModel1Request(model1Result.error);
  });

  const model2Promise = runSingleQuery(
    promptResult.trimmedPrompt,
    selectedModelIdModel2.value,
    "model2",
  ).then((model2Result) => {
    if (model2Result.ok) {
      submittedModelIdModel2.value = model2Result.model;
      succeedModel2Request(model2Result.response);
      return;
    }

    failModel2Request(model2Result.error);
  });

  await Promise.all([model1Promise, model2Promise]);
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
          <article
            class="grid gap-3 rounded-2xl p-4 shadow-sm"
            :class="
              model1RequestState.status === 'error'
                ? 'border border-red-200 bg-red-50'
                : model1RequestState.status === 'success'
                  ? 'border border-emerald-200 bg-emerald-50 p-6 text-emerald-900'
                  : 'border border-slate-200 bg-white'
            "
          >
            <h2
              class="text-base font-semibold"
              :class="
                model1RequestState.status === 'error'
                  ? 'text-red-900'
                  : model1RequestState.status === 'success'
                    ? 'text-emerald-900'
                    : 'text-slate-900'
              "
            >
              {{ model1OutputHeading }}
            </h2>
            <div
              v-if="model1RequestState.status === 'loading'"
              role="status"
              aria-live="polite"
              class="inline-flex items-center gap-2 text-sm text-slate-700"
            >
              <span
                class="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-700"
              />
              <span>Waiting for Model 1 response...</span>
            </div>
            <p
              v-else-if="
                model1RequestState.status === 'success' && model1RequestState.data
              "
              class="whitespace-pre-wrap text-sm"
            >
              {{ model1RequestState.data }}
            </p>
            <UiErrorAlert
              v-else-if="
                model1RequestState.status === 'error' && model1RequestState.error
              "
              :error="model1RequestState.error"
              :show-retry="false"
            />
          </article>

          <article
            class="grid gap-3 rounded-2xl p-4 shadow-sm"
            :class="
              model2RequestState.status === 'error'
                ? 'border border-red-200 bg-red-50'
                : model2RequestState.status === 'success'
                  ? 'border border-emerald-200 bg-emerald-50 p-6 text-emerald-900'
                  : 'border border-slate-200 bg-white'
            "
          >
            <h2
              class="text-base font-semibold"
              :class="
                model2RequestState.status === 'error'
                  ? 'text-red-900'
                  : model2RequestState.status === 'success'
                    ? 'text-emerald-900'
                    : 'text-slate-900'
              "
            >
              {{ model2OutputHeading }}
            </h2>
            <div
              v-if="model2RequestState.status === 'loading'"
              role="status"
              aria-live="polite"
              class="inline-flex items-center gap-2 text-sm text-slate-700"
            >
              <span
                class="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-700"
              />
              <span>Waiting for Model 2 response...</span>
            </div>
            <p
              v-else-if="
                model2RequestState.status === 'success' && model2RequestState.data
              "
              class="whitespace-pre-wrap text-sm"
            >
              {{ model2RequestState.data }}
            </p>
            <UiErrorAlert
              v-else-if="
                model2RequestState.status === 'error' && model2RequestState.error
              "
              :error="model2RequestState.error"
              :show-retry="false"
            />
          </article>
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
