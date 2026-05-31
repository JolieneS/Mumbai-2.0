const world = {
  rooms:         [],
  guards:        [],
  bullets:       [],
  corridorLoot:  [],
  killFlashes:   [],
  currentRoomId: null,
  depth:         1,
  worldHeight:   0,

  init() {
    this.rooms        = [];
    this.guards       = [];
    this.bullets      = [];
    this.corridorLoot = [];
    this.killFlashes  = [];

    const templates = ['rect', 'L', 'wide', 'tall', 'T'];
    let yPos = 200;

    for (let i = 0; i < 12; i++) {
      const template = templates[Math.floor(Math.random() * templates.length)];
      const maxX     = Math.max(100, canvas.width - 520);
      const roomX    = 80 + Math.floor(Math.random() * maxX);
      const room     = new Room(i, roomX, yPos, i + 1, template);

      // entry door at TOP of room
      room.addDoor(
        room.x + room.width / 2,
        room.y,
        i - 1,
        'top'
      );

      // exit door at BOTTOM — leads to next room
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

    // player starts ABOVE first room in corridor
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
    const roomA = this.rooms[i];
    const depth = roomA.depth;

    // guards only from depth 4 onwards, max 2 ever
    if (depth < 4) continue;

    const corridorY    = roomA.y + roomA.height + 40;
    const corridorMidX = roomA.x + roomA.width  / 2;

    // just 1 guard per corridor until depth 7, then 2
    const guardCount = depth >= 7 ? 2 : 1;

    for (let g = 0; g < guardCount; g++) {
      const offsetX = g === 0 ? -40 : 40;
      const patrol  = [
        { x: corridorMidX + offsetX - 40, y: corridorY + 20 },
        { x: corridorMidX + offsetX + 40, y: corridorY + 60 }
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

    // entry door at top
    room.addDoor(
      room.x + room.width / 2,
      room.y,
      newId - 1,
      'top'
    );

    // exit door at bottom
    room.addDoor(
      room.x + room.width / 2,
      room.y + room.height,
      newId + 1,
      'bottom'
    );

    this.rooms.push(room);
    this.worldHeight = newY + room.height + 80;
    this.depth       = newDepth;

    // spawn coins in new corridor
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

  addKillFlash(x, y) {
    this.killFlashes.push({ x, y, timer: 1.0 });
  },

  update(dt) {
    // stop all updates if game is not playing
    if (gameState !== 'PLAYING') return;

    // update all rooms
    this.rooms.forEach(r => r.update(dt));

    // wall collision — check all rooms within 600px of player
    // prevents walking through walls near room boundaries
    const allNearbyWalls = [];
    this.rooms.forEach(r => {
      const dx   = (r.x + r.width  / 2) - player.x;
      const dy   = (r.y + r.height / 2) - player.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 600) {
        r.walls.forEach(w => allNearbyWalls.push(w));
      }
    });
    if (allNearbyWalls.length > 0) {
      resolvePlayerWall(allNearbyWalls);
    }

    // update guards
    this.guards.forEach(g => g.update(dt, this.bullets));

    // update and filter bullets
    this.bullets = this.bullets.filter(b => b.active);
    this.bullets.forEach(b => this.updateBullet(b, dt));

    // update kill flashes
    this.killFlashes = this.killFlashes.filter(f => {
      f.timer -= dt;
      return f.timer > 0;
    });

    // corridor loot collection
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

    // track which room player is in
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
      // player is in corridor
      // check exit doors of cleared rooms to move to next room
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
              player.x           = nextRoom.x + nextRoom.width / 2;
              player.y           = nextRoom.y + 60;
              player_position_x  = player.x;
              player_position_y  = player.y;
              this.currentRoomId = nextRoom.id;
              nextRoom.onPlayerEnter();
            }
          }
        });
      });
    }

    // player hit by enemy or guard bullet
    // player hit by enemy or guard bullet
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

    // deactivate if out of world bounds
    if (b.y > this.worldHeight + 200) b.active = false;
    if (b.y < -200)                    b.active = false;
    if (b.x < -500)                    b.active = false;
    if (b.x > canvas.width + 500)      b.active = false;
  },

  draw(ctx) {
    // draw corridor paths between rooms
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

    // draw rooms
    this.rooms.forEach(r => {
      if (camera.isOnScreen(r.x + r.width / 2, r.y + r.height / 2, 400)) {
        r.draw(ctx);
      }
    });

    // draw corridor loot
    this.corridorLoot.forEach(l => l.draw(ctx));

    // draw guards
    this.guards.forEach(g => {
      if (camera.isOnScreen(g.x, g.y)) g.draw(ctx);
    });

    // draw bullets
    this.bullets.forEach(b => {
      if (!b.active) return;
      ctx.fillStyle = b.owner === 'guard'  ? '#3498db' :
                      b.owner === 'player' ? '#ffffff'  : '#ff6600';
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
      ctx.fill();
    });

    // draw kill flashes — rises upward and fades out
    this.killFlashes.forEach(f => {
      ctx.save();
      ctx.globalAlpha = f.timer;
      ctx.fillStyle   = '#e74c3c';
      ctx.font        = 'bold 18px Courier New';
      ctx.textAlign   = 'center';
      ctx.fillText('KILLED', f.x, f.y - (1 - f.timer) * 40);
      ctx.globalAlpha = 1;
      ctx.restore();
    });
  }
};