<template>
  <section class="hud">
    <div class="hud__row">
      <div class="hud__group">
        <p class="hud__label">距离</p>
        <strong class="hud__value">{{ distance }}m</strong>
      </div>
      <div class="hud__group">
        <p class="hud__label">花粉</p>
        <strong class="hud__value">{{ pollen }}</strong>
      </div>
      <div class="hud__group hud__group--score">
        <p class="hud__label">总分</p>
        <strong class="hud__value">{{ totalScore }}</strong>
      </div>
      <div class="hud__actions">
        <span class="hud__stage">{{ stageLabel }}</span>
        <button type="button" class="hud__button" @click="$emit('togglePause')">
          {{ pauseLabel }}
        </button>
      </div>
    </div>
    <EnergyBar :current="energyCurrent" :max="energyMax" />
  </section>
</template>

<script setup lang="ts">
import { computed } from "vue";
import EnergyBar from "./EnergyBar.vue";

const props = defineProps<{
  distance: number;
  pollen: number;
  totalScore: number;
  energyCurrent: number;
  energyMax: number;
  stageLabel: string;
  phase: "playing" | "paused" | "dying" | "result" | "landing" | "boot";
}>();

defineEmits<{
  togglePause: [];
}>();

const pauseLabel = computed(() => (props.phase === "paused" ? "继续" : "暂停"));
</script>
