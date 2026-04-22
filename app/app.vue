<script setup lang="ts">
import { computed, ref } from "vue";
import ModelsSelector from "./components/ModelsSelector.vue";
import UiErrorAlert from "./components/UiErrorAlert.vue";
import { useModelsState } from "./composables/use-models-state";
import { useRequestState } from "./composables/use-request-state";
import { normalizeUiError } from "./utils/error-normalization";
import { logNormalizedUiError } from "./utils/log-normalized-ui-error";
import { validatePrompt } from "./utils/prompt-validation";

const prompt = ref("");
const selectedModelId = ref("");
const validationError = ref<string | null>(null);
const promptRef = ref<HTMLTextAreaElement | null>(null);

const { state, start, succeed, fail } = useRequestState();
const { state: modelsState, fetchModels } = useModelsState();

const isLoading = computed(() => state.status === "loading");

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

  start();

  const body: { prompt: string; model?: string } = {
    prompt: promptResult.trimmedPrompt,
  };

  if (selectedModelId.value.trim()) {
    body.model = selectedModelId.value.trim();
  }

  try {
    const response = await fetch("/api/respond", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    let payload:
      | { response: string; model: string }
      | { message: string; details?: string }
      | undefined;

    try {
      payload = (await response.json()) as
        | { response: string; model: string }
        | { message: string; details?: string };
    } catch {
      payload = undefined;
    }

    if (!response.ok) {
      const normalized = normalizeUiError({
        ...(payload ?? {}),
        statusCode: response.status,
      });
      logNormalizedUiError("app.handleSubmit", normalized);
      fail(normalized.message, normalized.details);
      return;
    }

    const successPayload = payload as { response: string; model: string };
    succeed(successPayload.response);
  } catch (error) {
    const normalized = normalizeUiError(error);
    logNormalizedUiError("app.handleSubmit", normalized);
    fail(normalized.message, normalized.details);
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
          :selected-model-id="selectedModelId"
          :status="modelsState.status"
          :models="modelsState.data"
          :error="modelsState.error"
          :error-details="modelsState.errorDetails"
          :show-fallback-note="modelsState.showFallbackNote"
          :disabled="isLoading"
          @update:selected-model-id="selectedModelId = $event"
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
        <div
          v-if="state.status === 'loading'"
          role="status"
          aria-live="polite"
          class="inline-flex items-center gap-2 text-sm text-slate-700"
        >
          <span
            class="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-700"
          />
          <span>Waiting for response from ChatGPT...</span>
        </div>

        <article
          v-else-if="state.status === 'success' && state.data"
          class="grid gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-emerald-900 shadow-sm"
        >
          <h2 class="text-base font-semibold">Response</h2>
          <p class="whitespace-pre-wrap text-sm">{{ state.data }}</p>
        </article>

        <UiErrorAlert
          v-else-if="state.status === 'error' && state.error"
          :title="'Something went wrong'"
          :message="state.error"
          :details="state.errorDetails ?? undefined"
          :show-retry="false"
        />
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
