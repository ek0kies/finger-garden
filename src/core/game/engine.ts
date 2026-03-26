import { GAME_CONFIG } from "../../constants/game";
import type {
  FeedbackState,
  GamePhase,
  GameSnapshot,
  InputStroke,
  StrokePoint
} from "../../types/game";
import { createPathSegment } from "../entities/path";
import { recognizeGesture } from "../gestures/recognizer";
import {
  getStrokeLength,
  sampleStroke,
  trimStrokeByLength
} from "../gestures/strokeSampler";
import { renderFrame } from "../render/renderer";
import { regenerateEnergy, restoreEnergy, spendEnergy } from "../systems/energySystem";
import {
  addPollen,
  recalculateTotal,
  registerHit,
  registerNearMiss,
  registerSafeTime,
  summarizeRun,
  updateDistance
} from "../systems/scoreSystem";
import {
  detectSporeContact,
  detectVineHit,
  collectPollen,
  getGapAtX,
  resolvePathSupport
} from "./collision";
import { getDifficulty } from "./difficulty";
import { GameLoop } from "./loop";
import { cleanupBehind, createSpawnState, spawnAhead, type SpawnState } from "./spawner";
import { createInitialSnapshot, resetSnapshotForRun } from "./state";

export type SnapshotListener = (snapshot: GameSnapshot) => void;

export class GameEngine {
  private readonly ctx: CanvasRenderingContext2D;
  private readonly loop: GameLoop;
  private readonly listeners = new Set<SnapshotListener>();
  private snapshot: GameSnapshot;
  private spawnState: SpawnState;
  private idCounter = 1;
  private dyingTimer = 0;
  private sporeTouchCooldown = 0;

  constructor(private readonly canvas: HTMLCanvasElement, bestScore: number) {
    const context = this.canvas.getContext("2d", { alpha: false });
    if (!context) {
      throw new Error("无法创建 Canvas 2D 上下文");
    }

    this.ctx = context;
    const width = Math.max(1, this.canvas.clientWidth || 390);
    const height = Math.max(1, this.canvas.clientHeight || 760);

    this.snapshot = createInitialSnapshot(bestScore, width, height);
    this.spawnState = createSpawnState(this.snapshot.player.x + 120);

    this.loop = new GameLoop({
      onUpdate: (dt) => this.update(dt),
      onRender: () => this.render()
    });

    this.resize(width, height, window.devicePixelRatio || 1);
  }

  start(): void {
    this.loop.start();
    this.setPhase("landing");
    this.notify();
  }

  dispose(): void {
    this.loop.stop();
    this.listeners.clear();
  }

  subscribe(listener: SnapshotListener): () => void {
    this.listeners.add(listener);
    listener(this.cloneSnapshot());
    return () => {
      this.listeners.delete(listener);
    };
  }

  resize(width: number, height: number, dpr = window.devicePixelRatio || 1): void {
    const safeWidth = Math.max(1, Math.floor(width));
    const safeHeight = Math.max(1, Math.floor(height));

    this.canvas.width = Math.floor(safeWidth * dpr);
    this.canvas.height = Math.floor(safeHeight * dpr);
    this.canvas.style.width = `${safeWidth}px`;
    this.canvas.style.height = `${safeHeight}px`;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    this.snapshot.viewportWidth = safeWidth;
    this.snapshot.viewportHeight = safeHeight;
    this.snapshot.floorY = Math.round(safeHeight * GAME_CONFIG.floorRatio);

    if (this.snapshot.phase !== "playing" && this.snapshot.phase !== "paused") {
      this.snapshot.player.y = this.snapshot.floorY - this.snapshot.player.radius;
    }

    this.notify();
  }

  startRun(): void {
    resetSnapshotForRun(this.snapshot);
    this.spawnState = createSpawnState(this.snapshot.player.x + 220);
    this.sporeTouchCooldown = 0;
    this.dyingTimer = 0;
    this.setPhase("playing");
    this.loop.resume();
    this.notify();
  }

  restartRun(): void {
    this.startRun();
  }

  pause(): void {
    if (this.snapshot.phase !== "playing") return;
    this.setPhase("paused");
    this.loop.pause();
    this.notify();
  }

  resume(): void {
    if (this.snapshot.phase !== "paused") return;
    this.setPhase("playing");
    this.loop.resume();
    this.notify();
  }

  goLanding(): void {
    this.setPhase("landing");
    this.snapshot.feedback = null;
    this.snapshot.runResult = null;
    this.snapshot.sporeDebuffTtl = 0;
    this.snapshot.shieldPulseTtl = 0;
    this.snapshot.deathBloomTtl = 0;
    this.notify();
  }

  applyStroke(stroke: InputStroke): void {
    if (this.snapshot.phase !== "playing") return;

    const worldPoints = stroke.points.map((point) => ({
      x: point.x + point.cameraX,
      y: point.y,
      t: point.t
    }));

    const sampled = sampleStroke(worldPoints, GAME_CONFIG.minStrokeSampleGap);
    if (sampled.length < 2) return;

    const length = getStrokeLength(sampled);
    const sampledStroke: InputStroke = {
      ...stroke,
      points: sampled,
      length
    };

    const gesture = recognizeGesture(sampledStroke);

    if (gesture.action === "shield") {
      const spent = spendEnergy(this.snapshot.energy, GAME_CONFIG.shieldCost);
      if (spent) {
        this.snapshot.player.shieldHits = GAME_CONFIG.shieldMaxHits;
        this.snapshot.shieldPulseTtl = GAME_CONFIG.shieldPulseTime;
        this.setFeedback("花环护盾已激活", "good");
        this.notify();
        return;
      }
      this.setFeedback("能量不足，护盾未触发", "warn");
    }

    this.buildPath(sampled);
    this.notify();
  }

  private buildPath(points: StrokePoint[]): void {
    const totalLength = getStrokeLength(points);
    if (totalLength < GAME_CONFIG.pathMinLength) return;

    const fullCost = totalLength * GAME_CONFIG.pathEnergyCostPerPixel;
    let pathPoints = points;
    let finalLength = totalLength;
    let finalCost = fullCost;

    if (finalCost > this.snapshot.energy.current) {
      const maxAffordableLength = this.snapshot.energy.current / GAME_CONFIG.pathEnergyCostPerPixel;
      pathPoints = trimStrokeByLength(points, maxAffordableLength);
      finalLength = getStrokeLength(pathPoints);
      finalCost = finalLength * GAME_CONFIG.pathEnergyCostPerPixel;
    }

    if (pathPoints.length < 2 || finalLength < GAME_CONFIG.pathMinLength) {
      this.setFeedback("能量过低，无法生成有效路径", "warn");
      return;
    }

    if (!spendEnergy(this.snapshot.energy, finalCost)) {
      this.setFeedback("能量不足", "warn");
      return;
    }

    const ttl =
      GAME_CONFIG.pathTtlMin + Math.random() * (GAME_CONFIG.pathTtlMax - GAME_CONFIG.pathTtlMin);
    this.snapshot.paths.push(
      createPathSegment(this.nextId(), pathPoints, ttl, GAME_CONFIG.pathCollisionWidth)
    );
  }

  private update(dt: number): void {
    this.updateFeedback(dt);

    if (this.snapshot.phase === "playing") {
      this.updatePlaying(dt);
    } else if (this.snapshot.phase === "dying") {
      this.dyingTimer -= dt;
      this.snapshot.deathBloomTtl = Math.max(0, this.snapshot.deathBloomTtl - dt);

      if (this.dyingTimer <= 0) {
        this.finishRun();
      }
    }

    this.notify();
  }

  private updatePlaying(dt: number): void {
    this.snapshot.elapsed += dt;
    this.snapshot.sporeDebuffTtl = Math.max(0, this.snapshot.sporeDebuffTtl - dt);
    this.snapshot.shieldPulseTtl = Math.max(0, this.snapshot.shieldPulseTtl - dt);
    this.sporeTouchCooldown = Math.max(0, this.sporeTouchCooldown - dt);

    const difficulty = getDifficulty(this.snapshot.elapsed);
    const player = this.snapshot.player;
    const speedFactor = this.snapshot.sporeDebuffTtl > 0 ? GAME_CONFIG.sporeSlowFactor : 1;

    player.vx = difficulty.speed * speedFactor;
    player.vy = Math.min(GAME_CONFIG.maxFallSpeed, player.vy + GAME_CONFIG.gravity * dt);
    player.x += player.vx * dt;
    player.y += player.vy * dt;

    this.snapshot.cameraX = Math.max(
      0,
      player.x - this.snapshot.viewportWidth * GAME_CONFIG.cameraLeadRatio
    );

    for (const path of this.snapshot.paths) {
      if (!path.decayStarted && player.x >= path.decayStartX + player.radius) {
        path.decayStarted = true;
      }

      if (path.decayStarted) {
        path.ttl -= dt;
      }

      path.strength = path.decayStarted ? Math.max(0, path.ttl / path.maxTtl) : 1;
    }
    this.snapshot.paths = this.snapshot.paths.filter((path) => path.ttl > 0);

    spawnAhead(this.snapshot, difficulty, this.spawnState, () => this.nextId());
    cleanupBehind(this.snapshot);

    const gaps = this.snapshot.obstacles.filter((obstacle) => obstacle.type === "gap");
    const currentGap = getGapAtX(player.x, gaps);
    const autoCrossingGap =
      currentGap !== null && currentGap.width <= GAME_CONFIG.autoCrossGapWidth;

    let supportY: number | null = null;
    if ((!currentGap || autoCrossingGap) && player.y + player.radius >= this.snapshot.floorY) {
      supportY = this.snapshot.floorY;
    }

    const pathSupport = resolvePathSupport(player, this.snapshot.paths);
    if (pathSupport !== null) {
      supportY = supportY === null ? pathSupport : Math.min(supportY, pathSupport);
    }

    if (supportY !== null && player.vy >= 0) {
      player.y = supportY - player.radius;
      player.vy = 0;
      player.onGround = true;
    } else {
      player.onGround = false;
    }

    const vineHit = detectVineHit(player, this.snapshot.obstacles);
    if (vineHit) {
      if (player.shieldHits > 0) {
        player.shieldHits -= 1;
        vineHit.active = false;
        this.snapshot.shieldPulseTtl = GAME_CONFIG.shieldPulseTime;
        registerNearMiss(this.snapshot.score);
        registerHit(this.snapshot.score);
        this.setFeedback("护盾救回一次失误", "good");
      } else {
        this.triggerDeath("被藤蔓击中");
        return;
      }
    }

    const sporeHit = detectSporeContact(player, this.snapshot.obstacles);
    if (sporeHit && this.sporeTouchCooldown <= 0) {
      this.snapshot.sporeDebuffTtl = GAME_CONFIG.sporeSlowDuration;
      this.sporeTouchCooldown = GAME_CONFIG.sporeSlowContactCooldown;
      this.setFeedback("孢子云侵蚀，速度下降", "warn");
    }

    const picked = collectPollen(player, this.snapshot.pickups);
    if (picked.length > 0) {
      for (const item of picked) {
        addPollen(this.snapshot.score, 1);
        restoreEnergy(this.snapshot.energy, item.value);
      }
      this.setFeedback(`收集花粉 +${picked.length}`, "good");
    }

    regenerateEnergy(this.snapshot.energy, dt);
    registerSafeTime(this.snapshot.score, dt);
    updateDistance(this.snapshot.score, player.x - this.snapshot.runStartX);
    recalculateTotal(this.snapshot.score);

    if (player.y - player.radius > this.snapshot.viewportHeight + 120) {
      this.triggerDeath("坠落失败");
    }
  }

  private triggerDeath(reason: string): void {
    this.snapshot.player.alive = false;
    this.snapshot.deathBloomTtl = GAME_CONFIG.deathBloomDuration;
    this.dyingTimer = GAME_CONFIG.dyingDuration;
    this.setPhase("dying");
    this.setFeedback(reason, "warn");
  }

  private finishRun(): void {
    const distance = this.snapshot.score.distance;
    const isNewBest = distance > this.snapshot.score.best;
    const best = Math.max(this.snapshot.score.best, distance);
    this.snapshot.score.best = best;
    recalculateTotal(this.snapshot.score);

    this.snapshot.runResult = summarizeRun(this.snapshot.score, isNewBest, best);
    this.setPhase("result");
  }

  private updateFeedback(dt: number): void {
    if (!this.snapshot.feedback) return;
    this.snapshot.feedback.ttl -= dt;
    if (this.snapshot.feedback.ttl <= 0) {
      this.snapshot.feedback = null;
    }
  }

  private setFeedback(text: string, tone: FeedbackState["tone"]): void {
    this.snapshot.feedback = {
      text,
      tone,
      ttl: GAME_CONFIG.feedbackDuration
    };
  }

  private setPhase(phase: GamePhase): void {
    this.snapshot.phase = phase;
  }

  private render(): void {
    renderFrame(this.ctx, this.snapshot);
  }

  private nextId(): number {
    this.idCounter += 1;
    return this.idCounter;
  }

  private notify(): void {
    const cloned = this.cloneSnapshot();
    for (const listener of this.listeners) {
      listener(cloned);
    }
  }

  private cloneSnapshot(): GameSnapshot {
    return {
      ...this.snapshot,
      player: { ...this.snapshot.player },
      paths: this.snapshot.paths.map((path) => ({
        ...path,
        points: path.points.map((point) => ({ ...point }))
      })),
      obstacles: this.snapshot.obstacles.map((obstacle) => ({ ...obstacle })),
      pickups: this.snapshot.pickups.map((pickup) => ({ ...pickup })),
      energy: { ...this.snapshot.energy },
      score: { ...this.snapshot.score },
      feedback: this.snapshot.feedback ? { ...this.snapshot.feedback } : null,
      runResult: this.snapshot.runResult ? { ...this.snapshot.runResult } : null
    };
  }
}
