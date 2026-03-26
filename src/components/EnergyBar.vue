<template>
  <div class="energy" role="meter" :aria-valuenow="Math.round(current)" :aria-valuemin="0" :aria-valuemax="Math.round(max)">
    <div class="energy__track">
      <div class="energy__fill" :style="fillStyle" />
    </div>
    <span class="energy__label">{{ Math.round(current) }} / {{ Math.round(max) }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  current: number;
  max: number;
}>();

const fillStyle = computed(() => {
  const value = Math.max(0, Math.min(100, (props.current / Math.max(1, props.max)) * 100));
  return {
    width: `${value}%`
  };
});
</script>
