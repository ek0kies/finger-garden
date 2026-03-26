import { THEME } from "../../constants/theme";

export function renderBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  elapsed: number
): void {
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, THEME.skyTop);
  gradient.addColorStop(0.45, THEME.skyMid);
  gradient.addColorStop(1, THEME.skyBottom);

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  const pulse = Math.sin(elapsed * 0.7) * 0.08 + 0.92;

  ctx.fillStyle = THEME.glowA;
  ctx.beginPath();
  ctx.ellipse(width * 0.12, height * 0.2, 130 * pulse, 92 * pulse, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = THEME.glowB;
  ctx.beginPath();
  ctx.ellipse(width * 0.84, height * 0.17, 168 * pulse, 104 * pulse, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = THEME.glowC;
  ctx.beginPath();
  ctx.ellipse(width * 0.55, height * 0.78, 152, 94, 0, 0, Math.PI * 2);
  ctx.fill();

  for (let i = 0; i < 30; i += 1) {
    const offset = i * 18.77;
    const x = (i * 79.3 + elapsed * (7 + (i % 5))) % (width + 120) - 60;
    const y = ((i * 53.4 + Math.sin(elapsed * 0.8 + offset) * 24) % (height * 0.72)) + 20;
    const radius = 0.8 + (i % 4) * 0.5;
    ctx.globalAlpha = 0.18 + (i % 3) * 0.08;
    ctx.fillStyle = "#d9ffe6";
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.globalAlpha = 1;
}
