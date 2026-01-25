document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initMenu();
  initCarousel();
  initRssFeeds();
});

const RSS_CACHE_PREFIX = 'rss-cache-v1';
const RSS_CACHE_TTL = 15 * 60 * 1000;
const RSS_TIMEOUT_MS = 8000;

function initTheme() {
  const toggle = document.querySelector('[data-theme-toggle]');
  const storedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const initialTheme = storedTheme || (prefersDark ? 'dark' : 'light');

  const applyTheme = (theme) => {
    document.body.dataset.theme = theme;
    if (toggle) {
      toggle.setAttribute('aria-pressed', theme === 'dark');
    }
  };

  applyTheme(initialTheme);

  if (!toggle) return;

  toggle.addEventListener('click', () => {
    const nextTheme = document.body.dataset.theme === 'dark' ? 'light' : 'dark';
    applyTheme(nextTheme);
    localStorage.setItem('theme', nextTheme);
  });
}

function initMenu() {
  const toggle = document.querySelector('.menu-toggle');
  const menu = document.querySelector('.site-nav');
  const close = document.querySelector('.menu-close');

  if (!toggle || !menu) return;

  const openMenu = () => {
    menu.classList.add('is-open');
    toggle.setAttribute('aria-expanded', 'true');
    menu.setAttribute('aria-hidden', 'false');
    document.body.classList.add('menu-open');
  };

  const closeMenu = () => {
    menu.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    menu.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('menu-open');
  };

  toggle.addEventListener('click', () => {
    if (menu.classList.contains('is-open')) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  close?.addEventListener('click', closeMenu);

  menu.addEventListener('click', (event) => {
    if (event.target === menu) {
      closeMenu();
    }
  });

  menu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', closeMenu);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && menu.classList.contains('is-open')) {
      closeMenu();
    }
  });
}

function initCarousel() {
  const carousel = document.querySelector('[data-carousel]');
  if (!carousel) return;

  const track = carousel.querySelector('[data-carousel-track]');
  const prev = carousel.querySelector('[data-carousel-prev]');
  const next = carousel.querySelector('[data-carousel-next]');

  if (!track || !prev || !next) return;

  let index = 0;

  const update = () => {
    const card = track.querySelector('.carousel-card');
    if (!card) return;
    const cardWidth = card.getBoundingClientRect().width + 16;
    const visibleCards = Math.max(Math.floor(carousel.offsetWidth / cardWidth), 1);
    const maxIndex = Math.max(track.children.length - visibleCards, 0);
    index = Math.min(index, maxIndex);
    track.style.transform = `translateX(-${index * cardWidth}px)`;
  };

  prev.addEventListener('click', () => {
    index = Math.max(index - 1, 0);
    update();
  });

  next.addEventListener('click', () => {
    const total = track.children.length;
    const card = track.querySelector('.carousel-card');
    if (!card) return;
    const cardWidth = card.getBoundingClientRect().width + 16;
    const visibleCards = Math.max(Math.floor(carousel.offsetWidth / cardWidth), 1);
    const maxIndex = Math.max(total - visibleCards, 0);
    index = Math.min(index + 1, maxIndex);
    update();
  });

  window.addEventListener('resize', update);
  update();
}

function initRssFeeds() {
  const feeds = [
    {
      key: 'cert-fr',
      url: 'https://cert.ssi.gouv.fr/feed/',
      label: 'CERT-FR',
    },
    {
      key: 'hacker-news',
      url: 'https://feeds.feedburner.com/TheHackersNews',
      label: 'The Hacker News',
    },
  ];

  const tasks = feeds
    .map((feed) => {
      const container = document.querySelector(`[data-rss-container="${feed.key}"]`);
      if (!container) return null;
      return loadRssFeed({ ...feed, container });
    })
    .filter(Boolean);

  if (!tasks.length) return;
  Promise.allSettled(tasks);
}

async function loadRssFeed({ key, url, label, container }) {
  const cacheKey = `${RSS_CACHE_PREFIX}:${key}`;
  const cached = readRssCache(cacheKey);
  const now = Date.now();
  const isFresh = cached && now - cached.timestamp < RSS_CACHE_TTL;

  if (cached?.items?.length) {
    renderRssItems(cached.items, container, label);
  }

  if (isFresh) {
    return;
  }

  container.setAttribute('aria-busy', 'true');

  try {
    const items = await fetchRssFeed(url);
    if (items.length) {
      writeRssCache(cacheKey, { timestamp: now, items });
      renderRssItems(items, container, label);
    } else {
      renderRssEmpty(container);
    }
  } catch (error) {
    if (!cached?.items?.length) {
      renderRssError(container);
    }
  } finally {
    container.removeAttribute('aria-busy');
  }
}

async function fetchRssFeed(url) {
  const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), RSS_TIMEOUT_MS);

  try {
    const response = await fetch(proxyUrl, { signal: controller.signal, cache: 'no-store' });
    if (!response.ok) {
      throw new Error('Flux inaccessible');
    }
    const text = await response.text();
    return parseRssItems(text);
  } finally {
    clearTimeout(timeoutId);
  }
}

function parseRssItems(xmlText) {
  const parser = new DOMParser();
  const xml = parser.parseFromString(xmlText, 'text/xml');
  if (xml.querySelector('parsererror')) {
    throw new Error('Flux invalide');
  }
  return Array.from(xml.querySelectorAll('item'))
    .slice(0, 6)
    .map((item) => {
      const title = item.querySelector('title')?.textContent?.trim() || 'Sans titre';
      const link = item.querySelector('link')?.textContent?.trim() || '#';
      const pubDate = item.querySelector('pubDate')?.textContent ?? '';
      const date = pubDate ? new Date(pubDate).toLocaleDateString('fr-FR') : 'Date inconnue';
      return { title, link, date };
    });
}

function renderRssItems(items, container, label) {
  container.innerHTML = '';
  items.forEach((item) => {
    const card = document.createElement('article');
    card.className = 'rss-card';

    const title = document.createElement('h3');
    title.textContent = item.title;

    const meta = document.createElement('p');
    meta.className = 'timeline-meta';
    meta.textContent = `${label} · ${item.date}`;

    const link = document.createElement('a');
    link.href = item.link;
    link.target = '_blank';
    link.rel = 'noreferrer';
    link.textContent = 'Lire l’article →';

    card.appendChild(title);
    card.appendChild(meta);
    card.appendChild(link);
    container.appendChild(card);
  });

  if (!items.length) {
    renderRssEmpty(container);
  }
}

function renderRssEmpty(container) {
  container.innerHTML = '<p>Aucune entrée disponible pour le moment.</p>';
}

function renderRssError(container) {
  container.innerHTML = '<p>Impossible de charger le flux pour le moment.</p>';
}

function readRssCache(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    return null;
  }
}

function writeRssCache(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    // Ignore storage errors.
  }
}
