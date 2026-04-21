document.addEventListener('DOMContentLoaded', () => {
  initThreatMapEmbed();
});

function initThreatMapEmbed() {
  const iframe = document.querySelector('[data-threat-iframe]');
  const fallback = document.querySelector('[data-threat-fallback]');
  if (!iframe || !fallback) return;

  let loaded = false;
  const revealFallback = () => {
    fallback.hidden = false;
  };

  const clearFallback = () => {
    fallback.hidden = true;
  };

  const timeoutId = window.setTimeout(() => {
    if (!loaded) revealFallback();
  }, 8000);

  iframe.addEventListener('load', () => {
    loaded = true;
    window.clearTimeout(timeoutId);
    clearFallback();
  });

  iframe.addEventListener('error', () => {
    window.clearTimeout(timeoutId);
    revealFallback();
  });
}
