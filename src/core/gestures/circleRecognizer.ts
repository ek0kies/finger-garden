import type { InputStroke } from "../../types/game";

export interface CircleRecognition {
  matched: boolean;
  confidence: number;
}

export function recognizeCircle(stroke: InputStroke): CircleRecognition {
  const points = stroke.points;
  if (points.length < 8) return { matched: false, confidence: 0 };

  let minX = Number.POSITIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;

  for (const point of points) {
    minX = Math.min(minX, point.x);
    minY = Math.min(minY, point.y);
    maxX = Math.max(maxX, point.x);
    maxY = Math.max(maxY, point.y);
  }

  const width = maxX - minX;
  const height = maxY - minY;
  const ratio = width > height ? width / Math.max(1, height) : height / Math.max(1, width);
  const distanceStartEnd = Math.hypot(
    points[0].x - points[points.length - 1].x,
    points[0].y - points[points.length - 1].y
  );
  const closeEnough = distanceStartEnd <= Math.max(20, Math.min(width, height) * 0.42);
  const longEnough = stroke.length >= 110;
  const roundedEnough = ratio <= 1.45;

  if (!closeEnough || !longEnough || !roundedEnough) {
    return { matched: false, confidence: 0 };
  }

  const ratioScore = Math.max(0, 1 - (ratio - 1) / 0.45);
  const closeScore = Math.max(0, 1 - distanceStartEnd / Math.max(width, height, 1));
  return {
    matched: true,
    confidence: Math.min(1, ratioScore * 0.6 + closeScore * 0.4)
  };
}
