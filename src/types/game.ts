export type GamePhase = "boot" | "landing" | "playing" | "paused" | "dying" | "result";

export interface Vec2 {
  x: number;
  y: number;
}

export interface StrokePoint extends Vec2 {
  t: number;
  cameraX: number;
}

export interface InputStroke {
  points: StrokePoint[];
  startedAt: number;
  endedAt: number;
  duration: number;
  length: number;
}

export interface Player {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  shieldHits: number;
  alive: boolean;
  onGround: boolean;
}

export interface PathSegment {
  id: number;
  points: Vec2[];
  ttl: number;
  maxTtl: number;
  strength: number;
  collisionWidth: number;
  decayStarted: boolean;
  decayStartX: number;
}

export type ObstacleType = "gap" | "vine" | "spore";

export interface Obstacle {
  id: number;
  type: ObstacleType;
  x: number;
  y: number;
  width: number;
  height: number;
  dangerous: boolean;
  active: boolean;
}

export type PickupType = "pollen";

export interface Pickup {
  id: number;
  type: PickupType;
  x: number;
  y: number;
  radius: number;
  value: number;
  alive: boolean;
}

export interface EnergyState {
  current: number;
  max: number;
  regenRate: number;
  regenDelay: number;
  regenCooldown: number;
}

export interface ScoreState {
  distance: number;
  pollen: number;
  combo: number;
  best: number;
  noHitTime: number;
  nearMissCount: number;
  total: number;
}

export interface RunResult {
  distance: number;
  pollen: number;
  isNewBest: boolean;
  best: number;
  totalScore: number;
  pollenScore: number;
  noHitBonus: number;
  nearMissBonus: number;
}

export interface FeedbackState {
  text: string;
  ttl: number;
  tone: "info" | "good" | "warn";
}

export interface GameSnapshot {
  phase: GamePhase;
  elapsed: number;
  cameraX: number;
  runStartX: number;
  viewportWidth: number;
  viewportHeight: number;
  floorY: number;
  player: Player;
  paths: PathSegment[];
  obstacles: Obstacle[];
  pickups: Pickup[];
  energy: EnergyState;
  score: ScoreState;
  feedback: FeedbackState | null;
  runResult: RunResult | null;
  sporeDebuffTtl: number;
  shieldPulseTtl: number;
  deathBloomTtl: number;
}

export interface DifficultyProfile {
  speed: number;
  gapWidthMin: number;
  gapWidthMax: number;
  gapChance: number;
  gapIntervalMin: number;
  gapIntervalMax: number;
  spawnSpacingMin: number;
  spawnSpacingMax: number;
  vineChance: number;
  sporeChance: number;
  pollenChance: number;
}
