<template>
  <main class="game-page">
    <section class="stage-shell">
      <canvas
        ref="canvasRef"
        class="game-canvas"
        @pointerdown="onPointerDown"
        @pointermove="onPointerMove"
        @pointerup="onPointerUp"
        @pointerleave="onPointerCancel"
        @pointercancel="onPointerCancel"
      />

      <svg v-if="drawing && previewPath" class="stroke-preview" :viewBox="previewViewBox" preserveAspectRatio="none">
        <polyline :points="previewPath" />
      </svg>

      <GameHud
        v-if="snapshot"
        :distance="snapshot.score.distance"
        :pollen="snapshot.score.pollen"
        :total-score="snapshot.score.total"
        :energy-current="snapshot.energy.current"
        :energy-max="snapshot.energy.max"
        :stage-label="stageLabel"
        :phase="phase"
        @toggle-pause="togglePause"
      />

      <div v-if="phase === 'paused'" class="stage-overlay">
        <p>已暂停</p>
      </div>

      <div v-if="phase === 'dying'" class="stage-dying">
        花粉散落中...
      </div>

      <ResultPanel
        v-if="snapshot?.runResult && phase === 'result'"
        :result="snapshot.runResult"
        @restart="restartRun"
        @home="backHome"
      />

      <div class="touch-tip" v-if="phase === 'playing' && !drawing">划线搭桥 · 画圈开盾</div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRouter } from "vue-router";
import GameHud from "../components/GameHud.vue";
import ResultPanel from "../components/ResultPanel.vue";
import { useGameSession } from "../composables/useGameSession";
import { useGestureInput } from "../composables/useGestureInput";

const router = useRouter();
const { canvasRef, snapshot, phase, applyStroke, togglePause, restartRun, goLanding } = useGameSession();

const {
  drawing,
  previewPoints,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPointerCancel
} = useGestureInput(
  (stroke) => {
    if (phase.value === "playing") {
      applyStroke(stroke);
    }
  },
  () => phase.value === "playing",
  () => snapshot.value?.cameraX ?? 0
);

const previewPath = computed(() => {
  if (previewPoints.value.length < 2) return "";
  return previewPoints.value.map((point) => `${point.x},${point.y}`).join(" ");
});

const previewViewBox = computed(() => {
  const width = snapshot.value?.viewportWidth ?? 390;
  const height = snapshot.value?.viewportHeight ?? 760;
  return `0 0 ${width} ${height}`;
});

const stageLabel = computed(() => {
  const elapsed = snapshot.value?.elapsed ?? 0;
  if (elapsed < 10) return "暖场";
  if (elapsed < 25) return "进阶";
  return "狂潮";
});

const backHome = async (): Promise<void> => {
  goLanding();
  await router.push("/");
};
</script>
