import type { StrokePoint } from "../../types/game";

export function sampleStroke(points: StrokePoint[], minGap: number): StrokePoint[] {
  if (points.length <= 2) return points;
  const sampled: StrokePoint[] = [points[0]];
  let last = points[0];

  for (let i = 1; i < points.length - 1; i += 1) {
    const point = points[i];
    if (Math.hypot(point.x - last.x, point.y - last.y) >= minGap) {
      sampled.push(point);
      last = point;
    }
  }

  sampled.push(points[points.length - 1]);
  return sampled;
}

export function getStrokeLength(points: StrokePoint[]): number {
  if (points.length < 2) return 0;
  let length = 0;
  for (let i = 1; i < points.length; i += 1) {
    const dx = points[i].x - points[i - 1].x;
    const dy = points[i].y - points[i - 1].y;
    length += Math.hypot(dx, dy);
  }
  return length;
}

export function trimStrokeByLength(points: StrokePoint[], maxLength: number): StrokePoint[] {
  if (points.length < 2 || maxLength <= 0) return [];
  let consumed = 0;
  const trimmed: StrokePoint[] = [points[0]];

  for (let i = 1; i < points.length; i += 1) {
    const from = points[i - 1];
    const to = points[i];
    const seg = Math.hypot(to.x - from.x, to.y - from.y);

    if (consumed + seg <= maxLength) {
      trimmed.push(to);
      consumed += seg;
      continue;
    }

    const remain = maxLength - consumed;
    if (remain > 0) {
      const ratio = remain / seg;
      trimmed.push({
        x: from.x + (to.x - from.x) * ratio,
        y: from.y + (to.y - from.y) * ratio,
        t: to.t,
        cameraX: from.cameraX + (to.cameraX - from.cameraX) * ratio
      });
    }
    break;
  }

  return trimmed;
}
