import type { DifficultyProfile, GameSnapshot } from "../../types/game";
import { GAME_CONFIG } from "../../constants/game";
import { createObstacle } from "../entities/obstacle";
import { createPickup } from "../entities/pickup";

export interface SpawnState {
  nextX: number;
  nextGapAllowedX: number;
}

export function createSpawnState(startX: number): SpawnState {
  return {
    nextX: startX,
    nextGapAllowedX: startX
  };
}

function randomBetween(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

export function spawnAhead(
  snapshot: GameSnapshot,
  difficulty: DifficultyProfile,
  spawnState: SpawnState,
  createId: () => number
): void {
  const targetX = snapshot.player.x + snapshot.viewportWidth + GAME_CONFIG.spawnAhead;
  const floorY = snapshot.floorY;

  while (spawnState.nextX < targetX) {
    const spanX = spawnState.nextX;
    const inOpeningSafeZone = spanX < snapshot.runStartX + GAME_CONFIG.openingSafeDistance;
    const gapReady = spanX >= spawnState.nextGapAllowedX;
    const forceGap = spanX >= spawnState.nextGapAllowedX + difficulty.gapIntervalMax * 0.95;
    const shouldPlaceGap =
      !inOpeningSafeZone &&
      gapReady &&
      (forceGap || Math.random() < difficulty.gapChance);

    let postGapX = spanX + randomBetween(18, 40);

    if (shouldPlaceGap) {
      const gapWidth = randomBetween(difficulty.gapWidthMin, difficulty.gapWidthMax);
      snapshot.obstacles.push(
        createObstacle(
          createId(),
          "gap",
          spanX,
          floorY,
          gapWidth,
          snapshot.viewportHeight - floorY,
          false
        )
      );

      postGapX = spanX + gapWidth + randomBetween(22, 48);
      spawnState.nextGapAllowedX =
        postGapX + randomBetween(difficulty.gapIntervalMin, difficulty.gapIntervalMax);
    }

    if (Math.random() < difficulty.vineChance) {
      const vineHeight = randomBetween(56, 118);
      snapshot.obstacles.push(
        createObstacle(createId(), "vine", postGapX, floorY - vineHeight, randomBetween(16, 24), vineHeight, true)
      );
    }

    if (Math.random() < difficulty.sporeChance) {
      const cloudY = floorY - randomBetween(78, 170);
      snapshot.obstacles.push(
        createObstacle(createId(), "spore", postGapX + randomBetween(26, 82), cloudY, randomBetween(44, 68), randomBetween(34, 52), true)
      );
    }

    if (Math.random() < difficulty.pollenChance) {
      snapshot.pickups.push(
        createPickup(
          createId(),
          "pollen",
          postGapX + randomBetween(18, 90),
          floorY - randomBetween(70, 180),
          GAME_CONFIG.pollenValue,
          randomBetween(7, 9)
        )
      );
    }

    spawnState.nextX += randomBetween(difficulty.spawnSpacingMin, difficulty.spawnSpacingMax);
  }
}

export function cleanupBehind(snapshot: GameSnapshot): void {
  const leftBound = snapshot.cameraX - GAME_CONFIG.despawnBehind;
  snapshot.obstacles = snapshot.obstacles.filter((obstacle) => obstacle.x + obstacle.width >= leftBound);
  snapshot.pickups = snapshot.pickups.filter((pickup) => pickup.alive && pickup.x + pickup.radius >= leftBound);
}
