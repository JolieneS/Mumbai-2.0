function closestPointOnSegment(px, py, ax, ay, bx, by) {
  const dx  = bx - ax;
  const dy  = by - ay;
  const lenSq = dx * dx + dy * dy;

  
  if (lenSq === 0) return { x: ax, y: ay };

  
  let t = ((px - ax) * dx + (py - ay) * dy) / lenSq;
  t = Math.max(0, Math.min(1, t)); // clamp between 0 and 1

  return {
    x: ax + t * dx,
    y: ay + t * dy
  };
}

function circleVsSegment(cx, cy, radius, ax, ay, bx, by) {
  const closest = closestPointOnSegment(cx, cy, ax, ay, bx, by);

  const diffX = cx - closest.x;
  const diffY = cy - closest.y;
  const dist  = Math.sqrt(diffX * diffX + diffY * diffY);

  if (dist < radius && dist > 0) {
    
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