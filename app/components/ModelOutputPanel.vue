<script setup lang="ts">
import type { RequestStatus } from "~~/types/api";
import type { NormalizedUiError } from "../utils/error-normalization";
import UiErrorAlert from "./UiErrorAlert.vue";

defineProps<{
  label: string;
  heading: string;
  status: RequestStatus;
  data: string | null;
  error: NormalizedUiError | null;
}>();
</script>

<template>
  <article
    class="grid gap-3 rounded-2xl p-4 shadow-sm"
    :class="
      status === 'error'
        ? 'border border-red-200 bg-red-50'
        : status === 'success'
          ? 'border border-emerald-200 bg-emerald-50 p-6 text-emerald-900'
          : 'border border-slate-200 bg-white'
    "
  >
    <h2
      class="text-base font-semibold"
      :class="
        status === 'error'
          ? 'text-red-900'
          : status === 'success'
            ? 'text-emerald-900'
            : 'text-slate-900'
      "
    >
      {{ heading }}
    </h2>
    <div
      v-if="status === 'loading'"
      role="status"
      aria-live="polite"
      class="inline-flex items-center gap-2 text-sm text-slate-700"
    >
      <span
        class="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-700"
      />
      <span>Waiting for {{ label }} response...</span>
    </div>
    <p
      v-else-if="status === 'success' && data"
      class="whitespace-pre-wrap text-sm"
    >
      {{ data }}
    </p>
    <UiErrorAlert
      v-else-if="status === 'error' && error"
      :error="error"
      :show-retry="false"
    />
  </article>
</template>
