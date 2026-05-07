<script setup lang="ts">
import { computed, ref, watch } from "vue";
import type { RequestStatus } from "~~/types/api";
import MarkdownRenderer from "./MarkdownRenderer.vue";
import { parseMarkdownSafe } from "../utils/parse-markdown-safe";
import type { NormalizedUiError } from "../utils/error-normalization";
import UiErrorAlert from "./UiErrorAlert.vue";

const props = defineProps<{
  isWaiting: boolean;
  heading: string;
  hasOuterError: boolean;
  errorText: string;
  generatedPromptText: string | null;
  promptResetKey: number;
  model3Status: RequestStatus;
  model3Data: string | null;
  model3Error: NormalizedUiError | null;
  isModel3Loading: boolean;
}>();

const isPromptVisible = ref(false);
const promptRegionId = "comparison-model-3-prompt";

const isPromptToggleDisabled = computed(
  () => !props.generatedPromptText || props.model3Status !== "success",
);

const renderedModel3Nodes = computed(() => {
  if (props.model3Status !== "success" || !props.model3Data) {
    return [];
  }

  return parseMarkdownSafe(props.model3Data);
});

watch(
  () => props.promptResetKey,
  () => {
    isPromptVisible.value = false;
  },
);

watch(
  () => props.generatedPromptText,
  (value) => {
    if (!value) {
      isPromptVisible.value = false;
    }
  },
);

function togglePromptVisibility(): void {
  if (isPromptToggleDisabled.value) {
    return;
  }

  isPromptVisible.value = !isPromptVisible.value;
}
</script>

<template>
  <article
    data-testid="comparison-output-panel"
    class="grid min-w-0 max-w-full gap-3 overflow-x-hidden rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-sm"
  >
    <h2
      data-testid="comparison-output-heading"
      class="text-base font-semibold text-slate-800"
    >
      {{ heading }}
    </h2>
    <div
      v-if="isWaiting"
      data-testid="comparison-output-waiting"
      role="status"
      aria-live="polite"
      class="mt-3 inline-flex items-center gap-2 text-sm text-slate-600"
    >
      <span
        aria-hidden="true"
        class="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-500"
      />
      <span>Waiting for Model 1 and Model 2 responses...</span>
    </div>
    <div v-else class="mt-3 grid gap-2">
      <div
        v-if="isModel3Loading"
        data-testid="comparison-model3-loading"
        role="status"
        aria-live="polite"
        class="inline-flex items-center gap-2 text-sm text-slate-600"
      >
        <span
          aria-hidden="true"
          class="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-500"
        />
        <span>Waiting for Model 3 response...</span>
      </div>
      <div
        v-else-if="model3Status === 'success' && model3Data"
        data-testid="comparison-model3-response"
        class="prose prose-sm max-w-none min-w-0 break-words text-slate-900 prose-headings:break-words prose-p:text-slate-900 prose-li:text-slate-900 prose-strong:text-slate-900 prose-code:break-words prose-code:text-slate-900 prose-pre:overflow-x-auto prose-pre:break-words prose-pre:bg-slate-900 prose-pre:text-slate-100"
      >
        <MarkdownRenderer :nodes="renderedModel3Nodes" />
      </div>
      <UiErrorAlert
        v-else-if="model3Status === 'error' && model3Error"
        data-testid="comparison-model3-error"
        :error="model3Error"
        :show-retry="false"
        details-toggle-test-id="comparison-model3-error-details-toggle"
      />
      <p
        v-else-if="hasOuterError"
        class="text-sm text-red-700"
        data-testid="comparison-output-error"
      >
        {{ errorText }}
      </p>
    </div>
    <button
      v-if="!isPromptToggleDisabled"
      type="button"
      data-testid="comparison-model3-prompt-toggle"
      class="mt-2 inline-flex items-center justify-center self-start rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
      :aria-expanded="isPromptVisible"
      :aria-controls="promptRegionId"
      @click="togglePromptVisibility"
    >
      View the prompt sent to Model 3 for comparing Response 1 and Response 2
    </button>
    <pre
      v-if="isPromptVisible && generatedPromptText"
      :id="promptRegionId"
      data-testid="comparison-model3-generated-prompt"
      class="mt-3 max-w-full overflow-x-auto rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm whitespace-pre-wrap text-slate-900"
      >{{ generatedPromptText }}</pre
    >
  </article>
</template>
