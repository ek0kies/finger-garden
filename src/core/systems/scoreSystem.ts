import type { RunResult, ScoreState } from "../../types/game";

export function createScoreState(best: number): ScoreState {
  return {
    distance: 0,
    pollen: 0,
    combo: 0,
    best,
    noHitTime: 0,
    nearMissCount: 0,
    total: 0
  };
}

export function updateDistance(score: ScoreState, distance: number): void {
  score.distance = Math.max(score.distance, Math.floor(distance));
}

export function addPollen(score: ScoreState, amount = 1): void {
  score.pollen += amount;
  score.combo += 1;
}

export function registerSafeTime(score: ScoreState, dt: number): void {
  score.noHitTime += dt;
}

export function registerNearMiss(score: ScoreState): void {
  score.nearMissCount += 1;
}

export function registerHit(score: ScoreState): void {
  score.combo = 0;
  score.noHitTime = Math.max(0, score.noHitTime - 1.2);
}

export function recalculateTotal(score: ScoreState): void {
  const pollenScore = score.pollen * 32;
  const noHitBonus = Math.floor(score.noHitTime * 6);
  const nearMissBonus = score.nearMissCount * 18;
  score.total = score.distance + pollenScore + noHitBonus + nearMissBonus;
}

export function summarizeRun(score: ScoreState, isNewBest: boolean, best: number): RunResult {
  const pollenScore = score.pollen * 32;
  const noHitBonus = Math.floor(score.noHitTime * 6);
  const nearMissBonus = score.nearMissCount * 18;

  return {
    distance: score.distance,
    pollen: score.pollen,
    isNewBest,
    best,
    totalScore: score.total,
    pollenScore,
    noHitBonus,
    nearMissBonus
  };
}
