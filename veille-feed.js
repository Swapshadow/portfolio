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
  const showCyberFeedBtn = root.querySelector('#showCyberFeed');
  const showCveFeedBtn = root.querySelector('#showCveFeed');
  const titleEl = root.querySelector('.section-title');
  const subtitleEl = root.querySelector('.cyber-feed-hero p');
  const STEP = 30;
  const CVE_STEP = 20;
  const CVE_FEED_SOURCE = { name: 'Tenable Newest CVEs', url: 'https://www.tenable.com/cve/feeds?sort=newest', defaultType: 'CVE' };
  let items = [];
  let cveItems = [];
  let shown = STEP;
  let mode = 'cyber';
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
      .replace(/&[a-z0-9#]+;/gi, ' ')
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
    feedbackTimer = setTimeout(() => { feedbackEl.textContent = ''; }, 2600);
  };

  const inferSeverity = (title = '', summary = '') => {
    const text = `${title} ${summary}`.toLowerCase();
    const cvssMatch = text.match(/cvss[^0-9]*([0-9]+(?:\.[0-9]+)?)/i);
    if (cvssMatch) {
      const score = Number(cvssMatch[1]);
      if (score >= 9) return 'Critique';
      if (score >= 7) return 'Élevée';
      if (score >= 4) return 'Moyenne';
    }
    if (/(critical|cvss 9|cvss 10|remote code execution|rce|exploited|zero-day)/i.test(text)) return 'Critique';
    if (/(high|cvss 7|cvss 8|vulnerability|exploit)/i.test(text)) return 'Élevée';
    if (/(medium|cvss 4|cvss 5|cvss 6)/i.test(text)) return 'Moyenne';
    return 'Info';
  };

  function render() {
    const dataset = mode === 'cve' ? cveItems : items;
    const toShow = dataset.slice(0, shown);
    list.innerHTML = toShow.map((it) => {
      const sev = it.severity.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z]/g, '');
      const typeClass = `type-${(it.type || 'NEWS').toLowerCase()}`;
      const imageOk = isValidImageUrl(it.imageUrl);
      const image = imageOk ? `<a class="cyber-feed-image-link" href="${esc(it.url)}" target="_blank" rel="noopener noreferrer"><img class="cyber-feed-image" src="${esc(it.imageUrl)}" alt="" loading="lazy"></a>` : '';
      return `<article class="feed-item cyber-feed-card ${imageOk ? '' : 'no-image'} ${mode === 'cve' ? 'is-cve-focus' : ''}">${image}<div class="cyber-feed-content"><div class="feed-meta cyber-feed-meta"><span>${esc(it.source)}</span><span>${rel(it.publishedAt)}</span></div><div class="feed-badges"><span class="badge badge-type ${typeClass}">${esc(it.type)}</span><span class="badge badge-severity sev-${sev}">${esc(it.severity)}</span></div><h3 class="cyber-feed-title"><a href="${esc(it.url)}" target="_blank" rel="noopener noreferrer">${esc(it.title)}</a></h3><p class="cyber-feed-summary">${esc(cleanSummary(it.summary || ''))}</p><a class="feed-link cyber-feed-read" href="${esc(it.url)}" target="_blank" rel="noopener noreferrer">Lire la source</a></div></article>`;
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
    btn.hidden = shown >= dataset.length;
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
    } catch (e) {
      list.innerHTML = '';
      stateEl.hidden = false;
      stateEl.textContent = 'Le flux cyber est temporairement indisponible. Une mise à jour automatique est prévue prochainement.';
    }
  }

  async function loadCveFeed() {
    stateEl.hidden = false;
    stateEl.textContent = 'Chargement des dernières CVE…';
    list.innerHTML = '';
    const rssProxyUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(CVE_FEED_SOURCE.url)}`;
    const res = await fetch(rssProxyUrl, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const sourceItems = Array.isArray(data.items) ? data.items : [];
    cveItems = sourceItems.map((item) => ({
      source: CVE_FEED_SOURCE.name,
      publishedAt: item.pubDate || new Date().toISOString(),
      type: 'CVE',
      severity: inferSeverity(item.title || '', item.description || ''),
      title: item.title || 'CVE',
      summary: item.description || '',
      url: item.link || CVE_FEED_SOURCE.url,
      imageUrl: ''
    })).sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
    if (!cveItems.length) throw new Error('empty-cve');
    stateEl.hidden = true;
  }

  const switchMode = async (nextMode) => {
    mode = nextMode;
    shown = nextMode === 'cve' ? CVE_STEP : STEP;
    showCyberFeedBtn?.classList.toggle('is-active', nextMode === 'cyber');
    showCveFeedBtn?.classList.toggle('is-active', nextMode === 'cve');
    showCyberFeedBtn?.setAttribute('aria-selected', String(nextMode === 'cyber'));
    showCveFeedBtn?.setAttribute('aria-selected', String(nextMode === 'cve'));
    if (nextMode === 'cve') {
      titleEl.textContent = 'Dernières CVE';
      subtitleEl.textContent = 'Flux CVE récent basé sur Tenable, trié du plus récent au plus ancien.';
      try {
        await loadCveFeed();
      } catch {
        stateEl.hidden = false;
        stateEl.textContent = 'Impossible de charger les dernières CVE pour le moment.';
        showFeedback('Impossible de charger les dernières CVE pour le moment.');
        return;
      }
    } else {
      titleEl.textContent = 'Cyber Feed';
      subtitleEl.textContent = 'Signaux cyber récents : vulnérabilités, alertes CERT, fuites de données, ransomware et threat intelligence.';
      if (!items.length) await init();
    }
    render();
  };

  btn.addEventListener('click', () => { shown += mode === 'cve' ? CVE_STEP : STEP; render(); });
  showCyberFeedBtn?.addEventListener('click', () => switchMode('cyber'));
  showCveFeedBtn?.addEventListener('click', () => switchMode('cve'));
  refreshBtn?.addEventListener('click', async () => {
    refreshBtn.disabled = true;
    try {
      if (mode === 'cve') {
        await loadCveFeed();
        render();
      } else {
        await init({ forceRefresh: true });
      }
    } finally {
      refreshBtn.disabled = false;
    }
  });
  shareBtn?.addEventListener('click', async () => {
    const shareData = { title: 'Cyber Feed - Jean-Baptiste Terrazzoni', text: 'Veille cybersécurité : vulnérabilités, alertes CERT, fuites de données, ransomware et threat intelligence.', url: 'https://swapshadow.github.io/portfolio/veille.html' };
    try {
      if (navigator.share) await navigator.share(shareData);
      else if (navigator.clipboard?.writeText) { await navigator.clipboard.writeText(shareData.url); showFeedback('Lien copié'); }
    } catch { showFeedback('Impossible de partager'); }
  });
  init();
})();
