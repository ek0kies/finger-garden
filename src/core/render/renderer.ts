import type { GameSnapshot, Obstacle } from "../../types/game";
import { renderBackground } from "./backgroundRenderer";
import { renderFeedback, renderScreenEffects } from "./effectRenderer";
import { renderObstacles, renderFloor, renderPickups } from "./obstacleRenderer";
import { renderPaths } from "./pathRenderer";
import { renderPlayer } from "./playerRenderer";

export function renderFrame(ctx: CanvasRenderingContext2D, snapshot: GameSnapshot): void {
  const { viewportWidth: width, viewportHeight: height } = snapshot;
  renderBackground(ctx, width, height, snapshot.elapsed);

  const visibleStart = snapshot.cameraX - 24;
  const visibleEnd = snapshot.cameraX + width + 24;
  const gaps = snapshot.obstacles.filter((item): item is Obstacle => item.type === "gap");

  ctx.save();
  ctx.translate(-snapshot.cameraX, 0);

  renderFloor(ctx, visibleStart, visibleEnd, snapshot.floorY, height, gaps);
  renderPaths(ctx, snapshot.paths);
  renderObstacles(ctx, snapshot.obstacles, snapshot.elapsed);
  renderPickups(ctx, snapshot.pickups, snapshot.elapsed);
  renderPlayer(ctx, snapshot.player, snapshot.elapsed);

  ctx.restore();

  renderScreenEffects(ctx, snapshot);
  renderFeedback(ctx, snapshot.feedback, width, snapshot.phase);
}
