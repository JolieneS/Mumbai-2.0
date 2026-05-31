function closestPointOnSegment(px, py, ax, ay, bx, by) {
  const dx    = bx - ax;
  const dy    = by - ay;
  const lenSq = dx * dx + dy * dy;

  if (lenSq === 0) return { x: ax, y: ay };

  let t = ((px - ax) * dx + (py - ay) * dy) / lenSq;
  t     = Math.max(0, Math.min(1, t));

  return {
    x: ax + t * dx,
    y: ay + t * dy
  };
}

function circleVsSegment(cx, cy, radius, ax, ay, bx, by) {
  const closest = closestPointOnSegment(cx, cy, ax, ay, bx, by);
  const diffX   = cx - closest.x;
  const diffY   = cy - closest.y;
  const dist    = Math.sqrt(diffX * diffX + diffY * diffY);

  if (dist < radius && dist > 0.001) {
    return {
      hit:   true,
      nx:    diffX / dist,
      ny:    diffY / dist,
      depth: radius - dist
    };
  }

  return { hit: false };
}

function resolvePlayerWall(walls) {
  // run 3 passes for stable corner resolution
  for (let pass = 0; pass < 3; pass++) {
    walls.forEach(w => {
      const result = circleVsSegment(
        player.x, player.y, player.radius,
        w.x1, w.y1, w.x2, w.y2
      );

      if (result.hit) {
        player.x += result.nx * (result.depth + 1.5);
        player.y += result.ny * (result.depth + 1.5);
      }
    });
  }
}

function bulletHitsSegment(b, seg) {
  const dx    = seg.x2 - seg.x1;
  const dy    = seg.y2 - seg.y1;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return false;

  const t = Math.max(0, Math.min(1,
    ((b.x - seg.x1) * dx + (b.y - seg.y1) * dy) / lenSq
  ));

  const closestX = seg.x1 + t * dx;
  const closestY = seg.y1 + t * dy;
  const distX    = b.x - closestX;
  const distY    = b.y - closestY;
  const dist     = Math.sqrt(distX * distX + distY * distY);

  return dist < b.radius + 2;
}

function reflectBullet(b, seg) {
  const dx  = seg.x2 - seg.x1;
  const dy  = seg.y2 - seg.y1;
  const len = Math.sqrt(dx * dx + dy * dy);
  const nx  = -dy / len;
  const ny  =  dx / len;
  const dot = b.vx * nx + b.vy * ny;
  b.vx      = b.vx - 2 * dot * nx;
  b.vy      = b.vy - 2 * dot * ny;
}