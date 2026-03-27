document.addEventListener('DOMContentLoaded', () => {
  initGameMatrix();
});

function initGameMatrix() {
  const canvas = document.querySelector('[data-matrix-canvas]');
  if (!canvas) return;

  const context = canvas.getContext('2d', { alpha: false });
  if (!context) return;

  const root = document.body;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const characters = ['0', '1'];

  let width = 0;
  let height = 0;
  let fontSize = 18;
  let columns = 0;
  let drops = [];
  let animationFrame = 0;
  let previousTime = 0;
  let frameInterval = 48;

  const computeAnimationState = () => {
    const animationMode = root.dataset.animations || localStorage.getItem('animations') || 'on';
    if (animationMode === 'off' || prefersReducedMotion.matches) {
      canvas.style.opacity = '0.22';
      frameInterval = 120;
      return;
    }

    canvas.style.opacity = '1';
    frameInterval = 48;
  };

  const resize = () => {
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;

    canvas.width = Math.floor(width * ratio);
    canvas.height = Math.floor(height * ratio);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    context.fillStyle = '#000000';
    context.fillRect(0, 0, width, height);

    fontSize = width < 768 ? 14 : 18;
    columns = Math.ceil(width / fontSize);
    drops = Array.from({ length: columns }, () => Math.floor(Math.random() * (height / fontSize)));
  };

  const step = (time) => {
    animationFrame = window.requestAnimationFrame(step);
    if (document.hidden) return;
    if (time - previousTime < frameInterval) return;
    previousTime = time;

    context.fillStyle = 'rgba(0, 0, 0, 0.14)';
    context.fillRect(0, 0, width, height);

    context.font = `${fontSize}px "SFMono-Regular", Menlo, Consolas, monospace`;

    for (let index = 0; index < drops.length; index += 1) {
      const text = characters[Math.random() > 0.5 ? 1 : 0];
      const x = index * fontSize;
      const y = drops[index] * fontSize;

      context.fillStyle = Math.random() > 0.9 ? '#b8ffbc' : '#36d65f';
      context.fillText(text, x, y);

      if (y > height && Math.random() > 0.975) {
        drops[index] = 0;
      }

      drops[index] += 1;
    }
  };

  const handleVisibility = () => {
    if (!document.hidden && !animationFrame) {
      animationFrame = window.requestAnimationFrame(step);
    }
  };

  const handleAnimationsChanged = () => {
    computeAnimationState();
  };

  resize();
  computeAnimationState();

  animationFrame = window.requestAnimationFrame(step);
  window.addEventListener('resize', resize);
  document.addEventListener('visibilitychange', handleVisibility);
  prefersReducedMotion.addEventListener('change', handleAnimationsChanged);

  const observer = new MutationObserver(() => {
    handleAnimationsChanged();
  });
  observer.observe(root, {
    attributes: true,
    attributeFilter: ['data-animations'],
  });
}
