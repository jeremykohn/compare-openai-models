<script setup lang="ts">
defineProps<{
  isWaiting: boolean;
  heading: string;
  hasOuterError: boolean;
  hasBothOuterSuccess: boolean;
  errorText: string;
  placeholderText: string;
}>();
</script>

<template>
  <article
    data-testid="comparison-output-panel"
    class="min-w-0 max-w-full overflow-x-hidden rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm"
  >
    <div
      v-if="isWaiting"
      data-testid="comparison-output-waiting"
      role="status"
      aria-live="polite"
      class="inline-flex items-center gap-2 text-sm text-slate-600"
    >
      <span
        aria-hidden="true"
        class="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-500"
      />
      <span>Waiting for Model 1 and Model 2 responses...</span>
    </div>
    <div v-else class="grid gap-2">
      <h2
        data-testid="comparison-output-heading"
        class="text-base font-semibold text-slate-800"
      >
        {{ heading }}
      </h2>
      <p
        v-if="hasOuterError"
        class="text-sm text-red-700"
        data-testid="comparison-output-error"
      >
        {{ errorText }}
      </p>
      <p
        v-else-if="hasBothOuterSuccess"
        class="text-sm italic text-slate-600"
        data-testid="comparison-output-placeholder"
      >
        {{ placeholderText }}
      </p>
    </div>
  </article>
</template>
