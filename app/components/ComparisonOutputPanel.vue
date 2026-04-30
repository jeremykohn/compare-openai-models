<script setup lang="ts">
import { computed, ref, watch } from "vue";

const props = defineProps<{
  isWaiting: boolean;
  heading: string;
  hasOuterError: boolean;
  errorText: string;
  generatedPromptText: string | null;
  promptResetKey: number;
}>();

const isPromptVisible = ref(false);
const promptRegionId = "comparison-model-3-prompt";

const isPromptToggleDisabled = computed(() => !props.generatedPromptText);

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
    <button
      type="button"
      data-testid="comparison-model3-prompt-toggle"
      class="mt-2 inline-flex items-center justify-center self-start rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-500"
      :aria-expanded="isPromptVisible"
      :aria-controls="promptRegionId"
      :disabled="isPromptToggleDisabled"
      @click="togglePromptVisibility"
    >
      Comparison prompt for Model 3
    </button>
    <pre
      v-if="isPromptVisible && generatedPromptText"
      :id="promptRegionId"
      data-testid="comparison-model3-generated-prompt"
      class="mt-3 max-w-full overflow-x-auto rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm whitespace-pre-wrap text-slate-900"
      >{{ generatedPromptText }}</pre
    >
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
      <p
        v-if="hasOuterError"
        class="text-sm text-red-700"
        data-testid="comparison-output-error"
      >
        {{ errorText }}
      </p>
    </div>
  </article>
</template>
