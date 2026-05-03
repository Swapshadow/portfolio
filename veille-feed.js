(() => {
  const root = document.querySelector('[data-cyber-feed-root]');
  if (!root) return;
  const list = root.querySelector('[data-feed-list]');
  const stateEl = root.querySelector('[data-feed-state]');
  const heading = root.querySelector('[data-feed-heading]');
  const btn = root.querySelector('[data-load-more]');
  const STEP = 30;
  let items = [];
  let shown = STEP;

  const frDate = (d) => new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric', timeZone: 'Europe/Paris' });
  const todayLabel = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Paris' }).format(new Date());
  const rel = (d) => { const ms = Date.now() - new Date(d).getTime(); const h = Math.floor(ms / 3600000); if (h < 24) return `il y a ${Math.max(h, 1)}h`; return frDate(d); };
  const esc = (s = '') => s.replace(/[&<>'"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[c]));

  function render() {
    const toShow = items.slice(0, shown);
    list.innerHTML = toShow.map((it) => {
      const sev = it.severity.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z]/g, '');
      const image = it.imageUrl ? `<a class="cyber-feed-image-link" href="${esc(it.url)}" target="_blank" rel="noopener noreferrer"><img class="cyber-feed-image" src="${esc(it.imageUrl)}" alt="" loading="lazy"></a>` : '';
      return `<article class="feed-item ${it.imageUrl ? '' : 'no-image'}">${image}<div class="cyber-feed-content"><div class="feed-meta"><span>${esc(it.source)}</span><span>${rel(it.publishedAt)}</span></div><div class="feed-badges"><span class="badge badge-type">${esc(it.type)}</span><span class="badge sev-${sev}">${esc(it.severity)}</span></div><h3>${esc(it.title)}</h3><p>${esc((it.summary || '').slice(0, 180))}</p><a class="feed-link" href="${esc(it.url)}" target="_blank" rel="noopener noreferrer">Lire la source</a></div></article>`;
    }).join('');
    list.querySelectorAll('.cyber-feed-image').forEach((img) => {
      img.onerror = () => {
        img.closest('.feed-item')?.classList.add('no-image');
        img.closest('.cyber-feed-image-link')?.remove();
      };
    });
    btn.hidden = shown >= items.length;
  }

  async function init() {
    stateEl.textContent = 'Chargement du Cyber Feed…';
    try {
      const res = await fetch('data/cyber-feed.json', { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      items = (data.items || []).filter((i) => i?.title && i?.url).sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
      const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Paris' }).format(new Date());
      const todayItems = items.filter((i) => new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Paris' }).format(new Date(i.publishedAt)) === today);
      heading.textContent = todayItems.length ? `Aujourd’hui — ${todayLabel}` : 'Dernières actualités disponibles';
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

  btn.addEventListener('click', () => { shown += STEP; render(); });
  init();
})();
