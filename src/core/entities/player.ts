import type { Player } from "../../types/game";

export function createPlayer(x: number, y: number, radius: number): Player {
  return {
    x,
    y,
    vx: 0,
    vy: 0,
    radius,
    shieldHits: 0,
    alive: true,
    onGround: false
  };
}
