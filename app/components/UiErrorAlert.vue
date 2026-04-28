<script setup lang="ts">
import { computed } from "vue";
import type { NormalizedUiError } from "../utils/error-normalization";
import UiErrorDetailRow from "./UiErrorDetailRow.vue";

const props = withDefaults(
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

const detailRows = computed(() => {
  const rows: Array<{ label: string; value: string | number }> = [];

  if (props.error.type) {
    rows.push({ label: "Type", value: props.error.type });
  }

  if (typeof props.error.statusCode === "number") {
    rows.push({ label: "Status Code", value: props.error.statusCode });
  }

  if (props.error.code) {
    rows.push({ label: "Error Code", value: props.error.code });
  }

  if (props.error.param) {
    rows.push({ label: "Param", value: props.error.param });
  }

  if (props.error.details) {
    rows.push({ label: "Details", value: props.error.details });
  }

  return rows;
});
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
        <UiErrorDetailRow
          v-for="(row, index) in detailRows"
          :key="`${row.label}-${index}`"
          :label="row.label"
          :value="row.value"
        />
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
