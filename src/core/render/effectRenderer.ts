import { GAME_CONFIG } from "../../constants/game";
import type { FeedbackState, GamePhase, GameSnapshot } from "../../types/game";

function feedbackColor(tone: FeedbackState["tone"]): string {
  if (tone === "good") return "rgba(124, 246, 182, 0.92)";
  if (tone === "warn") return "rgba(255, 157, 116, 0.96)";
  return "rgba(167, 238, 255, 0.92)";
}

export function renderFeedback(
  ctx: CanvasRenderingContext2D,
  feedback: FeedbackState | null,
  width: number,
  phase: GamePhase
): void {
  if (!feedback) return;

  const alpha = Math.min(1, feedback.ttl / 0.24);
  ctx.globalAlpha = alpha;

  ctx.font = "600 16px 'Avenir Next', 'PingFang SC', sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const y = phase === "playing" ? 64 : 84;
  const text = feedback.text;

  ctx.fillStyle = "rgba(4, 22, 26, 0.75)";
  const textWidth = ctx.measureText(text).width;
  const boxWidth = textWidth + 28;
  const boxHeight = 34;
  ctx.beginPath();
  ctx.roundRect((width - boxWidth) * 0.5, y - boxHeight * 0.5, boxWidth, boxHeight, 12);
  ctx.fill();

  ctx.fillStyle = feedbackColor(feedback.tone);
  ctx.fillText(text, width * 0.5, y);

  ctx.globalAlpha = 1;
}

export function renderScreenEffects(ctx: CanvasRenderingContext2D, snapshot: GameSnapshot): void {
  if (snapshot.sporeDebuffTtl > 0) {
    const ratio = Math.min(1, snapshot.sporeDebuffTtl / GAME_CONFIG.sporeSlowDuration);
    const alpha = 0.14 + ratio * 0.2;

    ctx.fillStyle = `rgba(250, 144, 117, ${alpha.toFixed(3)})`;
    ctx.fillRect(0, 0, snapshot.viewportWidth, snapshot.viewportHeight);

    const mist = ctx.createRadialGradient(
      snapshot.viewportWidth * 0.72,
      snapshot.viewportHeight * 0.34,
      8,
      snapshot.viewportWidth * 0.72,
      snapshot.viewportHeight * 0.34,
      snapshot.viewportWidth * 0.7
    );
    mist.addColorStop(0, "rgba(255, 187, 152, 0.32)");
    mist.addColorStop(1, "rgba(255, 187, 152, 0)");
    ctx.fillStyle = mist;
    ctx.fillRect(0, 0, snapshot.viewportWidth, snapshot.viewportHeight);
  }

  if (snapshot.shieldPulseTtl > 0) {
    const progress = 1 - snapshot.shieldPulseTtl / GAME_CONFIG.shieldPulseTime;
    const x = snapshot.player.x - snapshot.cameraX;
    const y = snapshot.player.y;
    const radius = snapshot.player.radius + 6 + progress * 26;

    ctx.strokeStyle = `rgba(156, 231, 255, ${(1 - progress) * 0.8})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.stroke();
  }

  if (snapshot.phase === "dying" && snapshot.deathBloomTtl > 0) {
    const progress = 1 - snapshot.deathBloomTtl / GAME_CONFIG.deathBloomDuration;
    const x = snapshot.player.x - snapshot.cameraX;
    const y = snapshot.player.y;

    const radius = 24 + progress * 132;
    const bloom = ctx.createRadialGradient(x, y, 2, x, y, radius);
    bloom.addColorStop(0, "rgba(255, 238, 154, 0.95)");
    bloom.addColorStop(0.28, "rgba(255, 174, 113, 0.66)");
    bloom.addColorStop(1, "rgba(255, 136, 104, 0)");

    ctx.fillStyle = bloom;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }
}
