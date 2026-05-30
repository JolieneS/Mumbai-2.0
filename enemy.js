class Enemy {
  constructor(x, y, type, depth) {
    this.x     = x;
    this.y     = y;
    this.type  = type;
    this.depth = depth;
    this.angle = Math.random() * Math.PI * 2;
    this.state = 'IDLE';
    this.isDead   = false;
    this.alerted  = false;
    this.idleTimer    = 0;
    this.alertTimer   = 0;
    this.shootTimer   = 0;
    this.patrolIndex  = 0;

    this.activationDelay = 1.5;
    this.activationTimer = 0;

    const depthSpeedMult  = Math.pow(DIFFICULTY_SPEED_MULT,  depth - 1);
    const depthHealthMult = Math.pow(DIFFICULTY_HEALTH_MULT, depth - 1);

    if (type === 'grunt') {
      this.radius        = 10;
      this.maxHealth     = 30  * depthHealthMult;
      this.speed         = 90  * depthSpeedMult;
      this.shootCooldown = 1.2;
      this.shootRange    = 200;
      this.detectRange   = 180;
      this.arcAngle      = 1.2;
      this.damage        = 10;
      this.color         = '#cc2222';

    } else if (type === 'tank') {
      this.radius        = 14;
      this.maxHealth     = 80  * depthHealthMult;
      this.speed         = 50  * depthSpeedMult;
      this.shootCooldown = 2.0;
      this.shootRange    = 150;
      this.detectRange   = 140;
      this.arcAngle      = 1.8;
      this.damage        = 25;
      this.color         = '#8b0000';

    } else if (type === 'sniper') {
      this.radius        = 9;
      this.maxHealth     = 20  * depthHealthMult;
      this.speed         = 60  * depthSpeedMult;
      this.shootCooldown = 3.0;
      this.shootRange    = 350;
      this.detectRange   = 300;
      this.arcAngle      = 0.6;
      this.damage        = 35;
      this.color         = '#6a0dad';
    }

    this.health = this.maxHealth;

    this.patrolPoints = [
      { x: this.x - 60, y: this.y },
      { x: this.x + 60, y: this.y }
    ];
  }

  update(dt) {
    if (this.isDead) return;

    if (this.activationTimer < this.activationDelay) {
      this.activationTimer += dt;
      return;
    }

    if (this.alerted && this.state === 'IDLE') {
      this.state = 'ALERT';
    }

    this.runState(dt);
    this.checkBulletHits();
  }

  runState(dt) {

    this.doStationary(dt);
  }

  doStationary(dt) {
  const dx   = player.x - this.x;
  const dy   = player.y - this.y;
  const dist = Math.sqrt(dx * dx + dy * dy);

  this.angle = Math.atan2(dy, dx);

  
  const myRoom     = world.getRoomAt(this.x, this.y);
  const playerRoom = world.getRoomAt(player.x, player.y);
  const sameRoom   = myRoom && playerRoom && myRoom.id === playerRoom.id;

  if (sameRoom && dist < this.shootRange) {
    this.shootTimer += dt;
    if (this.shootTimer >= this.shootCooldown) {
      this.shoot();
      this.shootTimer = 0;
    }
  }
}

 
  doIdle(dt)   {}
  doPatrol(dt) {}
  doAlert(dt)  {}
  doChase(dt)  {}
  doAttack(dt) {}

  canSeePlayer() {
    const dx   = player.x - this.x;
    const dy   = player.y - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > this.detectRange) return false;

    const angleToPlayer = Math.atan2(dy, dx);
    let   angleDiff     = Math.abs(angleToPlayer - this.angle);
    if (angleDiff > Math.PI) angleDiff = Math.PI * 2 - angleDiff;

    return angleDiff < this.arcAngle / 2;
  }

  shoot() {
    world.bullets.push({
      x:       this.x + Math.cos(this.angle) * (this.radius + 6),
      y:       this.y + Math.sin(this.angle) * (this.radius + 6),
      vx:      Math.cos(this.angle) * BULLET_SPEED * 0.8,
      vy:      Math.sin(this.angle) * BULLET_SPEED * 0.8,
      owner:   'enemy',
      damage:  this.damage,
      bounces: 1,
      radius:  BULLET_RADIUS,
      active:  true
    });
  }

  checkBulletHits() {
    world.bullets.forEach(b => {
      if (b.owner !== 'player' || !b.active) return;

      const dx   = b.x - this.x;
      const dy   = b.y - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < this.radius + b.radius) {
        this.takeDamage(b.damage);
        b.active = false;
       
        try { audio.playHitEnemy(); } catch(e) {}
      }
    });
  }

  takeDamage(amount) {
    this.health -= amount;

    
    player.score = (player.score || 0) + 5;

    if (this.health <= 0) {
      this.health = 0;
      this.isDead = true;
      this.state  = 'DEAD';

      
      const killScore = this.type === 'tank'   ? 100 :
                        this.type === 'sniper' ? 80  : 50;
      player.score += killScore;

      try { audio.playEnemyDeath(); } catch(e) {}
      this.onDeath();
    }

    if (this.health <= 0) {
  this.health = 0;
  this.isDead = true;
  this.state  = 'DEAD';

  const killScore = this.type === 'tank'   ? 100 :
                    this.type === 'sniper' ? 80  : 50;
  player.score += killScore;

  
  try { world.addKillFlash(this.x, this.y); } catch(e) {}
  try { audio.playEnemyDeath(); } catch(e) {}
  this.onDeath();
}
  }

  onDeath() {
    const coinValue = this.type === 'tank'   ? 30 :
                      this.type === 'sniper' ? 25 : 15;

    const room = world.getRoomAt(this.x, this.y);
    if (room) {
      room.loot.push(new Loot(this.x, this.y, 'coin', coinValue));

     
      if (Math.random() < 0.3) {
        room.loot.push(new Loot(
          this.x + 20, this.y,
          'ammo', AMMO_PACK_AMOUNT
        ));
      }

      
      if (Math.random() < 0.15) {
        const powerups = ['SHIELD', 'SPEED', 'INVIS'];
        const pick     = powerups[Math.floor(Math.random() * powerups.length)];
        room.loot.push(new Loot(
          this.x - 20, this.y,
          'powerup', pick
        ));
      }
    }
  }

  draw(ctx) {
    if (this.isDead) return;

    
    ctx.fillStyle = this.state === 'ATTACK' ? 'rgba(255,0,0,0.06)'   :
                    this.state === 'CHASE'  ? 'rgba(255,100,0,0.05)' :
                                              'rgba(255,255,0,0.03)';
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    ctx.arc(
      this.x, this.y,
      this.detectRange,
      this.angle - this.arcAngle / 2,
      this.angle + this.arcAngle / 2
    );
    ctx.closePath();
    ctx.fill();

    
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();

    
    ctx.strokeStyle = '#fff';
    ctx.lineWidth   = 2;
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    ctx.lineTo(
      this.x + Math.cos(this.angle) * (this.radius + 8),
      this.y + Math.sin(this.angle) * (this.radius + 8)
    );
    ctx.stroke();

   
    const bw = this.radius * 2.5;
    const bx = this.x - bw / 2;
    const by = this.y - this.radius - 10;

    ctx.fillStyle = '#333';
    ctx.fillRect(bx, by, bw, 4);

    const pct = this.health / this.maxHealth;
    ctx.fillStyle = pct > 0.5 ? '#2ecc71' : '#e74c3c';
    ctx.fillRect(bx, by, bw * pct, 4);
  }
}