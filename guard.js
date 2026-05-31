class Guard {
  constructor(x, y, patrolPoints, depth) {
    this.x            = x;
    this.y            = y;
    this.patrolPoints = patrolPoints;
    this.patrolIndex  = 0;
    this.depth        = depth;
    this.speed        = GUARD_SPEED * Math.pow(1.05, depth);
    this.health       = 50;
    this.radius       = 11;
    this.angle        = 0;
    this.state        = 'PATROL';
    this.shootTimer   = 0;
    this.isImmortal   = true;
    
  }

  update(dt, bullets) {
    this.checkPlayerDetection();

    if (this.state === 'PATROL') {
      this.patrol(dt);
    } else {
      this.alertBehavior(dt, bullets);
    }
  }

  checkPlayerDetection() {
  const dx   = player.x - this.x;
  const dy   = player.y - this.y;
  const dist = Math.sqrt(dx * dx + dy * dy);

  const detectRange = (player.activePowerup === 'INVIS') 
    ? 40 
    : 150; // reduced from 200 so guards actually patrol

  if (dist < detectRange && this.state !== 'ALERT') {
    try { audio.playGuardAlert(); } catch(e) {}
    this.state = 'ALERT';
  } else if (dist > 250) {
    this.state = 'PATROL';
  }
}

  patrol(dt) {
    const target = this.patrolPoints[this.patrolIndex];
    const dx     = target.x - this.x;
    const dy     = target.y - this.y;
    const dist   = Math.sqrt(dx*dx + dy*dy);

    if (dist < 8) {
      
      this.patrolIndex = (this.patrolIndex + 1) % this.patrolPoints.length;
    } else {
      
      this.x    += (dx / dist) * this.speed * dt;
      this.y    += (dy / dist) * this.speed * dt;
      this.angle = Math.atan2(dy, dx);
    }
  }

  alertBehavior(dt, bullets) {
    
    const dx = player.x - this.x;
    const dy = player.y - this.y;
    this.angle = Math.atan2(dy, dx);

    
    this.shootTimer += dt;

    const dist = Math.sqrt(dx*dx + dy*dy);

    
    if (dist < GUARD_SHOOT_RANGE && this.shootTimer >= GUARD_SHOOT_COOLDOWN) {
      this.shoot(bullets);
      this.shootTimer = 0;
    }
  }

  shoot(bullets) {
    
    bullets.push({
      x:       this.x + Math.cos(this.angle) * (this.radius + 6),
      y:       this.y + Math.sin(this.angle) * (this.radius + 6),
      vx:      Math.cos(this.angle) * BULLET_SPEED * 0.7,
      vy:      Math.sin(this.angle) * BULLET_SPEED * 0.7,
      owner:   'guard',
      damage:  GUARD_BULLET_DAMAGE,
      bounces: 0,        
      radius:  BULLET_RADIUS,
      active:  true
    });
  }

  draw(ctx) {
    
    ctx.fillStyle = (this.state === 'ALERT') ? '#1a6fd4' : '#2980b9';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();

   
    ctx.strokeStyle = '#ecf0f1';
    ctx.lineWidth   = 2;
    ctx.stroke();

    
    ctx.fillStyle   = '#fff';
    ctx.font        = 'bold 9px Courier New';
    ctx.textAlign   = 'center';
    ctx.fillText('G', this.x, this.y + 3);
    ctx.textAlign   = 'left';

    
    ctx.strokeStyle = (this.state === 'ALERT') ? '#e74c3c' : '#7fb3d3';
    ctx.lineWidth   = 2;
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    ctx.lineTo(
      this.x + Math.cos(this.angle) * 18,
      this.y + Math.sin(this.angle) * 18
    );
    ctx.stroke();

   
    if (this.state === 'ALERT') {
      ctx.strokeStyle = 'rgba(231, 76, 60, 0.3)';
      ctx.lineWidth   = 1;
      ctx.beginPath();
      ctx.moveTo(this.x, this.y);
      ctx.arc(this.x, this.y, GUARD_DETECT_RANGE, this.angle - 0.6, this.angle + 0.6);
      ctx.closePath();
      ctx.stroke();
    }
  }
}