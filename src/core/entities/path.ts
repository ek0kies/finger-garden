import type { PathSegment, StrokePoint, Vec2 } from "../../types/game";

export function measurePolyline(points: readonly Vec2[]): number {
  if (points.length < 2) return 0;
  let total = 0;
  for (let i = 1; i < points.length; i += 1) {
    const dx = points[i].x - points[i - 1].x;
    const dy = points[i].y - points[i - 1].y;
    total += Math.hypot(dx, dy);
  }
  return total;
}

export function createPathSegment(
  id: number,
  points: StrokePoint[] | Vec2[],
  ttl: number,
  collisionWidth: number
): PathSegment {
  const normalizedPoints = points.map((point) => ({ x: point.x, y: point.y }));
  const decayStartX = normalizedPoints.reduce((maxX, point) => Math.max(maxX, point.x), Number.NEGATIVE_INFINITY);

  return {
    id,
    points: normalizedPoints,
    ttl,
    maxTtl: ttl,
    strength: 1,
    collisionWidth,
    decayStarted: false,
    decayStartX
  };
}
