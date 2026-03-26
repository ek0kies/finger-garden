import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import { GameEngine } from "../core/game/engine";
import { saveBestScore } from "../core/systems/storageSystem";
import type { GameSnapshot, InputStroke } from "../types/game";
import { useBestScore } from "./useBestScore";

export function useGameSession() {
  const canvasRef = ref<HTMLCanvasElement | null>(null);
  const snapshot = ref<GameSnapshot | null>(null);
  const { bestScore, refresh, update } = useBestScore();

  let engine: GameEngine | null = null;
  let unsubscribe: (() => void) | null = null;

  const handleResize = (): void => {
    if (!engine || !canvasRef.value) return;
    const width = canvasRef.value.clientWidth;
    const height = canvasRef.value.clientHeight;
    engine.resize(width, height, window.devicePixelRatio || 1);
  };

  const mountEngine = (): void => {
    if (!canvasRef.value || engine) return;

    refresh();
    engine = new GameEngine(canvasRef.value, bestScore.value);

    unsubscribe = engine.subscribe((next) => {
      snapshot.value = next;
      if (next.phase === "result" && next.runResult) {
        update(next.runResult.best);
        saveBestScore(next.runResult.best);
      }
    });

    engine.start();
    engine.startRun();
    handleResize();
  };

  const cleanup = (): void => {
    unsubscribe?.();
    unsubscribe = null;
    engine?.dispose();
    engine = null;
  };

  const togglePause = (): void => {
    if (!snapshot.value) return;
    if (snapshot.value.phase === "playing") {
      engine?.pause();
      return;
    }
    if (snapshot.value.phase === "paused") {
      engine?.resume();
    }
  };

  const restartRun = (): void => {
    engine?.restartRun();
  };

  const applyStroke = (stroke: InputStroke): void => {
    engine?.applyStroke(stroke);
  };

  const goLanding = (): void => {
    engine?.goLanding();
  };

  const phase = computed(() => snapshot.value?.phase ?? "boot");

  watch(canvasRef, () => {
    mountEngine();
  });

  onMounted(() => {
    mountEngine();
    window.addEventListener("resize", handleResize);
  });

  onUnmounted(() => {
    window.removeEventListener("resize", handleResize);
    cleanup();
  });

  return {
    canvasRef,
    snapshot,
    bestScore,
    phase,
    togglePause,
    restartRun,
    applyStroke,
    goLanding
  };
}
