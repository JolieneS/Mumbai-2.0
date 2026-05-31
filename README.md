# Mumbai 2.0 🔫

> *"The city above is clean. Beneath it — chaos."*

A top-down underground combat game built entirely with **HTML5 Canvas API** and **Vanilla JavaScript** — no game engines, no external libraries, no shortcuts. Every system hand-crafted from scratch.

---

## 📸 Screenshots

### Intro Screen
<img width="1637" height="848" alt="Screenshot 2026-05-31 000315" src="https://github.com/user-attachments/assets/7b543685-5886-4e93-a8c0-23204b5d86f7" />


### Rules Page
<img width="1661" height="909" alt="Screenshot 2026-05-31 000334" src="https://github.com/user-attachments/assets/91136004-3e2d-4390-84be-0148c2675e64" />

### Gameplay — Room Combat

<img width="318" height="406" alt="image" src="https://github.com/user-attachments/assets/2ae7b19c-0989-4271-b6e3-1594b94f6de5" />

### Fog of War Vision
<img width="872" height="778" alt="Screenshot 2026-05-31 000444" src="https://github.com/user-attachments/assets/39b3d010-fa5b-4168-833a-0c32bab8c785" />

### Game Over Screen
<img width="1293" height="779" alt="image" src="https://github.com/user-attachments/assets/dac399c6-72e3-43c7-9f89-8a6beadc2228" />

---

## 🎮 How to Play

Open `index.html` in any modern browser. No server needed, no installation required.

| Key | Action |
|-----|--------|
| W / A / S / D | Move |
| Mouse | Aim |
| Left Click / Space | Shoot |
| Q | Activate collected powerup |
| P | Pause / Resume |
| E | Close shop |
| R | Restart after death |

### Objective
You are dropped into the underground mafia world of Mumbai 2.0. Navigate through interconnected rooms, eliminate hostile bots, collect coins, survive as long as possible. The deeper you go — the more dangerous it gets.

### Enemy Types
| Enemy | Color | Behavior |
|-------|-------|----------|
| Grunt | 🔴 Red | Fast, shoots often, low HP |
| Tank | 🟤 Dark Red | Slow, high HP, hits hard |
| Sniper | 🟣 Purple | Long range, slow fire, one-shot threat |
| Guard | 🔵 Blue | Patrols corridors, immortal, shoots on sight |

### Powerups
Collect them mid-game, activate with Q or click the HUD button.
- `SHIELD` — 5 seconds of invincibility
- `SPEED` — 2× movement speed for 4 seconds  
- `INVIS` — Guards lose detection for 6 seconds

---

## 🏗️ Architecture & Technical Documentation

### Rendering Flow

Every frame runs in this exact order:

```
gameLoop(timestamp)
  ├── update(dt)
  │     ├── player.update(dt)        — movement, aiming, shooting, powerups
  │     ├── camera.update(px, py)    — smooth lerp camera follow
  │     ├── world.update(dt)         — rooms, enemies, bullets, guards, loot
  │     └── gameTimer += dt          — live timer
  └── render()
        ├── ctx.fillRect()           — clear canvas each frame
        ├── camera.apply(ctx)        — translate to world space
        ├── world.draw(ctx)          — rooms, enemies, loot, guards, bullets
        ├── player.draw(ctx)         — player circle + gun barrel
        ├── camera.reset(ctx)        — restore to screen space
        ├── vision.draw(ctx)         — fog of war (offscreen canvas stamp)
        └── updateHUD()              — update DOM elements for stats
```

### Game Loop Structure

Uses `requestAnimationFrame` for 60fps target. Delta time (`dt`) calculated and capped at 50ms to prevent physics explosion on tab switch:

```js
function gameLoop(timestamp) {
  const dt = Math.min((timestamp - lastTime) / 1000, 0.05);
  lastTime = timestamp;
  if (gameState === 'PLAYING') update(dt);
  render();
  requestAnimationFrame(gameLoop);
}
```

All movement uses `position += velocity * dt` — frame-rate independent.

### State Management

Global `gameState` string controls what updates and renders:

```
'INTRO'    → HTML overlay, canvas idle
'RULES'    → HTML overlay, canvas idle  
'PLAYING'  → full update + render loop
'PAUSED'   → render only, update skipped
'SHOP'     → shop overlay drawn, world paused
'GAMEOVER' → HTML overlay with final stats
```

### Collision Detection Method

Player vs walls uses **circle-vs-line-segment** intersection:

1. For each wall segment AB, find closest point to player center using dot product:
   ```
   t = clamp(dot(P-A, B-A) / |B-A|², 0, 1)
   closest = A + t(B-A)
   ```
2. If `distance(player, closest) < radius` → collision detected
3. Push player out along collision normal by overlap depth
4. Run 3 passes per frame for stable corner resolution

Bullet vs wall uses `bulletHitsSegment()` — same closest-point check. On hit, bullet velocity is reflected using wall normal:
```
v = v - 2(v·n)n
```
Bullets bounce up to 3 times then deactivate.

### Vision / Raycasting System

Per-frame radial visibility using an **offscreen canvas** to avoid compositing issues:

1. Fill offscreen canvas with black (the fog)
2. Cast 120 rays from player position across 360° (or 135° cone forward)
3. Each ray uses ray-vs-segment intersection math:
   ```
   denom = dx*wy - dy*wx
   t = (tx*wy - ty*wx) / denom   ← distance along ray
   u = (tx*dy - ty*dx) / denom   ← position along wall
   hit if: t≥0 and 0≤u≤1
   ```
4. Ray endpoints form a lit polygon
5. Cut polygon out of fog using `destination-out` compositing
6. Stamp offscreen fog canvas onto main canvas after `camera.reset()`

This order is critical — fog must be in screen coordinates, drawn after camera transform is reset.

### Room Generation Logic

5 polygon templates, each defined as arrays of wall segments `{x1,y1,x2,y2}`:
- `rect` — 4 segments, standard rectangle
- `L` — 6 segments, L-shaped room
- `wide` — 4 segments, 500×200 wide room
- `tall` — 4 segments, 180×420 narrow room
- `T` — 8 segments, T-shaped room

Each run generates 12 rooms with randomised template and X position. Rooms stack vertically with 80px corridors. Two doors per room — entry at top, exit at bottom. Door positions remove the nearest wall segment so players can physically walk through.

Difficulty scales with depth:
```
enemyCount = ceil(depth × 0.8)  max 6
enemySpeed = baseSpeed  × 1.08^(depth-1)
enemyHP    = baseHP     × 1.10^(depth-1)
guardCount = appears from depth 3, scales up
```

### Audio System

All sounds generated programmatically using **Web Audio API** — no audio files needed:
- Shoot — square wave, frequency drop 800→200Hz over 80ms
- Hit enemy — sine wave, 300→80Hz over 100ms
- Player hit — sawtooth, 150→60Hz over 200ms
- Enemy death — sawtooth, 400→30Hz over 400ms
- Guard alert — 3 ascending square beeps
- Player death — dramatic sawtooth 200→20Hz over 1.5s
- Coin collect — sine double beep 1200→1600Hz
- Ambient drone — two detuned sine oscillators at 55Hz and 58Hz with LFO

---

## 📁 File Structure

```
Mumbai-2.0/
├── index.html          — canvas, HUD, intro/rules/gameover screens, script loading
├── css/
│   └── style.css       — fullscreen canvas, HUD panel, overlay screen styles
├── js/
│   ├── constants.js    — all game config: speeds, sizes, colors, difficulty values
│   ├── input.js        — keyboard + mouse state tracking (keydown/up/mousemove)
│   ├── collision.js    — circle-vs-segment math, player wall resolution
│   ├── loot.js         — coin, ammo pack, powerup collectibles with bob animation
│   ├── audio.js        — Web Audio API procedural sound engine
│   ├── player.js       — player entity: movement, aiming, shooting, powerups, health
│   ├── camera.js       — smooth lerp follow camera, world-to-screen conversion
│   ├── vision.js       — raycasting fog of war using offscreen canvas
│   ├── enemy.js        — enemy AI: stationary + shoot, 3 types, difficulty scaling
│   ├── room.js         — Room class, 5 polygon templates, door system, loot spawning
│   ├── guard.js        — corridor guard AI: patrol, alert, shoot, immortal
│   ├── shop.js         — between-room upgrade shop, clickable items
│   ├── world.js        — world container: room/guard/bullet management, corridor coins
│   └── game.js         — game loop, state machine, HUD updates, screen transitions
└── README.md
```

---

## 🛠️ Technical Constraints Met

- ✅ Pure HTML Canvas API — zero game engines (no Phaser, PixiJS, Three.js)
- ✅ No external libraries of any kind
- ✅ Hand-implemented game loop with delta time
- ✅ Hand-implemented collision detection
- ✅ Hand-implemented raycasting vision system
- ✅ Hand-implemented enemy AI state machine
- ✅ Hand-implemented bullet physics with wall reflection
- ✅ Hand-implemented procedural room generation
- ✅ Hand-implemented audio using Web Audio API oscillators
- ✅ Runs directly in browser — open index.html, no build step

---

## 📋 Steps Followed — Full Development Log

### Phase 1 — Project Skeleton

Created the folder structure from scratch:
```
Mumbai-2.0/
├── index.html
├── css/style.css
└── js/constants.js, game.js
```

Built `index.html` with a single `<canvas id="gameCanvas">` tag as the entire game screen, a `<div id="hud">` overlay for live stats, and `<script>` tags loading JS files in dependency order.

Set up `style.css` to make the canvas fill 100vw × 100vh, removed all browser default margins, and set `overflow: hidden` to prevent scrollbars.

Created `constants.js` as the single source of truth for all game values — player speed, bullet speed, enemy stats, difficulty multipliers, colors. Any change to a game value is made here once.

Built the `game.js` entry point with `window.onload = init`, the `requestAnimationFrame` game loop, and empty `update(dt)` / `render()` functions ready to receive systems.

**Result:** Yellow dot appeared on a dark purple canvas. Engine confirmed running.

---

### Phase 2 — Input System + Player Movement

Created `input.js` — an object with a `keys{}` map updated by `keydown`/`keyup` events. Holding W sets `keys['w'] = true`, releasing sets it `false`. Mouse position tracked via `mousemove`. Left click tracked via `mousedown`/`mouseup`. Dedicated `isSpaceDown` flag added for space bar with `e.preventDefault()` to stop page scrolling.

Created `player.js` — the player object with position, health, ammo, speed, angle, shoot cooldown. `update(dt)` reads from `input.keys` to build velocity vector, normalizes diagonal movement by multiplying by `0.707` to keep consistent speed, applies `position += velocity * speed * dt` for frame-rate independence.

Facing angle calculated with `Math.atan2(mouseY - player.y, mouseX - player.x)` — gives the radian angle from player to mouse cursor every frame.

Gun barrel drawn as a line from player center using `Math.cos(angle) * 18` and `Math.sin(angle) * 18`.

Added screen boundary clamp so player can never exit screen horizontally.

**Result:** Yellow dot moved with WASD, gun barrel rotated to follow mouse.

---

### Phase 3 — Camera System

Created `camera.js` — a camera object with `x, y` position representing the top-left of what's visible.

Each frame: calculate target position as `player.x - canvas.width/2` (centering player on screen), then lerp toward it: `camera.x += (target - camera.x) * 0.12`. This creates smooth follow — camera accelerates toward player and decelerates as it closes in.

`camera.apply(ctx)` calls `ctx.save()` then `ctx.translate(-camera.x, -camera.y)` before drawing the world. `camera.reset(ctx)` calls `ctx.restore()` after. Everything drawn between apply and reset is in world coordinates. Everything after reset is in screen coordinates.

Added `isOnScreen(worldX, worldY)` to skip rendering objects far from the camera — performance optimization.

**Result:** Camera followed player smoothly as they moved through the world.

---

### Phase 4 — Room System + World

Created `room.js` with 5 polygon template functions, each returning arrays of wall segments `{x1, y1, x2, y2}`:
- `templateRect` — 4 walls
- `templateLShape` — 6 walls, L-shaped  
- `templateWide` — wide short room
- `templateTall` — narrow tall room
- `templateTShape` — 8 walls, T-shaped

`Room` class stores walls, doors, enemies, loot, locked/cleared state. `addDoor()` physically removes the nearest wall segment at the door position so players can walk through.

`spawnEnemies()` called in constructor — count scales with depth, type distribution skews toward harder enemies at greater depth.

Created `world.js` — the container holding all rooms, guards, bullets, corridor loot. `init()` generates 12 rooms with random templates at randomised X positions, stacking vertically with 80px corridors. Two doors per room — entry at top, exit at bottom. Player starts 80px above room 0.

Corridor drawing uses a thick `lineWidth = CORRIDOR_WIDTH` line connecting room centers — creates the visual tunnel between rooms.

**Result:** Multiple irregularly shaped green rooms appeared, stacked vertically with dark corridors connecting them.

---

### Phase 5 — Wall Collision

Created `collision.js` with `closestPointOnSegment()` using dot product projection, `circleVsSegment()` returning collision normal and depth, and `resolvePlayerWall()` running 3 resolution passes per frame.

The 3-pass approach handles corner cases — if a player is wedged between two walls, single-pass resolution isn't enough. Three passes ensure the player is fully pushed clear.

Buffer of 1.5px added beyond the exact overlap depth to prevent the player from being right on the wall boundary and jittering.

**Result:** Player could no longer walk through walls. Sliding along walls worked correctly.

---

### Phase 6 — Shooting System + Ammo

Added `fireBullet()` to `player.js`. Spawns a bullet object at the gun barrel tip (`player center + cos(angle) * (radius + 6)`), pushes it to `world.bullets[]`. Bullet has `vx, vy` from `cos/sin * BULLET_SPEED`, `bounces: 3`, `owner: 'player'`, `damage`, `active: true`.

`canShoot()` checks both `shootTimer >= shootCooldown` AND `ammo > 0`. Added `hasMovedOnce` flag — shooting blocked until player moves, preventing accidental shots on game start.

`updateBullet()` in world moves bullets each frame, then checks against room wall segments using `bulletHitsSegment()`. On wall hit: if bounces > 0, call `reflectBullet()` using `v = v - 2(v·n)n` formula and decrement bounces. If bounces = 0, deactivate.

Ammo HUD span updated each shot.

**Result:** Clicking or pressing space fired white bullets that bounced off room walls up to 3 times.

---

### Phase 7 — Enemy AI

Created `enemy.js` with `Enemy` class supporting 3 types — grunt, tank, sniper — each with different radius, health, speed, shootCooldown, shootRange, damage, color.

All stats multiplied by `Math.pow(difficultyMult, depth - 1)` at construction so deeper rooms have genuinely harder enemies.

State machine implemented but simplified to stationary mode — enemy always faces player using `Math.atan2`, only shoots when player is in the same room (checked via `world.getRoomAt()`). This prevents enemies from shooting through walls or shooting in corridors.

`activationTimer` added — enemies do nothing for 1.5 seconds after room entry, giving player a grace period to orient.

`checkBulletHits()` loops through `world.bullets` each frame — if a player bullet is within `enemy.radius + bullet.radius` distance, apply damage and deactivate bullet.

`onDeath()` drops coins, 30% chance ammo pack, 15% chance powerup at enemy position.

`addKillFlash()` called on death — pushes a flash object to `world.killFlashes[]` that rises and fades over 1 second with `globalAlpha = timer`.

**Result:** Red/dark/purple enemy circles inside rooms, facing player, shooting orange bullets when player enters.

---

### Phase 8 — Loot System

Created `loot.js` with `Loot` class for coins, ammo packs, and powerups. Each loot object has a `bobTimer` incremented each frame — draw position offset by `Math.sin(bobTimer) * 3` creates a smooth floating animation.

`collect()` applies effect — coins add to `player.coins`, ammo adds to `player.ammo` capped at max, powerups push to `player.collectedPowerups[]`.

Corridor coins spawned in `world.spawnCorridorCoins()` — 3 coins scattered randomly in each 80px corridor gap between rooms. These are stored in `world.corridorLoot[]` separately from room loot.

**Result:** Yellow bobbing coins appeared in corridors and dropped from dead enemies. Walking over collected them and updated HUD.

---

### Phase 9 — Vision / Fog of War

Created `vision.js` using an offscreen canvas (`document.createElement('canvas')`) to avoid the compositing issue where `destination-out` would erase the game world itself.

Process each frame:
1. Fill offscreen canvas solid black
2. Cast 120 rays in a 135° forward cone using player's aim angle, plus small ambient circle behind
3. Convert ray endpoint world coordinates to screen coordinates (`worldPt - camera.x/y`)
4. Draw lit polygon on offscreen canvas using `destination-out` — punches a transparent hole in the black fog
5. `ctx.drawImage(fogCanvas, 0, 0)` stamps the fog onto the main canvas AFTER `camera.reset()` — critical, must be in screen coordinates

In corridors where there are no walls, a simple circle of radius 160px is revealed instead.

**Result:** Only the area in front of the player was visible. Turning the mouse changed the cone direction. Rooms appeared gradually as player turned to look at them.

---

### Phase 10 — Guard System

Created `guard.js` — security guards that only appear in corridors from depth 3 onwards. Guards are immortal (player bullets pass through them) but shoot at the player.

State machine: PATROL ↔ ALERT. In PATROL, guards walk between 2 patrol points using the same movement math as enemies. In ALERT, guards face player and shoot every `GUARD_SHOOT_COOLDOWN` seconds.

Detection uses simple distance check with INVIS powerup reducing range to 40px. Alert sound plays on state transition — checked `if (this.state !== 'ALERT')` before switching to avoid repeated triggers.

Guard count per corridor: `1 + floor((depth - 2) / 2)` — so depth 3 = 1 guard, depth 5 = 2 guards, depth 7 = 3 guards.

**Result:** Blue "G" circles appeared in corridors from depth 3, patrolling back and forth, shooting blue bullets when player got close.

---

### Phase 11 — Shop System

Created `shop.js` — shop screen drawn on canvas as a panel with 5 purchasable items: health restore, ammo refill, damage upgrade, shield powerup, speed powerup.

`gameState = 'SHOP'` set by `setTimeout(() => shop.open(), 800)` in `room.js update()` 0.8 seconds after all enemies die — giving the player a moment of satisfaction before the shop appears.

Each item row stores its bounding box in `item.bounds`. Canvas click listener in `game.js` checks click coordinates against each item's bounds when `gameState === 'SHOP'`. `shop.buy(itemId)` deducts coins and applies the effect.

Press E or click outside to close. `shop.close()` sets `gameState = 'PLAYING'`.

**Result:** After clearing a room, a shop panel appeared after 0.8 seconds. Items grayed out when player couldn't afford them. Clicking purchased upgrades and deducted coins.

---

### Phase 12 — Powerup Activation

`player.activatePowerup()` takes the first item from `player.collectedPowerups[]` using `shift()`, sets `player.activePowerup` string and `player.powerupTimer`.

Each frame in `player.update()`, `powerupTimer -= dt`. When it hits 0, powerup expires and any stat changes (speed boost) are reversed.

SHIELD powerup: `world.update()` checks `player.activePowerup !== 'SHIELD'` before calling `player.takeDamage()`.

INVIS powerup: `guard.checkPlayerDetection()` reduces detection range to 40px when active.

SPEED powerup: `player.speed` doubled on activation, restored on expiry.

Powerup button in HUD — HTML button below the stats table with `onclick="player.activatePowerup()"`. Updates each frame in `updateHUD()`.

**Result:** Collecting a cyan powerup orb added it to inventory. Pressing Q or clicking the HUD button activated it with a timer running down.

---

### Phase 13 — Audio System

Created `audio.js` using Web Audio API `AudioContext`. All sounds generated procedurally using oscillators — no audio files needed.

Each sound creates an oscillator, connects it to a gain node, sets frequency curves with `setValueAtTime` and `exponentialRampToValueAtTime`, starts and stops at precise timestamps using `audioCtx.currentTime`.

Ambient thriller drone: two detuned sine oscillators at 55Hz and 58Hz connected through an LFO oscillator at 0.3Hz modulating gain — creates the slow pulsing horror atmosphere.

Audio context suspended by default due to browser autoplay policy. Resumed on first user interaction via a one-time click listener.

All audio calls wrapped in `try/catch` — if audio fails for any reason, game continues normally.

**Result:** Shooting, hitting enemies, taking damage, collecting coins, guard alerts, and death all had distinct synthesized sound effects. Ambient drone played throughout gameplay.

---

### Phase 14 — Intro + Rules Screens (HTML)

Built intro and rules as pure HTML divs with `position: absolute` covering the full screen at `z-index: 100` — sitting on top of the canvas entirely.

Intro screen: gold "MUMBAI 2.0" title, story text, blinking "Press ENTER" prompt.

Rules screen: two-column grid layout using CSS Grid showing all controls, enemy types, and powerup descriptions. Gold section headers. Monospace font throughout.

`gameState` starts as `'INTRO'`. ENTER key listener advances: INTRO → RULES → PLAYING. On each transition, the HTML div `display` switches between `'flex'` and `'none'`. Canvas render function returns early during INTRO and RULES states — nothing drawn on canvas until game actually starts.

Transition sound plays between intro and rules using a short cinematic whoosh effect.

**Result:** Game opened to cinematic black intro screen. ENTER advanced to the rules page. ENTER again started the game with ambient drone beginning.

---

### Phase 15 — Game Over Screen (HTML)

Built as a third HTML overlay div matching the style of intro and rules screens.

`showGameOver()` function in `game.js` fills in all stat spans — time survived (formatted as Mm Ss), final score, coins earned, depth reached — then sets `display: 'flex'` on the gameover div.

Called from `player.takeDamage()` when health hits 0, after setting `gameState = 'GAMEOVER'`. The `world.update()` checks `gameState !== 'PLAYING'` at the top and returns early — all game systems freeze.

R key in `game.js` keydown listener calls `location.reload()` when `gameState === 'GAMEOVER'` — full page reload resets everything cleanly.

**Result:** When player health hit 0, a black screen appeared with "YOU DIED" in red, showing all final stats in a bordered table. Press R restarted from the intro screen.

---

### Phase 16 — HUD Redesign

Moved HUD from top-left flat text to a styled panel in the top-right corner. Removed health from the stats table and replaced with a visual health bar at the top of the panel — fills green, turns orange below 50%, turns red below 25%.

CSS Grid used for the stats rows — label left, value right. Each value span has its own color ID for easy targeting.

Powerup button at the bottom of the HUD panel — `pointer-events: all` on just this section since the rest of the HUD is `pointer-events: none`. Button disables and grays out when no powerup collected. Text shows current powerup name and Q key hint.

**Result:** Clean minimal HUD panel in top-right. Health bar gives at-a-glance status. Powerup button clickable from the panel.

---

### Phase 17 — GitHub Submission

```bash
git init
git add .
git commit -m "Initial commit — Mumbai 2.0 complete"
git branch -M main
git remote add origin https://github.com/JolieneS/Mumbai-2.0.git
git pull origin main --allow-unrelated-histories
git push -u origin main
```

Set repository to Private. Added mentor as collaborator via Settings → Collaborators.

---

## 🙏 Acknowledgements

Built as part of the **Delta Force Induction Task**.

A huge thank you to **Delta** for this challenge. Building every system from scratch — raycasting, collision math, AI state machines, audio synthesis, procedural generation — was genuinely the best way to understand how games actually work under the hood. Every bug fixed taught something new.

> *"Every chamber becomes more dangerous than the last."*

---

## 👤 Author

**JolieneS**
GitHub: [@JolieneS](https://github.com/JolieneS)

---

*Mumbai 2.0 — built from scratch, no shortcuts.*
