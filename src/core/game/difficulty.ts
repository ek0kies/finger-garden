import type { DifficultyProfile } from "../../types/game";

function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t;
}

export function getDifficulty(elapsed: number): DifficultyProfile {
  if (elapsed <= 10) {
    const t = elapsed / 10;
    return {
      speed: lerp(165, 198, t),
      gapWidthMin: 46,
      gapWidthMax: 72,
      gapChance: lerp(0.18, 0.28, t),
      gapIntervalMin: 260,
      gapIntervalMax: 360,
      spawnSpacingMin: 152,
      spawnSpacingMax: 226,
      vineChance: 0.02,
      sporeChance: 0,
      pollenChance: 0.36
    };
  }

  if (elapsed <= 25) {
    const t = (elapsed - 10) / 15;
    return {
      speed: lerp(198, 244, t),
      gapWidthMin: 56,
      gapWidthMax: 92,
      gapChance: lerp(0.32, 0.44, t),
      gapIntervalMin: 210,
      gapIntervalMax: 300,
      spawnSpacingMin: 132,
      spawnSpacingMax: 194,
      vineChance: lerp(0.18, 0.36, t),
      sporeChance: lerp(0.06, 0.2, t),
      pollenChance: 0.42
    };
  }

  const t = Math.min(1, (elapsed - 25) / 30);
  return {
    speed: lerp(244, 316, t),
    gapWidthMin: 68,
    gapWidthMax: 116,
    gapChance: lerp(0.52, 0.64, t),
    gapIntervalMin: 170,
    gapIntervalMax: 240,
    spawnSpacingMin: 108,
    spawnSpacingMax: 158,
    vineChance: lerp(0.36, 0.54, t),
    sporeChance: lerp(0.2, 0.42, t),
    pollenChance: lerp(0.46, 0.32, t)
  };
}
