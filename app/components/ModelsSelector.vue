<script setup lang="ts">
import { computed } from "vue";
import type { OpenAIModel, RequestStatus } from "~~/types/api";
import { MODELS_FALLBACK_NOTE_TEXT } from "~~/shared/constants/models";
import { MODEL_SELECT_IDS } from "~~/shared/constants/model-selectors";
import type { NormalizedUiError } from "../utils/error-normalization";
import UiErrorAlert from "./UiErrorAlert.vue";
import ModelSelectField from "./ModelSelectField.vue";

const props = withDefaults(
  defineProps<{
    selectedModelIdModel1: string;
    selectedModelIdModel2: string;
    selectedModelIdModel3?: string;
    status: RequestStatus;
    models: ReadonlyArray<OpenAIModel> | null;
    error?: NormalizedUiError | null;
    showFallbackNote: boolean;
    required?: boolean;
    disabled?: boolean;
  }>(),
  {
    selectedModelIdModel3: "",
    error: null,
    required: true,
    disabled: false,
  },
);

const emit = defineEmits<{
  "update:selectedModelIdModel1": [value: string];
  "update:selectedModelIdModel2": [value: string];
  "update:selectedModelIdModel3": [value: string];
  retry: [];
}>();

const selectorDescribedBy = computed(() =>
  props.status === "error"
    ? "models-select-help models-select-error"
    : "models-select-help",
);
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

    <div v-else class="grid gap-3">
      <div class="grid gap-3 md:grid-cols-2">
        <ModelSelectField
          :id="MODEL_SELECT_IDS.model1"
          label="Model 1"
          :value="props.selectedModelIdModel1"
          :models="props.models"
          :status="props.status"
          :disabled="props.disabled"
          :required="props.required"
          :invalid="props.status === 'error'"
          :described-by="selectorDescribedBy"
          @change="emit('update:selectedModelIdModel1', $event)"
        />
        <ModelSelectField
          :id="MODEL_SELECT_IDS.model2"
          label="Model 2"
          :value="props.selectedModelIdModel2"
          :models="props.models"
          :status="props.status"
          :disabled="props.disabled"
          :required="props.required"
          :invalid="props.status === 'error'"
          :described-by="selectorDescribedBy"
          @change="emit('update:selectedModelIdModel2', $event)"
        />
      </div>

      <ModelSelectField
        :id="MODEL_SELECT_IDS.model3"
        label="Model 3 for comparing responses"
        :value="props.selectedModelIdModel3"
        :models="props.models"
        :status="props.status"
        :disabled="props.disabled"
        :required="props.required"
        :invalid="props.status === 'error'"
        :described-by="selectorDescribedBy"
        @change="emit('update:selectedModelIdModel3', $event)"
      />
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
