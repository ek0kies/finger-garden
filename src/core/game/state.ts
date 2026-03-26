import { GAME_CONFIG } from "../../constants/game";
import type { GameSnapshot } from "../../types/game";
import { createPlayer } from "../entities/player";
import { createEnergyState } from "../systems/energySystem";
import { createScoreState } from "../systems/scoreSystem";

export function createInitialSnapshot(bestScore: number, width: number, height: number): GameSnapshot {
  const floorY = Math.round(height * GAME_CONFIG.floorRatio);
  const player = createPlayer(GAME_CONFIG.playerStartX, floorY - GAME_CONFIG.playerRadius, GAME_CONFIG.playerRadius);

  return {
    phase: "landing",
    elapsed: 0,
    cameraX: 0,
    runStartX: player.x,
    viewportWidth: width,
    viewportHeight: height,
    floorY,
    player,
    paths: [],
    obstacles: [],
    pickups: [],
    energy: createEnergyState(),
    score: createScoreState(bestScore),
    feedback: null,
    runResult: null,
    sporeDebuffTtl: 0,
    shieldPulseTtl: 0,
    deathBloomTtl: 0
  };
}

export function resetSnapshotForRun(snapshot: GameSnapshot): void {
  snapshot.elapsed = 0;
  snapshot.cameraX = 0;
  snapshot.runStartX = GAME_CONFIG.playerStartX;
  snapshot.player.x = GAME_CONFIG.playerStartX;
  snapshot.player.y = snapshot.floorY - snapshot.player.radius;
  snapshot.player.vx = 0;
  snapshot.player.vy = 0;
  snapshot.player.onGround = false;
  snapshot.player.alive = true;
  snapshot.player.shieldHits = 0;
  snapshot.paths = [];
  snapshot.obstacles = [];
  snapshot.pickups = [];
  snapshot.energy = createEnergyState();
  snapshot.score.distance = 0;
  snapshot.score.pollen = 0;
  snapshot.score.combo = 0;
  snapshot.score.noHitTime = 0;
  snapshot.score.nearMissCount = 0;
  snapshot.score.total = 0;
  snapshot.feedback = null;
  snapshot.runResult = null;
  snapshot.sporeDebuffTtl = 0;
  snapshot.shieldPulseTtl = 0;
  snapshot.deathBloomTtl = 0;
}
