const player = {
  x: 0,
  y: 0,
  vx: 0,
  vy: 0,
  speed: PLAYER_SPEED,
  health: PLAYER_MAX_HEALTH,
  maxHealth: PLAYER_MAX_HEALTH,
  radius: PLAYER_RADIUS,
  angle: 0,
  shootCooldown: 0.25,
  shootTimer: 0,
  hasMovedOnce: false,
 
ammo: PLAYER_START_AMMO,
maxAmmo: PLAYER_START_AMMO,
activePowerup: null,
powerupTimer: 0,
collectedPowerups: [],
damageMult: 1,

  update(dt) {
    
    let vx = 0;
    let vy = 0;

    if (vx !== 0 || vy !== 0) {
  this.hasMovedOnce = true;
}

    
this.x += vx * this.speed * dt;
this.y += vy * this.speed * dt;


this.x = Math.max(player.radius, Math.min(canvas.width - player.radius, this.x));


player_position_x = this.x;
player_position_y = this.y;

    
    if (input.keys['w'] || input.keys['arrowup'])    vy = -1;
    if (input.keys['s'] || input.keys['arrowdown'])  vy =  1;
    if (input.keys['a'] || input.keys['arrowleft'])  vx = -1;
    if (input.keys['d'] || input.keys['arrowright']) vx =  1;

    
    if (vx !== 0 && vy !== 0) {
      vx *= 0.707;
      vy *= 0.707;
    }

    
    this.x += vx * this.speed * dt;
    this.y += vy * this.speed * dt;

   
    player_position_x = this.x;
    player_position_y = this.y;

    
    this.angle = Math.atan2(
      input.mouseY - this.y,
      input.mouseX - this.x
    );

    
    this.shootTimer += dt;

   
// at the very bottom of update(dt)
// shoot on click, space, OR enter
if (this.hasMovedOnce && (input.isMouseDown || input.isSpaceDown || input.isEnterDown)) {
  this.fireBullet();
}

if (this.activePowerup) {
  this.powerupTimer -= dt;
  if (this.powerupTimer <= 0) {
    // powerup expired
    if (this.activePowerup === 'SPEED') this.speed = PLAYER_SPEED;
    this.activePowerup = null;
    this.powerupTimer  = 0;
  }
}
  },

  draw(ctx) {
    
    ctx.fillStyle = PLAYER_COLOR;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();


if (gameState === 'PLAYING') {
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
  ctx.lineWidth   = 2;
  ctx.beginPath();
  ctx.moveTo(this.x, this.y);
  ctx.lineTo(
    this.x + Math.cos(this.angle) * 18,
    this.y + Math.sin(this.angle) * 18
  );
  ctx.stroke();
}

    
    
  },

  takeDamage(amount) {
  // shield powerup blocks all damage
  if (this.activePowerup === 'SHIELD') return;

  this.health -= amount;

  try { audio.playPlayerHit(); } catch(e) {}

  // never go below 0
  if (this.health <= 0) {
    this.health = 0;
    gameState   = 'GAMEOVER';
    try { audio.playPlayerDeath(); } catch(e) {}
    showGameOver();
  }
},

 canShoot() {
  return this.shootTimer >= this.shootCooldown && this.ammo > 0;
},

 resetShootTimer() {
    this.shootTimer = 0;
  },        // ← comma here

  fireBullet() {
    if (!this.canShoot()) return;

    const bx = this.x + Math.cos(this.angle) * (this.radius + 6);
    const by = this.y + Math.sin(this.angle) * (this.radius + 6);

    world.bullets.push({
      x:       bx,
      y:       by,
      vx:      Math.cos(this.angle) * BULLET_SPEED,
      vy:      Math.sin(this.angle) * BULLET_SPEED,
      owner:   'player',
      damage:  BULLET_DAMAGE * this.damageMult,
      bounces: BULLET_BOUNCES,
      radius:  BULLET_RADIUS,
      active:  true
    });

    this.ammo--;
    this.resetShootTimer();
    try { audio.playShoot(); } catch(e) {}
  },

  activatePowerup() {
    if (this.collectedPowerups.length === 0) return;
    const type        = this.collectedPowerups.shift();
    this.activePowerup = type;
    this.powerupTimer  = type === 'SHIELD' ? SHIELD_DURATION :
                         type === 'SPEED'  ? SPEED_DURATION  :
                                             INVIS_DURATION;
    if (type === 'SPEED') this.speed = PLAYER_SPEED * 2;
  }

  // ← closing brace of the entire player object
};