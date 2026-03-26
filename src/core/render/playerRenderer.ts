import { THEME } from "../../constants/theme";
import type { Player } from "../../types/game";

export function renderPlayer(ctx: CanvasRenderingContext2D, player: Player, elapsed: number): void {
  const glowRadius = player.radius + 10 + Math.sin(elapsed * 6) * 1.5;

  const glow = ctx.createRadialGradient(player.x, player.y, player.radius * 0.2, player.x, player.y, glowRadius);
  glow.addColorStop(0, "rgba(233, 255, 180, 0.95)");
  glow.addColorStop(1, THEME.playerGlow);

  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(player.x, player.y, glowRadius, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = THEME.playerCore;
  ctx.beginPath();
  ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "rgba(255, 255, 240, 0.8)";
  ctx.beginPath();
  ctx.arc(player.x + player.radius * 0.34, player.y - player.radius * 0.32, player.radius * 0.28, 0, Math.PI * 2);
  ctx.fill();

  if (player.shieldHits > 0) {
    ctx.strokeStyle = THEME.shield;
    ctx.lineWidth = 2.6;
    ctx.globalAlpha = 0.9;
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.radius + 7 + Math.sin(elapsed * 8) * 0.9, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }
}
