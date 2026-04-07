<script setup lang="ts">
import { computed, ref } from "vue";

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

const showDetails = ref(false);
const hasDetails = computed(() =>
  Boolean(props.details && props.details.trim().length > 0),
);
const canToggleDetails = computed(
  () => props.enableDetailsToggle && hasDetails.value,
);

function onToggleDetails(): void {
  showDetails.value = !showDetails.value;
}

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

    <button
      v-if="canToggleDetails"
      :data-testid="detailsToggleTestId"
      type="button"
      class="w-fit text-sm font-medium underline"
      :aria-expanded="showDetails"
      @click="onToggleDetails"
    >
      {{ showDetails ? "Hide details" : "Show details" }}
    </button>

    <p v-if="canToggleDetails && showDetails" class="text-xs text-red-700">
      <span class="font-semibold">Details:</span> {{ details }}
    </p>

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
