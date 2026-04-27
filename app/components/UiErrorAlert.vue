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
    class="grid min-w-0 max-w-full gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-red-800"
  >
    <p class="min-w-0 break-words text-sm font-semibold">
      Something went wrong
    </p>
    <p class="min-w-0 break-words text-sm text-red-700">{{ error.message }}</p>

    <details
      :data-testid="detailsToggleTestId"
      class="min-w-0 max-w-full text-xs text-red-700"
    >
      <summary
        class="max-w-full cursor-pointer break-words whitespace-normal text-sm font-medium underline"
      >
        Error Details
      </summary>

      <dl class="mt-2 grid min-w-0 max-w-full gap-1">
        <div
          v-if="error.type"
          class="grid min-w-0 grid-cols-[auto,minmax(0,1fr)] gap-x-2"
        >
          <dt class="break-words font-semibold">Type</dt>
          <dd class="min-w-0 break-words whitespace-pre-wrap">
            {{ error.type }}
          </dd>
        </div>

        <div
          v-if="typeof error.statusCode === 'number'"
          class="grid min-w-0 grid-cols-[auto,minmax(0,1fr)] gap-x-2"
        >
          <dt class="break-words font-semibold">Status Code</dt>
          <dd class="min-w-0 break-words whitespace-pre-wrap">
            {{ error.statusCode }}
          </dd>
        </div>

        <div
          v-if="error.code"
          class="grid min-w-0 grid-cols-[auto,minmax(0,1fr)] gap-x-2"
        >
          <dt class="break-words font-semibold">Error Code</dt>
          <dd class="min-w-0 break-words whitespace-pre-wrap">
            {{ error.code }}
          </dd>
        </div>

        <div
          v-if="error.param"
          class="grid min-w-0 grid-cols-[auto,minmax(0,1fr)] gap-x-2"
        >
          <dt class="break-words font-semibold">Param</dt>
          <dd class="min-w-0 break-words whitespace-pre-wrap">
            {{ error.param }}
          </dd>
        </div>

        <div
          v-if="error.details"
          class="grid min-w-0 grid-cols-[auto,minmax(0,1fr)] gap-x-2"
        >
          <dt class="break-words font-semibold">Details</dt>
          <dd class="min-w-0 break-words whitespace-pre-wrap">
            {{ error.details }}
          </dd>
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
