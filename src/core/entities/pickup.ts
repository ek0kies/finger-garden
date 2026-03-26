import type { Pickup, PickupType } from "../../types/game";

export function createPickup(
  id: number,
  type: PickupType,
  x: number,
  y: number,
  value: number,
  radius = 8
): Pickup {
  return {
    id,
    type,
    x,
    y,
    value,
    radius,
    alive: true
  };
}
