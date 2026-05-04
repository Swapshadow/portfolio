(() => {
  const root = document.querySelector('[data-cyber-feed-root]');
  if (!root) return;
  const list = root.querySelector('[data-feed-list]');
  const stateEl = root.querySelector('[data-feed-state]');
  const heading = root.querySelector('[data-feed-heading]');
  const btn = root.querySelector('[data-load-more]');
  const refreshBtn = root.querySelector('#refreshCyberFeed');
  const shareBtn = root.querySelector('#shareCyberFeed');
  const feedbackEl = root.querySelector('#cyberFeedFeedback');
  const STEP = 30;
  let items = [];
  let shown = STEP;
  let feedbackTimer;

  const frDate = (d) => new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric', timeZone: 'Europe/Paris' });
  const rel = (d) => { const ms = Date.now() - new Date(d).getTime(); const h = Math.floor(ms / 3600000); if (h < 24) return `il y a ${Math.max(h, 1)}h`; return frDate(d); };
  const esc = (s = '') => s.replace(/[&<>'"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[c]));

  const decodeHtmlEntities = (value = '') => {
    const textarea = document.createElement('textarea');
    textarea.innerHTML = value;
    return textarea.value;
  };

  const cleanSummary = (raw = '') => {
    let text = decodeHtmlEntities(raw);
    text = decodeHtmlEntities(text);
    text = text.replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<img[^>]*>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/https?:\/\/\S+/gi, ' ')
      .replace(/href\s*=\s*["'][^"']*["']/gi, ' ')
      .replace(/data-entity-[^\s=]+\s*=\s*["'][^"']*["']/gi, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    return text.slice(0, 180);
  };

  const isValidImageUrl = (url = '') => {
    if (!url || typeof url !== 'string') return false;
    const trimmed = url.trim();
    if (!trimmed || trimmed.startsWith('data:')) return false;
    if (/pixel|1x1|spacer/i.test(trimmed)) return false;
    try {
      const u = new URL(trimmed, window.location.href);
      return ['http:', 'https:'].includes(u.protocol);
    } catch {
      return false;
    }
  };

  const showFeedback = (message) => {
    if (!feedbackEl) return;
    feedbackEl.textContent = message;
    clearTimeout(feedbackTimer);
    feedbackTimer = setTimeout(() => {
      feedbackEl.textContent = '';
    }, 2500);
  };

  function render() {
    const toShow = items.slice(0, shown);
    list.innerHTML = toShow.map((it) => {
      const sev = it.severity.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z]/g, '');
      const typeClass = `type-${(it.type || 'NEWS').toLowerCase()}`;
      const imageOk = isValidImageUrl(it.imageUrl);
      const image = imageOk ? `<a class="cyber-feed-image-link" href="${esc(it.url)}" target="_blank" rel="noopener noreferrer"><img class="cyber-feed-image" src="${esc(it.imageUrl)}" alt="" loading="lazy"></a>` : '';
      return `<article class="feed-item cyber-feed-card ${imageOk ? '' : 'no-image'}">${image}<div class="cyber-feed-content"><div class="feed-meta cyber-feed-meta"><span>${esc(it.source)}</span><span>${rel(it.publishedAt)}</span></div><div class="feed-badges"><span class="badge badge-type ${typeClass}">${esc(it.type)}</span><span class="badge badge-severity sev-${sev}">${esc(it.severity)}</span></div><h3 class="cyber-feed-title"><a href="${esc(it.url)}" target="_blank" rel="noopener noreferrer">${esc(it.title)}</a></h3><p class="cyber-feed-summary">${esc(cleanSummary(it.summary || ''))}</p><a class="feed-link cyber-feed-read" href="${esc(it.url)}" target="_blank" rel="noopener noreferrer">Lire la source</a></div></article>`;
    }).join('');

    list.querySelectorAll('.cyber-feed-image').forEach((img) => {
      img.onerror = () => {
        const card = img.closest('.cyber-feed-card');
        if (card) card.classList.add('no-image');
        img.closest('.cyber-feed-image-link')?.remove();
      };
      img.onload = () => {
        if (img.naturalWidth > 0 && img.naturalHeight > 0 && (img.naturalWidth < 40 || img.naturalHeight < 40)) {
          const card = img.closest('.cyber-feed-card');
          if (card) card.classList.add('no-image');
          img.closest('.cyber-feed-image-link')?.remove();
        }
      };
    });
    btn.hidden = shown >= items.length;
  }

  async function init({ forceRefresh = false } = {}) {
    stateEl.textContent = forceRefresh ? 'Actualisation…' : 'Chargement du Cyber Feed…';
    stateEl.hidden = false;
    list.innerHTML = '';
    shown = STEP;
    if (heading) heading.remove();
    try {
      const cacheBuster = forceRefresh ? `?t=${Date.now()}` : '';
      const res = await fetch(`data/cyber-feed.json${cacheBuster}`, { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      items = (data.items || []).filter((i) => i?.title && i?.url).sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
      if (!items.length) throw new Error('empty');
      stateEl.hidden = true;
      const failed = (data.sources || []).filter((s) => s.status === 'error').map((s) => s.name);
      console.info(`[Cyber Feed] ${items.length} articles chargés depuis data/cyber-feed.json`);
      console.info(`[Cyber Feed] JSON généré le ${data.generatedAt}`);
      if (failed.length) console.warn('[Cyber Feed] Sources en erreur :', failed);
      render();
      if (forceRefresh) showFeedback('Flux mis à jour');
    } catch (e) {
      list.innerHTML = '';
      stateEl.hidden = false;
      stateEl.textContent = 'Le flux cyber est temporairement indisponible. Une mise à jour automatique est prévue prochainement.';
      if (forceRefresh) showFeedback('Actualisation impossible');
    }
  }

  btn.addEventListener('click', () => { shown += STEP; render(); });
  refreshBtn?.addEventListener('click', async () => {
    refreshBtn.disabled = true;
    refreshBtn.textContent = 'Actualisation…';
    await init({ forceRefresh: true });
    refreshBtn.disabled = false;
    refreshBtn.textContent = 'Actualiser';
  });

  shareBtn?.addEventListener('click', async () => {
    const shareData = {
      title: 'Cyber Feed - Jean-Baptiste Terrazzoni',
      text: 'Veille cybersécurité : vulnérabilités, alertes CERT, fuites de données, ransomware et threat intelligence.',
      url: 'https://swapshadow.github.io/portfolio/veille.html'
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareData.url);
        showFeedback('Lien copié');
      } else {
        showFeedback('Impossible de partager');
      }
    } catch {
      showFeedback('Impossible de partager');
    }
  });
  init();
})();
