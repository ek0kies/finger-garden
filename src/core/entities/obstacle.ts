import type { Obstacle, ObstacleType } from "../../types/game";

export function createObstacle(
  id: number,
  type: ObstacleType,
  x: number,
  y: number,
  width: number,
  height: number,
  dangerous = true
): Obstacle {
  return {
    id,
    type,
    x,
    y,
    width,
    height,
    dangerous,
    active: true
  };
}
