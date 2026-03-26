import type { Obstacle, PathSegment, Pickup, Player, Vec2 } from "../../types/game";

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function circleRectHit(
  cx: number,
  cy: number,
  r: number,
  x: number,
  y: number,
  width: number,
  height: number
): boolean {
  const nearX = clamp(cx, x, x + width);
  const nearY = clamp(cy, y, y + height);
  const dx = cx - nearX;
  const dy = cy - nearY;
  return dx * dx + dy * dy <= r * r;
}

function closestPointOnSegment(point: Vec2, a: Vec2, b: Vec2): Vec2 {
  const abx = b.x - a.x;
  const aby = b.y - a.y;
  const abLen2 = abx * abx + aby * aby;
  if (abLen2 <= 0.0001) {
    return { x: a.x, y: a.y };
  }

  const apx = point.x - a.x;
  const apy = point.y - a.y;
  const t = clamp((apx * abx + apy * aby) / abLen2, 0, 1);
  return {
    x: a.x + abx * t,
    y: a.y + aby * t
  };
}

export function getGapAtX(playerX: number, gaps: Obstacle[]): Obstacle | null {
  for (const gap of gaps) {
    if (!gap.active) continue;
    if (playerX >= gap.x && playerX <= gap.x + gap.width) {
      return gap;
    }
  }
  return null;
}

export function isInsideGap(playerX: number, gaps: Obstacle[]): boolean {
  return getGapAtX(playerX, gaps) !== null;
}

export function resolvePathSupport(player: Player, paths: PathSegment[]): number | null {
  if (paths.length === 0) return null;

  const center = { x: player.x, y: player.y };
  const maxReach = player.radius + 18;
  let support: number | null = null;

  for (const path of paths) {
    if (path.ttl <= 0 || path.points.length < 2) continue;

    for (let i = 1; i < path.points.length; i += 1) {
      const a = path.points[i - 1];
      const b = path.points[i];

      if (center.x + maxReach < Math.min(a.x, b.x) || center.x - maxReach > Math.max(a.x, b.x)) {
        continue;
      }

      const nearest = closestPointOnSegment(center, a, b);
      const dx = center.x - nearest.x;
      const dy = center.y - nearest.y;
      const dist = Math.hypot(dx, dy);
      const collisionReach = player.radius + path.collisionWidth;

      if (
        dist <= collisionReach + 2 &&
        player.vy >= -22 &&
        center.y <= nearest.y + collisionReach * 0.7
      ) {
        support = support === null ? nearest.y : Math.min(support, nearest.y);
      }
    }
  }

  return support;
}

export function detectVineHit(player: Player, obstacles: Obstacle[]): Obstacle | null {
  for (const obstacle of obstacles) {
    if (!obstacle.active || !obstacle.dangerous) continue;
    if (obstacle.type !== "vine") continue;

    if (
      circleRectHit(player.x, player.y, player.radius, obstacle.x, obstacle.y, obstacle.width, obstacle.height)
    ) {
      return obstacle;
    }
  }

  return null;
}

export function detectSporeContact(player: Player, obstacles: Obstacle[]): Obstacle | null {
  for (const obstacle of obstacles) {
    if (!obstacle.active || obstacle.type !== "spore") continue;

    if (
      circleRectHit(player.x, player.y, player.radius + 2, obstacle.x, obstacle.y, obstacle.width, obstacle.height)
    ) {
      return obstacle;
    }
  }

  return null;
}

export function collectPollen(player: Player, pickups: Pickup[]): Pickup[] {
  const picked: Pickup[] = [];

  for (const pickup of pickups) {
    if (!pickup.alive) continue;
    const distance = Math.hypot(player.x - pickup.x, player.y - pickup.y);
    if (distance <= player.radius + pickup.radius) {
      pickup.alive = false;
      picked.push(pickup);
    }
  }

  return picked;
}
