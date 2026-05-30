const world = {
  rooms:         [],
  guards:        [],
  bullets:       [],
  corridorLoot:  [],
  currentRoomId: null,
  depth:         1,
  worldHeight:   0,
  killFlashes: [],

  init() {
    this.rooms        = [];
    this.guards       = [];
    this.bullets      = [];
    this.corridorLoot = [];
    this.killFlashes = [];
   
this.killFlashes = this.killFlashes.filter(f => {
  f.timer -= dt;
  return f.timer > 0;
});

    const templates = ['rect', 'L', 'wide', 'tall', 'T'];
    let yPos = 200;

    for (let i = 0; i < 12; i++) {
      const template = templates[Math.floor(Math.random() * templates.length)];
      const maxX     = Math.max(100, canvas.width - 520);
      const roomX    = 80 + Math.floor(Math.random() * maxX);
      const room     = new Room(i, roomX, yPos, i + 1, template);

      
      room.addDoor(
        room.x + room.width / 2,
        room.y,
        i - 1,
        'top'

        
      );

      
      if (i < 11) {
        room.addDoor(
          room.x + room.width / 2,
          room.y + room.height,
          i + 1,
          'bottom'
        );
      }

      this.rooms.push(room);
      yPos += room.height + 80;
    }

    this.worldHeight = yPos;
    this.placeCorridorGuards();
    this.spawnCorridorCoins();

   
    const startRoom   = this.rooms[0];
    player.x          = startRoom.x + startRoom.width / 2;
    player.y          = startRoom.y - 80;
    player_position_x = player.x;
    player_position_y = player.y;
  },

  spawnCorridorCoins() {
    for (let i = 0; i < this.rooms.length - 1; i++) {
      const roomA     = this.rooms[i];
      const corridorX = roomA.x + roomA.width / 2;
      const corridorY = roomA.y + roomA.height + 20;

      
      for (let c = 0; c < 3; c++) {
        const cx = corridorX + (Math.random() - 0.5) * 60;
        const cy = corridorY + Math.random() * 40;
        this.corridorLoot.push(new Loot(cx, cy, 'coin', 10));
      }
    }
  },

  placeCorridorGuards() {
    for (let i = 0; i < this.rooms.length - 1; i++) {
      const roomA    = this.rooms[i];
      const depth    = roomA.depth;

     
      if (depth < 3) continue;

      const corridorY    = roomA.y + roomA.height;
      const corridorMidX = roomA.x + roomA.width / 2;
      const guardCount   = 1 + Math.floor((depth - 2) / 2);

      for (let g = 0; g < guardCount; g++) {
        const offsetX = (g - (guardCount - 1) / 2) * 80;
        const patrol  = [
          { x: corridorMidX + offsetX - 50, y: corridorY + 40  },
          { x: corridorMidX + offsetX + 50, y: corridorY + 110 }
        ];
        this.guards.push(new Guard(
          patrol[0].x, patrol[0].y,
          patrol,
          depth
        ));
      }
    }
  },

  generateNextRoom() {
    const templates = ['rect', 'L', 'wide', 'tall', 'T'];
    const template  = templates[Math.floor(Math.random() * templates.length)];
    const lastRoom  = this.rooms[this.rooms.length - 1];
    const newY      = lastRoom.y + lastRoom.height + 80;
    const newDepth  = this.depth + 1;
    const newId     = this.rooms.length;
    const maxX      = Math.max(100, canvas.width - 520);
    const roomX     = 80 + Math.floor(Math.random() * maxX);

    const room = new Room(newId, roomX, newY, newDepth, template);

    room.addDoor(
      room.x + room.width / 2,
      room.y,
      newId - 1,
      'top'
    );

   
    room.addDoor(
      room.x + room.width / 2,
      room.y + room.height,
      newId + 1,
      'bottom'
    );

    this.rooms.push(room);
    this.worldHeight = newY + room.height + 80;
    this.depth       = newDepth;

    
    const corridorX = room.x + room.width / 2;
    const corridorY = room.y + room.height + 20;
    for (let c = 0; c < 3; c++) {
      const cx = corridorX + (Math.random() - 0.5) * 60;
      const cy = corridorY + Math.random() * 40;
      this.corridorLoot.push(new Loot(cx, cy, 'coin', 10));
    }

    this.placeCorridorGuards();
  },

  getCurrentRoomWalls() {
    const room = this.getRoomAt(player.x, player.y);
    return room ? room.walls : [];
  },

  getRoomAt(x, y) {
    return this.rooms.find(r =>
      x > r.x && x < r.x + r.width &&
      y > r.y && y < r.y + r.height
    ) || null;
  },

  update(dt) {
    
    if (gameState !== 'PLAYING') return;

    
    this.rooms.forEach(r => r.update(dt));

    
    const currentRoom = this.getRoomAt(player.x, player.y);
    if (currentRoom) {
      resolvePlayerWall(currentRoom.walls);
    }

    
this.killFlashes = this.killFlashes.filter(f => {
  f.timer -= dt;
  return f.timer > 0;
});

    
    this.guards.forEach(g => g.update(dt, this.bullets));

   
    this.bullets = this.bullets.filter(b => b.active);
    this.bullets.forEach(b => this.updateBullet(b, dt));

    
    this.corridorLoot = this.corridorLoot.filter(l => {
      l.update(dt);
      const dx   = l.x - player.x;
      const dy   = l.y - player.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < player.radius + l.radius) {
        l.collect(player);
        return false;
      }
      return true;
    });

    
    const room = this.getRoomAt(player.x, player.y);
    if (room) {
      if (this.currentRoomId !== room.id) {
        this.currentRoomId = room.id;
        room.onPlayerEnter();
        this.depth = room.depth;
        if (room.id >= this.rooms.length - 2) {
          this.generateNextRoom();
        }
      }
    } else {
      
      this.rooms.forEach(r => {
        r.doors.forEach(d => {
          if (d.direction !== 'bottom') return; 
          if (!r.isCleared) return;             
          const dx   = player.x - d.x;
          const dy   = player.y - d.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 25 && d.toRoomId < this.rooms.length && d.toRoomId >= 0) {
            const nextRoom = this.rooms[d.toRoomId];
            if (nextRoom) {
              player.x          = nextRoom.x + nextRoom.width / 2;
              player.y          = nextRoom.y + 60;
              player_position_x = player.x;
              player_position_y = player.y;
              this.currentRoomId = nextRoom.id;
              nextRoom.onPlayerEnter();
            }
          }
        });
      });
    }

   
    this.bullets.forEach(b => {
      if (b.owner === 'player' || !b.active) return;
      const dx   = b.x - player.x;
      const dy   = b.y - player.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < player.radius + b.radius) {
        if (player.activePowerup !== 'SHIELD') {
          player.takeDamage(b.damage);
        }
        b.active = false;
      }
    });
  },

  updateBullet(b, dt) {
    b.x += b.vx * dt;
    b.y += b.vy * dt;

    const room = this.getRoomAt(b.x, b.y);
    if (room) {
      room.walls.forEach(w => {
        if (bulletHitsSegment(b, w)) {
          if (b.bounces > 0) {
            reflectBullet(b, w);
            b.bounces--;
          } else {
            b.active = false;
          }
        }
      });
    }

    
    if (b.y > this.worldHeight + 200) b.active = false;
    if (b.y < -200)                    b.active = false;
    if (b.x < -500)                    b.active = false;
    if (b.x > canvas.width + 500)      b.active = false;
  },

  draw(ctx) {
    
    for (let i = 0; i < this.rooms.length - 1; i++) {
      const a = this.rooms[i];
      const b = this.rooms[i + 1];

      ctx.strokeStyle = '#111122';
      ctx.lineWidth   = CORRIDOR_WIDTH;
      ctx.beginPath();
      ctx.moveTo(a.x + a.width / 2, a.y + a.height);
      ctx.lineTo(b.x + b.width / 2, b.y);
      ctx.stroke();

      
      ctx.strokeStyle = '#1a1a3a';
      ctx.lineWidth   = 2;
      ctx.stroke();
    }

    
    this.rooms.forEach(r => {
      if (camera.isOnScreen(r.x + r.width / 2, r.y + r.height / 2, 400)) {
        r.draw(ctx);
      }
    });

   
    this.corridorLoot.forEach(l => l.draw(ctx));

    
    this.guards.forEach(g => {
      if (camera.isOnScreen(g.x, g.y)) g.draw(ctx);
    });

    
    this.bullets.forEach(b => {
      if (!b.active) return;
      ctx.fillStyle = b.owner === 'guard'  ? '#3498db' :
                      b.owner === 'player' ? '#ffffff'  : '#ff6600';
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
      ctx.fill();
    });

this.killFlashes.forEach(f => {
  const alpha = f.timer; // fades from 1 to 0
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle   = '#e74c3c';
  ctx.font        = 'bold 18px Courier New';
  ctx.textAlign   = 'center';
  
  ctx.fillText('KILLED', f.x, f.y - (1 - f.timer) * 40);
  ctx.globalAlpha = 1;
  ctx.restore();
});

  }
};