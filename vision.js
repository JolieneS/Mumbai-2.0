const vision = {
  
  fogCanvas:  null,
  fogCtx:     null,

  init() {
    
    this.fogCanvas        = document.createElement('canvas');
    this.fogCanvas.width  = canvas.width;
    this.fogCanvas.height = canvas.height;
    this.fogCtx           = this.fogCanvas.getContext('2d');
  },

  resize() {
    if (!this.fogCanvas) return;
    this.fogCanvas.width  = canvas.width;
    this.fogCanvas.height = canvas.height;
  },

 draw(ctx, px, py, walls) {
  if (!this.fogCanvas) this.init();

  if (this.fogCanvas.width  !== canvas.width ||
      this.fogCanvas.height !== canvas.height) {
    this.resize();
  }

  const fc      = this.fogCtx;
  const screenX = px - camera.x;
  const screenY = py - camera.y;

  fc.clearRect(0, 0, this.fogCanvas.width, this.fogCanvas.height);

  // full dark overlay
  fc.fillStyle = 'rgba(0, 0, 0, 0.94)';
  fc.fillRect(0, 0, this.fogCanvas.width, this.fogCanvas.height);

  fc.globalCompositeOperation = 'destination-out';

  if (walls.length === 0) {
    
    fc.fillStyle = 'rgba(0,0,0,1)';
    fc.beginPath();
    fc.arc(screenX, screenY, 160, 0, Math.PI * 2);
    fc.fill();
  } else {
    
    const forwardRays  = 80;
    const coneAngle    = Math.PI * 0.75;  // 135 degrees forward
    const startAngle   = player.angle - coneAngle / 2;
    const angleStep    = coneAngle / forwardRays;
    const forwardPts   = [];

    for (let i = 0; i <= forwardRays; i++) {
      const angle = startAngle + i * angleStep;
      const pt    = this.castRay(px, py, angle, walls);
      forwardPts.push({
        x: pt.x - camera.x,
        y: pt.y - camera.y
      });
    }

    fc.fillStyle = 'rgba(0,0,0,1)';
    fc.beginPath();
    fc.moveTo(screenX, screenY);
    forwardPts.forEach(p => fc.lineTo(p.x, p.y));
    fc.closePath();
    fc.fill();

    
    fc.fillStyle = 'rgba(0,0,0,0.6)';
    fc.beginPath();
    fc.arc(screenX, screenY, 80, 0, Math.PI * 2);
    fc.fill();
  }

  fc.globalCompositeOperation = 'source-over';

  
  const grad = fc.createRadialGradient(screenX, screenY, 60, screenX, screenY, 220);
  fc.globalCompositeOperation = 'destination-out';
  grad.addColorStop(0,   'rgba(0,0,0,0.3)');
  grad.addColorStop(0.5, 'rgba(0,0,0,0.1)');
  grad.addColorStop(1,   'rgba(0,0,0,0)');
  fc.fillStyle = grad;
  fc.beginPath();
  fc.arc(screenX, screenY, 220, 0, Math.PI * 2);
  fc.fill();
  fc.globalCompositeOperation = 'source-over';

 
  ctx.drawImage(this.fogCanvas, 0, 0);
},
  castRay(ox, oy, angle, walls) {
    const dx      = Math.cos(angle);
    const dy      = Math.sin(angle);
    const maxDist = 500;
    let   closest = maxDist;

    walls.forEach(w => {
      const hit = this.raySegmentIntersect(
        ox, oy, dx, dy,
        w.x1, w.y1, w.x2, w.y2
      );
      if (hit !== null && hit < closest) {
        closest = hit;
      }
    });

    return {
      x: ox + dx * closest,
      y: oy + dy * closest
    };
  },

  raySegmentIntersect(ox, oy, dx, dy, x1, y1, x2, y2) {
    const wx    = x2 - x1;
    const wy    = y2 - y1;
    const denom = dx * wy - dy * wx;
    if (Math.abs(denom) < 0.0001) return null;

    const tx = x1 - ox;
    const ty = y1 - oy;
    const t  = (tx * wy - ty * wx) / denom;
    const u  = (tx * dy - ty * dx) / denom;

    if (t >= 0 && u >= 0 && u <= 1) return t;
    return null;
  }
};