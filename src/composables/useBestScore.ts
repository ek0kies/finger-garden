import { ref } from "vue";
import { loadBestScore, saveBestScore } from "../core/systems/storageSystem";

export function useBestScore() {
  const bestScore = ref(loadBestScore());

  const refresh = (): void => {
    bestScore.value = loadBestScore();
  };

  const update = (score: number): void => {
    const normalized = Math.max(0, Math.floor(score));
    if (normalized <= bestScore.value) return;
    bestScore.value = normalized;
    saveBestScore(normalized);
  };

  return {
    bestScore,
    refresh,
    update
  };
}
