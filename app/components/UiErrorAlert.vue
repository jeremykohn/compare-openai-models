<script setup lang="ts">
import { computed } from "vue";

const props = withDefaults(
  defineProps<{
    message: string;
    title?: string;
    details?: string;
    enableDetailsToggle?: boolean;
    showRetry?: boolean;
    retryLabel?: string;
    detailsToggleTestId?: string;
    retryButtonTestId?: string;
  }>(),
  {
    title: "Something went wrong",
    details: undefined,
    enableDetailsToggle: true,
    showRetry: false,
    retryLabel: "Try again",
    detailsToggleTestId: "error-details-toggle",
    retryButtonTestId: "error-retry-button",
  },
);

const emit = defineEmits<{
  retry: [];
}>();

const hasDetails = computed(() =>
  Boolean(props.details && props.details.trim().length > 0),
);
const canToggleDetails = computed(
  () => props.enableDetailsToggle && hasDetails.value,
);

function onRetry(): void {
  emit("retry");
}
</script>

<template>
  <div
    role="alert"
    class="grid gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-red-800"
  >
    <p class="text-sm font-semibold">{{ title }}</p>
    <p class="text-sm text-red-700">{{ message }}</p>

    <details
      v-if="canToggleDetails"
      :data-testid="detailsToggleTestId"
      class="group mt-1 w-fit text-sm"
    >
      <summary class="cursor-pointer font-medium underline">
        Show error details
      </summary>
      <p class="mt-2 whitespace-pre-wrap text-xs text-red-700">
        <span class="font-semibold">Details:</span>
        {{ details }}
      </p>
    </details>

    <button
      v-if="showRetry"
      :data-testid="retryButtonTestId"
      type="button"
      class="w-fit text-sm font-medium underline"
      @click="onRetry"
    >
      {{ retryLabel }}
    </button>
  </div>
</template>
