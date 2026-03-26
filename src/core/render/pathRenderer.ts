import { THEME } from "../../constants/theme";
import type { PathSegment } from "../../types/game";

export function renderPaths(ctx: CanvasRenderingContext2D, paths: PathSegment[]): void {
  for (const path of paths) {
    if (path.points.length < 2 || path.ttl <= 0) continue;

    const life = Math.max(0, path.ttl / path.maxTtl);
    const first = path.points[0];
    const last = path.points[path.points.length - 1];
    const gradient = ctx.createLinearGradient(first.x, first.y, last.x, last.y);
    gradient.addColorStop(0, THEME.pathMain);
    gradient.addColorStop(1, THEME.pathTail);

    ctx.strokeStyle = gradient;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = path.collisionWidth * (0.8 + life * 0.45);
    ctx.globalAlpha = 0.28 + life * 0.72;

    ctx.beginPath();
    ctx.moveTo(first.x, first.y);

    for (let i = 1; i < path.points.length; i += 1) {
      const point = path.points[i];
      ctx.lineTo(point.x, point.y);
    }

    ctx.stroke();

    ctx.globalAlpha = 0.23 + life * 0.5;
    ctx.lineWidth = 1.8;
    ctx.strokeStyle = "#e4fff6";
    ctx.stroke();
  }

  ctx.globalAlpha = 1;
}
