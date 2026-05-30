const shop = {
  isOpen: false,

  items: [
    { id: 'health', label: 'Restore Health',  cost: 30,  desc: '+50 HP'         },
    { id: 'ammo',   label: 'Buy Ammo',         cost: 20,  desc: '+15 bullets'    },
    { id: 'damage', label: 'Damage Upgrade',   cost: 50,  desc: 'x1.5 bullet dmg'},
    { id: 'shield', label: 'Shield Powerup',   cost: 40,  desc: 'SHIELD pickup'  },
    { id: 'speed',  label: 'Speed Powerup',    cost: 35,  desc: 'SPEED pickup'   },
  ],

  open() {
    this.isOpen  = true;
    gameState    = 'SHOP';
  },

  close() {
    this.isOpen = false;
    gameState   = 'PLAYING';
  },

  buy(itemId) {
    const item = this.items.find(i => i.id === itemId);
    if (!item) return;
    if ((player.coins || 0) < item.cost) return; // not enough coins

    player.coins -= item.cost;

    if (itemId === 'health') {
      player.health = Math.min(player.health + 50, player.maxHealth);
    } else if (itemId === 'ammo') {
      player.ammo = Math.min(player.ammo + 15, player.maxAmmo);
    } else if (itemId === 'damage') {
      player.damageMult = (player.damageMult || 1) * 1.5;
    } else if (itemId === 'shield') {
      player.collectedPowerups.push('SHIELD');
    } else if (itemId === 'speed') {
      player.collectedPowerups.push('SPEED');
    }

    document.getElementById('hud-coins').textContent = `Coins: ${player.coins}`;
  },

  draw(ctx) {
    if (!this.isOpen) return;

    
    ctx.fillStyle = 'rgba(0,0,0,0.85)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    
    const pw = 480, ph = 400;
    const px = canvas.width  / 2 - pw / 2;
    const py = canvas.height / 2 - ph / 2;

    ctx.fillStyle   = '#0d0d1a';
    ctx.strokeStyle = '#f1c40f';
    ctx.lineWidth   = 2;
    ctx.fillRect(px, py, pw, ph);
    ctx.strokeRect(px, py, pw, ph);

    ctx.fillStyle = '#f1c40f';
    ctx.font      = 'bold 28px Courier New';
    ctx.textAlign = 'center';
    ctx.fillText('— UNDERGROUND SHOP —', canvas.width / 2, py + 45);

    ctx.font      = '14px Courier New';
    ctx.fillStyle = '#aaa';
    ctx.fillText(`Your coins: ${player.coins || 0}`, canvas.width / 2, py + 72);

    this.items.forEach((item, i) => {
      const iy      = py + 110 + i * 56;
      const canAfford = (player.coins || 0) >= item.cost;

     
      ctx.fillStyle = canAfford ? 'rgba(241,196,15,0.08)' : 'rgba(80,80,80,0.1)';
      ctx.fillRect(px + 20, iy, pw - 40, 46);
      ctx.strokeStyle = canAfford ? '#f1c40f' : '#444';
      ctx.lineWidth   = 1;
      ctx.strokeRect(px + 20, iy, pw - 40, 46);

      
      ctx.fillStyle = canAfford ? '#fff' : '#666';
      ctx.font      = 'bold 15px Courier New';
      ctx.textAlign = 'left';
      ctx.fillText(item.label, px + 36, iy + 18);
      ctx.font      = '12px Courier New';
      ctx.fillStyle = '#aaa';
      ctx.fillText(item.desc, px + 36, iy + 36);

      
      ctx.fillStyle   = canAfford ? '#f1c40f' : '#666';
      ctx.font        = 'bold 16px Courier New';
      ctx.textAlign   = 'right';
      ctx.fillText(`${item.cost} coins`, px + pw - 36, iy + 24);

      
      item.bounds = { x: px + 20, y: iy, w: pw - 40, h: 46 };
    });

    ctx.fillStyle = '#555';
    ctx.font      = '13px Courier New';
    ctx.textAlign = 'center';
    ctx.fillText('Click item to buy  |  Press E to close shop', canvas.width / 2, py + ph - 18);
    ctx.textAlign = 'left';
  }
};