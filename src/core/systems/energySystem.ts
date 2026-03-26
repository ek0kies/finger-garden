import { GAME_CONFIG } from "../../constants/game";
import type { EnergyState } from "../../types/game";

export function createEnergyState(): EnergyState {
  return {
    current: GAME_CONFIG.energyStart,
    max: GAME_CONFIG.energyMax,
    regenRate: GAME_CONFIG.energyRegenRate,
    regenDelay: GAME_CONFIG.energyRegenDelay,
    regenCooldown: 0
  };
}

export function spendEnergy(energy: EnergyState, amount: number): boolean {
  if (amount <= 0) return true;
  if (energy.current < amount) return false;
  energy.current -= amount;
  energy.regenCooldown = energy.regenDelay;
  return true;
}

export function restoreEnergy(energy: EnergyState, amount: number): void {
  if (amount <= 0) return;
  energy.current = Math.min(energy.max, energy.current + amount);
}

export function regenerateEnergy(energy: EnergyState, dt: number): void {
  if (energy.regenCooldown > 0) {
    energy.regenCooldown = Math.max(0, energy.regenCooldown - dt);
    return;
  }
  energy.current = Math.min(energy.max, energy.current + energy.regenRate * dt);
}
