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
const selectedModelIdLeft = ref("");
const selectedModelIdRight = ref("");
const submittedModelIdLeft = ref(DEFAULT_MODEL);
const submittedModelIdRight = ref(DEFAULT_MODEL);
const validationError = ref<string | null>(null);
const promptRef = ref<HTMLTextAreaElement | null>(null);

const {
  state: leftRequestState,
  start: startLeftRequest,
  succeed: succeedLeftRequest,
  fail: failLeftRequest,
} = useRequestState();
const {
  state: rightRequestState,
  start: startRightRequest,
  succeed: succeedRightRequest,
  fail: failRightRequest,
} = useRequestState();
const { state: modelsState, fetchModels } = useModelsState();

const isLoading = computed(
  () =>
    leftRequestState.status === "loading" ||
    rightRequestState.status === "loading",
);

const showOutputPanels = computed(
  () =>
    leftRequestState.status === "loading" ||
    rightRequestState.status === "loading" ||
    leftRequestState.status === "success" ||
    leftRequestState.status === "error" ||
    rightRequestState.status === "success" ||
    rightRequestState.status === "error",
);

const leftOutputHeading = computed(
  () => `Response from Model 1 (${submittedModelIdLeft.value})`,
);

const rightOutputHeading = computed(
  () => `Response from Model 2 (${submittedModelIdRight.value})`,
);

async function runSingleQuery(
  promptText: string,
  modelId: string,
  side: "left" | "right",
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
      logNormalizedUiError(`app.handleSubmit.${side}`, normalized);
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
    logNormalizedUiError(`app.handleSubmit.${side}`, normalized);
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

  startLeftRequest();
  startRightRequest();

  submittedModelIdLeft.value =
    selectedModelIdLeft.value.trim() || DEFAULT_MODEL;
  submittedModelIdRight.value =
    selectedModelIdRight.value.trim() || DEFAULT_MODEL;

  const leftPromise = runSingleQuery(
    promptResult.trimmedPrompt,
    selectedModelIdLeft.value,
    "left",
  ).then((leftResult) => {
    if (leftResult.ok) {
      submittedModelIdLeft.value = leftResult.model;
      succeedLeftRequest(leftResult.response);
      return;
    }

    failLeftRequest(leftResult.error);
  });

  const rightPromise = runSingleQuery(
    promptResult.trimmedPrompt,
    selectedModelIdRight.value,
    "right",
  ).then((rightResult) => {
    if (rightResult.ok) {
      submittedModelIdRight.value = rightResult.model;
      succeedRightRequest(rightResult.response);
      return;
    }

    failRightRequest(rightResult.error);
  });

  await Promise.all([leftPromise, rightPromise]);
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
          :selected-model-id-left="selectedModelIdLeft"
          :selected-model-id-right="selectedModelIdRight"
          :status="modelsState.status"
          :models="modelsState.data"
          :error="modelsState.error"
          :show-fallback-note="modelsState.showFallbackNote"
          :disabled="isLoading"
          @update:selected-model-id-left="selectedModelIdLeft = $event"
          @update:selected-model-id-right="selectedModelIdRight = $event"
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
              leftRequestState.status === 'error'
                ? 'border border-red-200 bg-red-50'
                : leftRequestState.status === 'success'
                  ? 'border border-emerald-200 bg-emerald-50 p-6 text-emerald-900'
                  : 'border border-slate-200 bg-white'
            "
          >
            <h2
              class="text-base font-semibold"
              :class="
                leftRequestState.status === 'error'
                  ? 'text-red-900'
                  : leftRequestState.status === 'success'
                    ? 'text-emerald-900'
                    : 'text-slate-900'
              "
            >
              {{ leftOutputHeading }}
            </h2>
            <div
              v-if="leftRequestState.status === 'loading'"
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
                leftRequestState.status === 'success' && leftRequestState.data
              "
              class="whitespace-pre-wrap text-sm"
            >
              {{ leftRequestState.data }}
            </p>
            <UiErrorAlert
              v-else-if="
                leftRequestState.status === 'error' && leftRequestState.error
              "
              :error="leftRequestState.error"
              :show-retry="false"
            />
          </article>

          <article
            class="grid gap-3 rounded-2xl p-4 shadow-sm"
            :class="
              rightRequestState.status === 'error'
                ? 'border border-red-200 bg-red-50'
                : rightRequestState.status === 'success'
                  ? 'border border-emerald-200 bg-emerald-50 p-6 text-emerald-900'
                  : 'border border-slate-200 bg-white'
            "
          >
            <h2
              class="text-base font-semibold"
              :class="
                rightRequestState.status === 'error'
                  ? 'text-red-900'
                  : rightRequestState.status === 'success'
                    ? 'text-emerald-900'
                    : 'text-slate-900'
              "
            >
              {{ rightOutputHeading }}
            </h2>
            <div
              v-if="rightRequestState.status === 'loading'"
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
                rightRequestState.status === 'success' && rightRequestState.data
              "
              class="whitespace-pre-wrap text-sm"
            >
              {{ rightRequestState.data }}
            </p>
            <UiErrorAlert
              v-else-if="
                rightRequestState.status === 'error' && rightRequestState.error
              "
              :error="rightRequestState.error"
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
