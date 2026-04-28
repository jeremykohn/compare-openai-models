<script setup lang="ts">
defineProps<{
  label: string;
  value: string | number;
}>();
</script>

<template>
  <div class="grid min-w-0 grid-cols-[auto,minmax(0,1fr)] gap-x-2">
    <dt class="break-words font-semibold">{{ label }}</dt>
    <dd class="min-w-0 break-words whitespace-pre-wrap">
      {{ value }}
    </dd>
  </div>
</template>
