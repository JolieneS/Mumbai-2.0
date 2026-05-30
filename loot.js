class Loot {
  constructor(x, y, type, value) {
    this.x        = x;
    this.y        = y;
    this.type     = type;
    this.value    = value;
    this.radius   = 10;
    this.bobTimer = Math.random() * Math.PI * 2; 

    this.color = type === 'coin'    ? '#f1c40f' :
                 type === 'ammo'    ? '#ecf0f1' :
                 type === 'powerup' ? '#00ffff'  : '#fff';
  }

  update(dt) {
    
    this.bobTimer += dt * 3;
  }

  collect(player) {
    if (this.type === 'coin') {
      player.coins = (player.coins || 0) + this.value;
      document.getElementById('hud-coins').textContent = `Coins: ${player.coins}`;

    } else if (this.type === 'ammo') {
      player.ammo = Math.min(player.ammo + this.value, player.maxAmmo);
      document.getElementById('hud-ammo').textContent = `Ammo: ${player.ammo}`;

    } else if (this.type === 'powerup') {
      player.collectedPowerups.push(this.value);
    }

    audio.playCoinCollect();
  }

  draw(ctx) {
    
    const bobOffset = Math.sin(this.bobTimer) * 3;

    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y + bobOffset, this.radius, 0, Math.PI * 2);
    ctx.fill();

    
    ctx.strokeStyle = 'rgba(255,255,255,0.4)';
    ctx.lineWidth   = 1.5;
    ctx.stroke();

    
    ctx.fillStyle   = '#000';
    ctx.font        = 'bold 8px Courier New';
    ctx.textAlign   = 'center';
    ctx.fillText(
      this.type === 'coin'    ? '$' :
      this.type === 'ammo'    ? 'A' : 'P',
      this.x,
      this.y + bobOffset + 3
    );
    ctx.textAlign = 'left';
  }
}