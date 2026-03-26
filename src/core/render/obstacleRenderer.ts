import { THEME } from "../../constants/theme";
import type { Obstacle, Pickup } from "../../types/game";

function drawFloorSegment(
  ctx: CanvasRenderingContext2D,
  fromX: number,
  toX: number,
  floorY: number,
  height: number
): void {
  if (toX <= fromX) return;

  const body = ctx.createLinearGradient(0, floorY, 0, height);
  body.addColorStop(0, "#17413e");
  body.addColorStop(1, THEME.floor);

  ctx.fillStyle = body;
  ctx.fillRect(fromX, floorY, toX - fromX, height - floorY);

  ctx.strokeStyle = THEME.floorEdge;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(fromX, floorY);
  ctx.lineTo(toX, floorY);
  ctx.stroke();
}

export function renderFloor(
  ctx: CanvasRenderingContext2D,
  visibleStart: number,
  visibleEnd: number,
  floorY: number,
  height: number,
  gaps: Obstacle[]
): void {
  const visibleGaps = gaps
    .filter((gap) => gap.active && gap.x + gap.width >= visibleStart && gap.x <= visibleEnd)
    .sort((a, b) => a.x - b.x);

  let cursor = visibleStart;

  for (const gap of visibleGaps) {
    drawFloorSegment(ctx, cursor, Math.max(cursor, gap.x), floorY, height);
    cursor = Math.max(cursor, gap.x + gap.width);
  }

  drawFloorSegment(ctx, cursor, visibleEnd, floorY, height);
}

export function renderObstacles(ctx: CanvasRenderingContext2D, obstacles: Obstacle[], elapsed: number): void {
  for (const obstacle of obstacles) {
    if (!obstacle.active || obstacle.type === "gap") continue;

    if (obstacle.type === "vine") {
      const pulse = 0.8 + Math.sin(elapsed * 4 + obstacle.id) * 0.1;
      ctx.fillStyle = THEME.vine;
      ctx.globalAlpha = 0.86;
      ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);

      ctx.strokeStyle = "rgba(193, 255, 217, 0.82)";
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(obstacle.x + obstacle.width * 0.22, obstacle.y + obstacle.height);
      ctx.quadraticCurveTo(
        obstacle.x + obstacle.width * pulse,
        obstacle.y + obstacle.height * 0.48,
        obstacle.x + obstacle.width * 0.4,
        obstacle.y
      );
      ctx.stroke();
      continue;
    }

    const cloud = ctx.createRadialGradient(
      obstacle.x + obstacle.width * 0.5,
      obstacle.y + obstacle.height * 0.5,
      4,
      obstacle.x + obstacle.width * 0.5,
      obstacle.y + obstacle.height * 0.5,
      obstacle.width * 0.7
    );
    cloud.addColorStop(0, "rgba(255, 165, 146, 0.78)");
    cloud.addColorStop(1, "rgba(255, 122, 89, 0.06)");

    ctx.fillStyle = cloud;
    ctx.globalAlpha = 0.92;
    ctx.beginPath();
    ctx.ellipse(
      obstacle.x + obstacle.width * 0.5,
      obstacle.y + obstacle.height * 0.5,
      obstacle.width * 0.5,
      obstacle.height * 0.5,
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }

  ctx.globalAlpha = 1;
}

export function renderPickups(ctx: CanvasRenderingContext2D, pickups: Pickup[], elapsed: number): void {
  for (const pickup of pickups) {
    if (!pickup.alive) continue;

    const bob = Math.sin(elapsed * 4.2 + pickup.id * 0.8) * 4;
    const x = pickup.x;
    const y = pickup.y + bob;

    ctx.fillStyle = "rgba(255, 244, 188, 0.9)";
    ctx.beginPath();
    ctx.arc(x, y, pickup.radius + 1.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = THEME.pollen;
    ctx.beginPath();
    ctx.arc(x, y, pickup.radius * 0.62, 0, Math.PI * 2);
    ctx.fill();
  }
}
