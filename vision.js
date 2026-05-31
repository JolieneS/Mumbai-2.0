const vision = {
  fogCanvas: null,
  fogCtx:    null,

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

    // step 1 — clear the offscreen canvas completely
    fc.clearRect(0, 0, this.fogCanvas.width, this.fogCanvas.height);

    // step 2 — fill entire offscreen canvas with solid black fog
    fc.globalCompositeOperation = 'source-over';
    fc.fillStyle = 'rgba(0, 0, 0, 0.92)';
    fc.fillRect(0, 0, this.fogCanvas.width, this.fogCanvas.height);

    // step 3 — cut a hole in the black fog using destination-out
    // this makes the lit area transparent revealing the world below
    fc.globalCompositeOperation = 'destination-out';
    fc.fillStyle = 'rgba(0, 0, 0, 1)';
    fc.beginPath();

    if (walls.length === 0) {
      // in corridor — simple circle of visibility
      fc.arc(screenX, screenY, 160, 0, Math.PI * 2);
      fc.fill();
    } else {
      // in room — raycast vision cone
      const forwardRays = 80;
      const coneAngle   = Math.PI * 0.75;
      const startAngle  = player.angle - coneAngle / 2;
      const angleStep   = coneAngle / forwardRays;
      const points      = [];

      for (let i = 0; i <= forwardRays; i++) {
        const angle   = startAngle + i * angleStep;
        const worldPt = this.castRay(px, py, angle, walls);
        points.push({
          x: worldPt.x - camera.x,
          y: worldPt.y - camera.y
        });
      }

      fc.moveTo(screenX, screenY);
      points.forEach(p => fc.lineTo(p.x, p.y));
      fc.closePath();
      fc.fill();

      // small ambient circle behind player
      fc.beginPath();
      fc.arc(screenX, screenY, 70, 0, Math.PI * 2);
      fc.fill();
    }

    // step 4 — restore to normal compositing
    fc.globalCompositeOperation = 'source-over';

    // step 5 — stamp the fog canvas onto the main canvas
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