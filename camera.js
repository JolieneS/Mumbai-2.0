const camera = {
  x: 0,
  y: 0,
  lerpSpeed: 0.12,

  update(targetX, targetY) {
  
    const targetCamX = targetX - canvas.width  / 2;
    const targetCamY = targetY - canvas.height / 2;

    
    this.x += (targetCamX - this.x) * this.lerpSpeed;
    this.y += (targetCamY - this.y) * this.lerpSpeed;
  },

  
  apply(ctx) {
    ctx.save();
    ctx.translate(-this.x, -this.y);
  },

 
  reset(ctx) {
    ctx.restore();
  },

  
  worldToScreen(worldX, worldY) {
    return {
      x: worldX - this.x,
      y: worldY - this.y
    };
  },

 
  isOnScreen(worldX, worldY, margin = 100) {
    const s = this.worldToScreen(worldX, worldY);
    return s.x > -margin &&
           s.x < canvas.width  + margin &&
           s.y > -margin &&
           s.y < canvas.height + margin;
  }
};