const audio = {
  ctx: null,

  init() {
    
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    } catch(e) {
      console.warn('Web Audio not supported');
    }

   
    window.addEventListener('click', () => {
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    }, { once: true });

    
    this.startAmbientDrone();
  },

  
  makeGain(volume) {
    const g = this.ctx.createGain();
    g.gain.value = volume;
    g.connect(this.ctx.destination);
    return g;
  },

 
  playShoot() {
    if (!this.ctx) return;
    const t   = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const g   = this.makeGain(0.3);

    osc.type            = 'square';
    osc.frequency.setValueAtTime(800, t);
    osc.frequency.exponentialRampToValueAtTime(200, t + 0.08);
    g.gain.setValueAtTime(0.3, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

    osc.connect(g);
    osc.start(t);
    osc.stop(t + 0.08);
  },

 
  playHitEnemy() {
    if (!this.ctx) return;
    const t   = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const g   = this.makeGain(0.4);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(300, t);
    osc.frequency.exponentialRampToValueAtTime(80, t + 0.1);
    g.gain.setValueAtTime(0.4, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.1);

    osc.connect(g);
    osc.start(t);
    osc.stop(t + 0.1);
  },

 
  playPlayerHit() {
    if (!this.ctx) return;
    const t   = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const g   = this.makeGain(0.5);

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, t);
    osc.frequency.exponentialRampToValueAtTime(60, t + 0.2);
    g.gain.setValueAtTime(0.5, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.2);

    osc.connect(g);
    osc.start(t);
    osc.stop(t + 0.2);
  },

  
  playEnemyDeath() {
    if (!this.ctx) return;
    const t   = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const g   = this.makeGain(0.4);

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(400, t);
    osc.frequency.exponentialRampToValueAtTime(30, t + 0.4);
    g.gain.setValueAtTime(0.4, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.4);

    osc.connect(g);
    osc.start(t);
    osc.stop(t + 0.4);
  },

  
  playGuardAlert() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;

    [0, 0.15, 0.3].forEach((offset, i) => {
      const osc = this.ctx.createOscillator();
      const g   = this.makeGain(0.3);
      osc.type  = 'square';
      osc.frequency.value = 880 + i * 220;
      g.gain.setValueAtTime(0.3, t + offset);
      g.gain.exponentialRampToValueAtTime(0.001, t + offset + 0.1);
      osc.connect(g);
      osc.start(t + offset);
      osc.stop(t + offset + 0.1);
    });
  },

  
  playPlayerDeath() {
    if (!this.ctx) return;
    const t   = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const g   = this.makeGain(0.7);

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(200, t);
    osc.frequency.exponentialRampToValueAtTime(20, t + 1.5);
    g.gain.setValueAtTime(0.7, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 1.5);

    osc.connect(g);
    osc.start(t);
    osc.stop(t + 1.5);
  },

 
  playCoinCollect() {
    if (!this.ctx) return;
    const t   = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const g   = this.makeGain(0.3);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, t);
    osc.frequency.setValueAtTime(1600, t + 0.05);
    g.gain.setValueAtTime(0.3, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

    osc.connect(g);
    osc.start(t);
    osc.stop(t + 0.15);
  },

  
  startAmbientDrone() {
    if (!this.ctx) return;

    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const g    = this.makeGain(0.06);

    osc1.type            = 'sine';
    osc1.frequency.value = 55;  
    osc2.type            = 'sine';
    osc2.frequency.value = 58;  

   
    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();
    lfo.frequency.value  = 0.3;
    lfoGain.gain.value   = 0.04;
    lfo.connect(lfoGain);
    lfoGain.connect(g.gain);

    osc1.connect(g);
    osc2.connect(g);
    lfo.start();
    osc1.start();
    osc2.start();
  }
};