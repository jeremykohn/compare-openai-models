<script setup lang="ts">
import type { OpenAIModel, RequestStatus } from "~~/types/api";
import { MODELS_FALLBACK_NOTE_TEXT } from "~~/shared/constants/models";
import type { NormalizedUiError } from "../utils/error-normalization";
import UiErrorAlert from "./UiErrorAlert.vue";

const props = withDefaults(
  defineProps<{
    selectedModelIdLeft: string;
    selectedModelIdRight: string;
    status: RequestStatus;
    models: ReadonlyArray<OpenAIModel> | null;
    error?: NormalizedUiError | null;
    showFallbackNote: boolean;
    required?: boolean;
    disabled?: boolean;
  }>(),
  {
    error: null,
    required: true,
    disabled: false,
  },
);

const emit = defineEmits<{
  "update:selectedModelIdLeft": [value: string];
  "update:selectedModelIdRight": [value: string];
  retry: [];
}>();

function onLeftSelectChanged(event: Event): void {
  const target = event.target as HTMLSelectElement;
  emit("update:selectedModelIdLeft", target.value);
}

function onRightSelectChanged(event: Event): void {
  const target = event.target as HTMLSelectElement;
  emit("update:selectedModelIdRight", target.value);
}
</script>

<template>
  <div class="grid gap-2">
    <div
      v-if="props.status === 'loading'"
      role="status"
      aria-live="polite"
      class="inline-flex items-center gap-2 text-sm text-slate-600"
    >
      <span
        class="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600"
      />
      <span>Loading models...</span>
    </div>

    <div v-else class="grid gap-3 md:grid-cols-2">
      <div class="grid gap-2">
        <label class="text-sm font-semibold text-slate-700" for="models-select">
          Model 1 *
        </label>
        <select
          id="models-select"
          class="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
          :value="props.selectedModelIdLeft"
          :disabled="
            props.disabled ||
            props.status === 'error' ||
            (props.status === 'success' &&
              (!props.models || props.models.length === 0))
          "
          :aria-required="props.required"
          :aria-invalid="props.status === 'error'"
          :aria-describedby="
            props.status === 'error'
              ? 'models-select-help models-select-error'
              : 'models-select-help'
          "
          @change="onLeftSelectChanged"
        >
          <option
            v-if="
              props.status === 'success' &&
              props.models &&
              props.models.length > 0
            "
            value=""
          >
            Select a model
          </option>
          <option v-else-if="props.status === 'success'" value="">
            No models available
          </option>
          <option
            v-for="model in props.models ?? []"
            :key="model.id"
            :value="model.id"
          >
            {{ model.id }}
          </option>
        </select>
      </div>

      <div class="grid gap-2">
        <label
          class="text-sm font-semibold text-slate-700"
          for="models-select-right"
        >
          Model 2 *
        </label>
        <select
          id="models-select-right"
          class="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
          :value="props.selectedModelIdRight"
          :disabled="
            props.disabled ||
            props.status === 'error' ||
            (props.status === 'success' &&
              (!props.models || props.models.length === 0))
          "
          :aria-required="props.required"
          :aria-invalid="props.status === 'error'"
          :aria-describedby="
            props.status === 'error'
              ? 'models-select-help models-select-error'
              : 'models-select-help'
          "
          @change="onRightSelectChanged"
        >
          <option
            v-if="
              props.status === 'success' &&
              props.models &&
              props.models.length > 0
            "
            value=""
          >
            Select a model
          </option>
          <option v-else-if="props.status === 'success'" value="">
            No models available
          </option>
          <option
            v-for="model in props.models ?? []"
            :key="`right-${model.id}`"
            :value="model.id"
          >
            {{ model.id }}
          </option>
        </select>
      </div>
    </div>

    <p
      v-if="props.status !== 'loading'"
      id="models-select-help"
      class="text-xs text-slate-500"
    >
      Uses gpt-4.1-mini by default if none is selected.
    </p>

    <p
      v-if="props.status !== 'loading' && props.showFallbackNote"
      class="text-xs text-slate-600"
    >
      {{ MODELS_FALLBACK_NOTE_TEXT }}
    </p>

    <div v-if="props.status === 'error'" id="models-select-error">
      <UiErrorAlert
        :error="
          props.error ?? {
            category: 'unknown',
            message: 'Unable to load models.',
          }
        "
        :show-retry="true"
        @retry="emit('retry')"
      />
    </div>
  </div>
</template>
