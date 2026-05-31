const input = {
  keys: {},
  mouseX: 0,
  mouseY: 0,
  isMouseDown: false,
  isSpaceDown: false,
  isEnterDown: false,

  init() {
    // attach to BOTH window and document to catch all cases
    const handler = (e) => {
      if (e.type === 'keydown') {
        input.keys[e.key.toLowerCase()] = true;
        if (e.code === 'Space')  { input.isSpaceDown = true;  e.preventDefault(); }
        if (e.code === 'Enter')  { input.isEnterDown = true; }
      }
      if (e.type === 'keyup') {
        input.keys[e.key.toLowerCase()] = false;
        if (e.code === 'Space')  input.isSpaceDown = false;
        if (e.code === 'Enter')  input.isEnterDown = false;
      }
    };

    window.addEventListener('keydown',   handler);
    window.addEventListener('keyup',     handler);
    document.addEventListener('keydown', handler);
    document.addEventListener('keyup',   handler);

    window.addEventListener('mousemove', (e) => {
      input.mouseX = e.clientX;
      input.mouseY = e.clientY;
    });

    window.addEventListener('mousedown', (e) => {
      if (e.button === 0) input.isMouseDown = true;
    });

    window.addEventListener('mouseup', (e) => {
      if (e.button === 0) input.isMouseDown = false;
    });
  }
};