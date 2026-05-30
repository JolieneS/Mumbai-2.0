const input = {
  keys: {},
  mouseX: 0,
  mouseY: 0,
  isMouseDown:  false,
  isSpaceDown:  false,  

  init() {
    window.addEventListener('keydown', (e) => {
      input.keys[e.key.toLowerCase()] = true;
      if (e.code === 'Space') {
        input.isSpaceDown = true;
        e.preventDefault(); 
      }
    });

    window.addEventListener('keyup', (e) => {
      input.keys[e.key.toLowerCase()] = false;
      if (e.code === 'Space') {
        input.isSpaceDown = false;
      }
    });

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