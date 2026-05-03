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

  const frDate = (d) => new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
  const rel = (d) => { const ms = Date.now() - new Date(d).getTime(); const h = Math.floor(ms / 3600000); if (h < 24) return `il y a ${Math.max(h,1)}h`; return frDate(d); };

  function render() {
    const toShow = items.slice(0, shown);
    list.innerHTML = toShow.map((it) => `<article class="feed-item"><div class="feed-meta"><span>${it.source}</span><span>${rel(it.publishedAt)}</span></div><div class="feed-badges"><span class="badge badge-type">${it.type}</span><span class="badge sev-${it.severity.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z]/g,'')}">${it.severity}</span></div><h3>${it.title}</h3><p>${(it.summary||'').slice(0,220)}</p><a class="feed-link" href="${it.url}" target="_blank" rel="noopener noreferrer">Lire la source</a></article>`).join('');
    btn.hidden = shown >= items.length;
  }

  async function init() {
    stateEl.textContent = 'Chargement du Cyber Feed…';
    try {
      const res = await fetch('data/cyber-feed.json', { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      items = (data.items || []).filter((i) => i?.title && i?.url).sort((a,b) => new Date(b.publishedAt)-new Date(a.publishedAt));
      const today = new Date().toISOString().slice(0,10);
      const todayItems = items.filter((i) => (i.publishedAt||'').slice(0,10) === today);
      heading.textContent = todayItems.length ? `Aujourd’hui — ${frDate(new Date().toISOString())}` : 'Dernières actualités disponibles';
      if (!items.length) throw new Error('empty');
      stateEl.hidden = true;
      const failed = (data.sources||[]).filter((s)=>s.status==='error').map((s)=>s.name);
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
