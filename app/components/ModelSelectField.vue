<script setup lang="ts">
import type { OpenAIModel, RequestStatus } from "~~/types/api";

const props = withDefaults(
  defineProps<{
    id: string;
    label: string;
    value: string;
    models: ReadonlyArray<OpenAIModel> | null;
    status: RequestStatus;
    disabled?: boolean;
    required?: boolean;
    invalid?: boolean;
    describedBy: string;
  }>(),
  {
    disabled: false,
    required: true,
    invalid: false,
  },
);

const emit = defineEmits<{
  change: [value: string];
}>();

function onSelectChanged(event: Event): void {
  const target = event.target as HTMLSelectElement;
  emit("change", target.value);
}
</script>

<template>
  <div class="grid gap-2">
    <label class="text-sm font-semibold text-slate-700" :for="props.id">
      {{ props.required ? `${props.label} *` : props.label }}
    </label>
    <select
      :id="props.id"
      class="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
      :value="props.value"
      :disabled="
        props.disabled ||
        props.status === 'error' ||
        (props.status === 'success' &&
          (!props.models || props.models.length === 0))
      "
      :aria-required="props.required"
      :aria-invalid="props.invalid"
      :aria-describedby="props.describedBy"
      @change="onSelectChanged"
    >
      <option
        v-if="
          props.status === 'success' && props.models && props.models.length > 0
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
        :key="`${props.id}-${model.id}`"
        :value="model.id"
      >
        {{ model.id }}
      </option>
    </select>
  </div>
</template>
