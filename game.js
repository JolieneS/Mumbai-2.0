let canvas, ctx;
let lastTime = 0;
let gameState = 'INTRO';

let player_position_x = 0;
let player_position_y = 0;

let gameTimer = 0;

function init() {
  canvas = document.getElementById('gameCanvas');
  ctx    = canvas.getContext('2d');

  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;

  window.addEventListener('resize', () => {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  });

  
  window.addEventListener('keydown', (e) => {
    const key = e.key.toLowerCase();

    
    if (e.key === 'Enter') {
      if (gameState === 'INTRO') {
        document.getElementById('intro-screen').style.display = 'none';
        document.getElementById('rules-screen').style.display = 'flex';
        gameState = 'RULES';
        try { audio.playIntroTransition(); } catch(err) {}
        return;
      }
      if (gameState === 'RULES') {
        document.getElementById('rules-screen').style.display = 'none';
        gameState = 'PLAYING';
        try { audio.startAmbientDrone(); } catch(err) {}
        return;
      }
    }

    if (key === 'p') {
      if (gameState === 'PLAYING') gameState = 'PAUSED';
      else if (gameState === 'PAUSED') gameState = 'PLAYING';
    }

    if (key === 'r' && gameState === 'GAMEOVER') {
      location.reload();
    }

    if (key === 'q' && gameState === 'PLAYING') {
      player.activatePowerup();
    }

    if (key === 'e' && gameState === 'SHOP') {
      shop.close();
    }
  });

  input.init();
  world.init();
  audio.init();

  canvas.addEventListener('click', (e) => {
    if (gameState !== 'SHOP') return;
    shop.items.forEach(item => {
      if (!item.bounds) return;
      const b = item.bounds;
      if (e.clientX > b.x && e.clientX < b.x + b.w &&
          e.clientY > b.y && e.clientY < b.y + b.h) {
        shop.buy(item.id);
      }
    });
  });

  camera.x = player.x - canvas.width  / 2;
  camera.y = player.y - canvas.height / 2;

  requestAnimationFrame(gameLoop);
}

function gameLoop(timestamp) {
  const dt = Math.min((timestamp - lastTime) / 1000, 0.05);
  lastTime  = timestamp;

  if (gameState === 'PLAYING') update(dt);

  render();
  requestAnimationFrame(gameLoop);
}

function update(dt) {
  player.update(dt);
  camera.update(player.x, player.y);
  world.update(dt);
  gameTimer += dt; 
}

function render() {
  ctx.fillStyle = BG_COLOR;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

 
  if (gameState === 'INTRO' || gameState === 'RULES') return;

  camera.apply(ctx);
  world.draw(ctx);
  player.draw(ctx);
  camera.reset(ctx);

  
  vision.draw(ctx, player.x, player.y, world.getCurrentRoomWalls());

  if (gameState === 'SHOP')    shop.draw(ctx);
  if (gameState === 'PLAYING' || gameState === 'PAUSED') updateHUD();
  if (gameState === 'PAUSED')  drawPauseScreen();
  
}

function updateHUD() {
  const pct = player.health / player.maxHealth;

  
  const fill = document.getElementById('hud-healthbar-fill');
  if (fill) {
    fill.style.width      = `${Math.max(0, pct * 100)}%`;
    fill.style.background = pct > 0.5 ? '#2ecc71' :
                            pct > 0.25 ? '#f39c12' : '#e74c3c';
  }
  const num = document.getElementById('hud-healthbar-num');
  if (num) num.textContent = Math.ceil(player.health);

  document.getElementById('hud-score').textContent = player.score || 0;
  document.getElementById('hud-coins').textContent = player.coins || 0;
  document.getElementById('hud-depth').textContent = world.depth;
  document.getElementById('hud-ammo').textContent  = player.ammo;

  const secs = Math.floor(gameTimer);
  const m    = Math.floor(secs / 60);
  const s    = secs % 60;
  document.getElementById('hud-timer').textContent =
    `${m}:${s.toString().padStart(2, '0')}`;

  
  const btn = document.getElementById('hud-powerup-btn');
  if (btn) {
    if (player.collectedPowerups.length > 0) {
      btn.textContent = `[Q] ${player.collectedPowerups[0]}`;
      btn.disabled    = false;
    } else {
      btn.textContent = 'none';
      btn.disabled    = true;
    }
  }
}
function drawPauseScreen() {
  ctx.fillStyle = 'rgba(0,0,0,0.6)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle   = '#fff';
  ctx.font        = 'bold 48px Courier New';
  ctx.textAlign   = 'center';
  ctx.fillText('PAUSED', canvas.width / 2, canvas.height / 2);
  ctx.font        = '20px Courier New';
  ctx.fillText('Press P to resume', canvas.width / 2, canvas.height / 2 + 50);
  ctx.textAlign   = 'left';
}

function showGameOver() {
 
  const secs = Math.floor(gameTimer);
  const m    = Math.floor(secs / 60);
  const s    = secs % 60;

  document.getElementById('go-timer').textContent = `${m}m ${s}s`;
  document.getElementById('go-score').textContent = player.score || 0;
  document.getElementById('go-coins').textContent = player.coins || 0;
  document.getElementById('go-depth').textContent = world.depth;

  
  document.getElementById('gameover-screen').style.display = 'flex';
}

window.onload = init;