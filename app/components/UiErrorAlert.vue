<script setup lang="ts">
import type { NormalizedUiError } from "../utils/error-normalization";

withDefaults(
  defineProps<{
    error: NormalizedUiError;
    showRetry?: boolean;
    retryLabel?: string;
    detailsToggleTestId?: string;
    retryButtonTestId?: string;
  }>(),
  {
    showRetry: false,
    retryLabel: "Try again",
    detailsToggleTestId: "error-details-toggle",
    retryButtonTestId: "error-retry-button",
  },
);

const emit = defineEmits<{
  retry: [];
}>();

function onRetry(): void {
  emit("retry");
}
</script>

<template>
  <div
    role="alert"
    class="grid gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-red-800"
  >
    <p class="text-sm font-semibold">Something went wrong</p>
    <p class="text-sm text-red-700">{{ error.message }}</p>

    <details :data-testid="detailsToggleTestId" class="text-xs text-red-700">
      <summary class="w-fit cursor-pointer text-sm font-medium underline">
        Error Details
      </summary>

      <dl class="mt-2 grid gap-1">
        <div class="grid grid-cols-[auto,1fr] gap-x-2">
          <dt class="font-semibold">Type</dt>
          <dd>{{ error.category }}</dd>
        </div>

        <div
          v-if="typeof error.statusCode === 'number'"
          class="grid grid-cols-[auto,1fr] gap-x-2"
        >
          <dt class="font-semibold">Status Code</dt>
          <dd>{{ error.statusCode }}</dd>
        </div>

        <div v-if="error.details" class="grid grid-cols-[auto,1fr] gap-x-2">
          <dt class="font-semibold">Details</dt>
          <dd>{{ error.details }}</dd>
        </div>
      </dl>
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
