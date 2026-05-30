function templateRect(x, y, w, h) {
  return [
    { x1: x,   y1: y,   x2: x+w, y2: y   },
    { x1: x+w, y1: y,   x2: x+w, y2: y+h },
    { x1: x+w, y1: y+h, x2: x,   y2: y+h },
    { x1: x,   y1: y+h, x2: x,   y2: y   }
  ];
}

function templateLShape(x, y) {
  const w = 300, h = 320, mid = 160;
  return [
    { x1: x,       y1: y,     x2: x+w,     y2: y     },
    { x1: x+w,     y1: y,     x2: x+w,     y2: y+mid },
    { x1: x+w,     y1: y+mid, x2: x+w*1.5, y2: y+mid },
    { x1: x+w*1.5, y1: y+mid, x2: x+w*1.5, y2: y+h   },
    { x1: x+w*1.5, y1: y+h,   x2: x,       y2: y+h   },
    { x1: x,       y1: y+h,   x2: x,       y2: y     }
  ];
}

function templateWide(x, y) {
  return templateRect(x, y, 500, 200);
}

function templateTall(x, y) {
  return templateRect(x, y, 180, 420);
}

function templateTShape(x, y) {
  const tw = 400, th = 160, sw = 160, sh = 200;
  const sx = x + (tw - sw) / 2;
  return [
    { x1: x,     y1: y,        x2: x+tw,  y2: y        },
    { x1: x+tw,  y1: y,        x2: x+tw,  y2: y+th     },
    { x1: x+tw,  y1: y+th,     x2: sx+sw, y2: y+th     },
    { x1: sx+sw, y1: y+th,     x2: sx+sw, y2: y+th+sh  },
    { x1: sx+sw, y1: y+th+sh,  x2: sx,    y2: y+th+sh  },
    { x1: sx,    y1: y+th+sh,  x2: sx,    y2: y+th     },
    { x1: sx,    y1: y+th,     x2: x,     y2: y+th     },
    { x1: x,     y1: y+th,     x2: x,     y2: y        }
  ];
}

class Room {
  constructor(id, x, y, depth, templateName) {
    this.id           = id;
    this.x            = x;
    this.y            = y;
    this.depth        = depth;
    this.templateName = templateName;
    this.walls        = [];
    this.doors        = [];
    this.enemies      = [];
    this.loot         = [];
    this.isLocked     = false;
    this.isCleared    = false;
    this.playerInside = false;

    this.width  = templateName === 'wide' ? 500 :
                  templateName === 'tall' ? 180 :
                  templateName === 'T'    ? 400 : 300;
    this.height = templateName === 'wide' ? 200 :
                  templateName === 'tall' ? 420 :
                  templateName === 'T'    ? 360 : 320;

    this.generateWalls(templateName);
    this.spawnEnemies();
  }

  generateWalls(template) {
    if (template === 'rect') this.walls = templateRect(this.x, this.y, this.width, this.height);
    if (template === 'L')    this.walls = templateLShape(this.x, this.y);
    if (template === 'wide') this.walls = templateWide(this.x, this.y);
    if (template === 'tall') this.walls = templateTall(this.x, this.y);
    if (template === 'T')    this.walls = templateTShape(this.x, this.y);
  }

  
 addDoor(x, y, toRoomId, direction) {
  this.doors.push({ x, y, toRoomId, direction, width: DOOR_WIDTH });

 
  this.walls = this.walls.filter(w => {
    const midX = (w.x1 + w.x2) / 2;
    const midY = (w.y1 + w.y2) / 2;
    const dist = Math.sqrt((midX - x) ** 2 + (midY - y) ** 2);
    return dist > DOOR_WIDTH * 0.8;
  });
}

  spawnEnemies() {
    const count = Math.min(Math.ceil(this.depth * 0.8), 6);

    for (let i = 0; i < count; i++) {
      const padding = 40;
      const ex = this.x + padding + Math.random() * (this.width  - padding * 2);
      const ey = this.y + padding + Math.random() * (this.height - padding * 2);

      let type = 'grunt';
      if (this.depth >= 2 && Math.random() < 0.3) type = 'tank';
      if (this.depth >= 3 && Math.random() < 0.2) type = 'sniper';

      this.enemies.push(new Enemy(ex, ey, type, this.depth));
    }
  }

  update(dt) {
  this.enemies.forEach(e => e.update(dt));

  
  if (this.isLocked && this.enemies.length > 0 && this.enemies.every(e => e.isDead)) {
    this.isLocked  = false;
    this.isCleared = true;
    setTimeout(() => shop.open(), 800);  // open shop 0.8s after room clears
  }

  this.loot.forEach(l => l.update(dt));

  this.loot = this.loot.filter(l => {
    const dx   = l.x - player.x;
    const dy   = l.y - player.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < player.radius + l.radius) {
      l.collect(player);
      return false;
    }
    return true;
  });
  }

  draw(ctx) {
    
    ctx.fillStyle = FLOOR_COLOR;
    ctx.beginPath();
    if (this.walls.length > 0) {
      ctx.moveTo(this.walls[0].x1, this.walls[0].y1);
      this.walls.forEach(w => ctx.lineTo(w.x2, w.y2));
      ctx.closePath();
      ctx.fill();
    }

   
    this.doors.forEach(d => {
      ctx.fillStyle = this.isLocked ? '#e74c3c' : '#f1c40f';
      ctx.fillRect(d.x - DOOR_WIDTH / 2, d.y - 8, DOOR_WIDTH, 16);
      ctx.fillStyle = '#000';
      ctx.font      = '9px Courier New';
      ctx.textAlign = 'center';
      ctx.fillText(this.isLocked ? 'LOCKED' : 'OPEN', d.x, d.y + 3);
      ctx.textAlign = 'left';
    });

   
    ctx.strokeStyle = WALL_COLOR;
    ctx.lineWidth   = 4;
    this.walls.forEach(w => {
      ctx.beginPath();
      ctx.moveTo(w.x1, w.y1);
      ctx.lineTo(w.x2, w.y2);
      ctx.stroke();
    });

    this.loot.forEach(l => l.draw(ctx));
    this.enemies.forEach(e => e.draw(ctx));
  }

  onPlayerEnter() {
    if (!this.isCleared) {
      this.isLocked     = true;
      this.playerInside = true;
      this.enemies.forEach(e => e.alerted = true);
    }
  }
}