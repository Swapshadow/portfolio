document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initAnimationsToggle();
  initMenu();
  initStickyHeader();
  initScrollSpy();
  initRevealOnScroll();
  initCarousel();
  initRssFeeds();
  initShootingStars();
});

const RSS_CACHE_PREFIX = 'rss-cache-v1';
const RSS_CACHE_TTL = 15 * 60 * 1000;
const RSS_TIMEOUT_MS = 8000;
const RSS_INITIAL_ITEMS = 5;
const RSS_MAX_ITEMS = 8;

const RSS_FEEDS = [
  {
    key: 'cert-fr',
    url: 'https://cert.ssi.gouv.fr/feed/',
    label: 'CERT-FR',
  },
  {
    key: 'cisa',
    url: 'https://www.cisa.gov/cybersecurity-advisories/all.xml',
    label: 'CISA',
  },
  {
    key: 'nvd',
    url: 'https://nvd.nist.gov/feeds/xml/cve/misc/nvd-rss.xml',
    label: 'NVD (CVE)',
  },
  {
    key: 'exploit-db',
    url: 'https://www.exploit-db.com/rss.xml',
    label: 'Exploit-DB',
  },
  {
    key: 'hacker-news',
    url: 'https://feeds.feedburner.com/TheHackersNews',
    label: 'The Hacker News',
  },
  {
    key: 'zataz',
    url: 'https://www.zataz.com/feed/',
    label: 'ZATAZ',
  },
  {
    key: 'krebs',
    url: 'https://krebsonsecurity.com/feed/',
    label: 'Krebs on Security',
  },
];

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

function initAnimationsToggle() {
  const toggle = document.querySelector('[data-animations-toggle]');
  if (!toggle) return;

  const status = toggle.querySelector('[data-animations-status]');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const storedPreference = localStorage.getItem('animations');
  let hasStoredPreference = storedPreference === 'on' || storedPreference === 'off';
  const initialState = hasStoredPreference
    ? storedPreference
    : prefersReducedMotion.matches
      ? 'off'
      : 'on';

  const applyState = (state) => {
    document.body.dataset.animations = state;
    toggle.setAttribute('aria-pressed', state === 'on');
    if (status) {
      status.textContent = state === 'on' ? 'On' : 'Off';
    }
  };

  applyState(initialState);

  toggle.addEventListener('click', () => {
    const nextState = document.body.dataset.animations === 'off' ? 'on' : 'off';
    applyState(nextState);
    localStorage.setItem('animations', nextState);
    hasStoredPreference = true;
  });

  prefersReducedMotion.addEventListener('change', (event) => {
    if (!hasStoredPreference) {
      const nextState = event.matches ? 'off' : 'on';
      applyState(nextState);
    }
  });
}

function initMenu() {
  const toggle = document.querySelector('.menu-toggle');
  const menu = document.querySelector('.site-nav');
  const close = document.querySelector('.menu-close');

  if (!toggle || !menu) return;

  const setMenuState = (isOpen) => {
    menu.classList.toggle('is-open', isOpen);
    toggle.setAttribute('aria-expanded', String(isOpen));
    menu.setAttribute('aria-hidden', String(!isOpen));
    document.body.classList.toggle('menu-open', isOpen);
  };

  toggle.addEventListener('click', () => {
    setMenuState(!menu.classList.contains('is-open'));
  });

  close?.addEventListener('click', () => setMenuState(false));

  menu.addEventListener('click', (event) => {
    if (event.target === menu) {
      setMenuState(false);
    }
  });

  menu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => setMenuState(false));
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && menu.classList.contains('is-open')) {
      setMenuState(false);
    }
  });
}

function initStickyHeader() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  const setHeaderHeight = () => {
    document.documentElement.style.setProperty('--header-height', `${header.offsetHeight}px`);
  };

  setHeaderHeight();
  window.addEventListener('resize', setHeaderHeight);

  const sentinel = document.createElement('div');
  sentinel.className = 'header-sentinel';
  header.parentNode?.insertBefore(sentinel, header);

  const observer = new IntersectionObserver(
    ([entry]) => {
      header.classList.toggle('is-sticky', !entry.isIntersecting);
    },
    { threshold: [0] }
  );

  observer.observe(sentinel);
}

function initScrollSpy() {
  const menuLinks = Array.from(
    document.querySelectorAll('.site-nav-links a:not([data-section-link])')
  );
  const sections = Array.from(document.querySelectorAll('[data-section]'));
  if (!menuLinks.length || !sections.length) return;

  const linkBySection = new Map();

  menuLinks.forEach((link) => {
    const href = link.getAttribute('href') || '';
    const hashIndex = href.indexOf('#');
    if (hashIndex !== -1) {
      const sectionId = href.slice(hashIndex + 1);
      if (sectionId) {
        linkBySection.set(sectionId, link);
      }
    }
  });

  if (linkBySection.size === 0) {
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    const pageLink =
      menuLinks.find((link) => link.getAttribute('href') === currentPath)
      || menuLinks.find((link) => link.getAttribute('href') === './' + currentPath);
    if (pageLink) {
      sections.forEach((section) => {
        linkBySection.set(section.dataset.section, pageLink);
      });
    }
  }

  const setActiveLink = (link) => {
    menuLinks.forEach((menuLink) => {
      const isActive = menuLink === link;
      menuLink.classList.toggle('active', isActive);
      if (isActive) {
        menuLink.setAttribute('aria-current', 'location');
      } else {
        menuLink.removeAttribute('aria-current');
      }
    });
  };

  const observer = new IntersectionObserver(
    (entries) => {
      const visibleSections = entries.filter((entry) => entry.isIntersecting);
      if (!visibleSections.length) return;
      const mostVisible = visibleSections.sort(
        (a, b) => b.intersectionRatio - a.intersectionRatio
      )[0];
      const sectionId = mostVisible.target.dataset.section;
      const activeLink = linkBySection.get(sectionId);
      if (activeLink) {
        setActiveLink(activeLink);
      }
    },
    {
      rootMargin: '-40% 0px -45% 0px',
      threshold: [0.2, 0.4, 0.6, 0.8],
    }
  );

  sections.forEach((section) => observer.observe(section));
}

function initRevealOnScroll() {
  const elements = Array.from(document.querySelectorAll('[data-reveal]'));
  if (!elements.length) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let observer;

  const reveal = (element) => {
    element.classList.add('is-visible');
  };

  const createObserver = () => {
    observer?.disconnect();
    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            reveal(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.2 }
    );

    elements.forEach((element) => {
      if (!element.classList.contains('is-visible')) {
        observer.observe(element);
      }
    });
  };

  const applyMotionPreference = () => {
    if (prefersReducedMotion.matches || document.body.dataset.animations === 'off') {
      elements.forEach(reveal);
      observer?.disconnect();
    } else {
      createObserver();
    }
  };

  applyMotionPreference();
  prefersReducedMotion.addEventListener('change', applyMotionPreference);

  const bodyObserver = new MutationObserver(applyMotionPreference);
  bodyObserver.observe(document.body, {
    attributes: true,
    attributeFilter: ['data-animations'],
  });
}

function initCarousel() {
  const carousel = document.querySelector('[data-carousel]');
  if (!carousel) return;

  const track = carousel.querySelector('[data-carousel-track]');
  if (!track) return;

  const cards = Array.from(track.children);
  if (!cards.length) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!prefersReducedMotion) {
    cards.forEach((card) => {
      const clone = card.cloneNode(true);
      clone.classList.add('is-clone');
      clone.setAttribute('aria-hidden', 'true');
      track.appendChild(clone);
    });
  } else {
    return;
  }

  let isPaused = false;
  let rafId;
  const speed = 0.4;

  const tick = () => {
    if (!isPaused) {
      carousel.scrollLeft += speed;
      if (carousel.scrollLeft >= track.scrollWidth / 2) {
        carousel.scrollLeft = 0;
      }
    }
    rafId = requestAnimationFrame(tick);
  };

  const start = () => {
    if (!rafId) {
      rafId = requestAnimationFrame(tick);
    }
  };

  start();

  const supportsHover = window.matchMedia('(hover: hover)').matches;
  if (supportsHover) {
    carousel.addEventListener('mouseenter', () => {
      isPaused = true;
    });

    carousel.addEventListener('mouseleave', () => {
      isPaused = false;
    });
  }

  let resumeTimeout;
  const scheduleResume = () => {
    clearTimeout(resumeTimeout);
    resumeTimeout = setTimeout(() => {
      isPaused = false;
    }, 1200);
  };

  carousel.addEventListener('pointerdown', () => {
    isPaused = true;
  });

  carousel.addEventListener('pointerup', scheduleResume);
  carousel.addEventListener('pointercancel', scheduleResume);
}


function initRssFeeds() {
  const feeds = RSS_FEEDS;

  const tasks = feeds
    .map((feed) => {
      const container = document.querySelector(`[data-rss-feed="${feed.key}"]`);
      if (!container) return null;
      return loadRssFeed({ ...feed, container });
    })
    .filter(Boolean);

  if (!tasks.length) return;
  Promise.allSettled(tasks);
}

function initShootingStars() {
  const stars = Array.from(document.querySelectorAll('.shooting-star'));
  if (!stars.length) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const isMobile = window.matchMedia('(max-width: 720px)');
  let timeoutId;

  const canAnimate = () => {
    return (
      document.body.dataset.theme === 'dark'
      && document.body.dataset.animations !== 'off'
      && !prefersReducedMotion.matches
      && !isMobile.matches
    );
  };

  const scheduleNext = () => {
    clearTimeout(timeoutId);
    if (!canAnimate()) {
      timeoutId = setTimeout(scheduleNext, 2000);
      return;
    }
    const delay = 1500 + Math.random() * 2000;
    timeoutId = setTimeout(() => {
      triggerStar();
      scheduleNext();
    }, delay);
  };

  const triggerStar = () => {
    if (!canAnimate()) {
      return;
    }
    const available = stars.filter((item) => !item.classList.contains('is-active'));
    if (!available.length) {
      return;
    }
    const star = available[Math.floor(Math.random() * available.length)];
    const top = 12 + Math.random() * 26;
    const left = 55 + Math.random() * 30;
    const angle = -18 - Math.random() * 18;
    const duration = 1.3 + Math.random() * 0.7;
    const width = 130 + Math.random() * 70;
    star.style.top = `${top}%`;
    star.style.left = `${left}%`;
    star.style.width = `${width}px`;
    star.style.setProperty('--shooting-star-angle', `${angle}deg`);
    star.style.setProperty('--shooting-star-duration', `${duration}s`);
    star.classList.add('is-active');
    star.addEventListener(
      'animationend',
      () => {
        star.classList.remove('is-active');
      },
      { once: true }
    );
  };

  const observer = new MutationObserver(() => {
    if (!canAnimate()) {
      stars.forEach((item) => item.classList.remove('is-active'));
      scheduleNext();
    }
  });

  observer.observe(document.body, {
    attributes: true,
    attributeFilter: ['data-theme', 'data-animations'],
  });

  prefersReducedMotion.addEventListener('change', scheduleNext);
  isMobile.addEventListener('change', scheduleNext);

  scheduleNext();
}

async function loadRssFeed({ key, url, label, container }) {
  const cacheKey = `${RSS_CACHE_PREFIX}:${key}`;
  const cached = readRssCache(cacheKey);
  const now = Date.now();
  const isFresh = cached && now - cached.timestamp < RSS_CACHE_TTL;
  const status = container.querySelector('[data-rss-status]');

  if (cached?.items?.length) {
    renderRssItems({ items: cached.items, container, label, key });
  }

  if (isFresh) {
    if (status) {
      status.textContent = 'Mis à jour récemment.';
    }
    return;
  }

  container.setAttribute('aria-busy', 'true');
  if (status) {
    status.textContent = 'Mise à jour en cours…';
  }

  try {
    const items = await fetchRssFeed(url);
    if (items.length) {
      writeRssCache(cacheKey, { timestamp: now, items });
      renderRssItems({ items, container, label, key });
    } else {
      renderRssEmpty(container, status);
    }
  } catch (error) {
    if (!cached?.items?.length) {
      renderRssError(container, status);
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
    .slice(0, RSS_MAX_ITEMS)
    .map((item) => {
      const title = item.querySelector('title')?.textContent?.trim() || 'Sans titre';
      const link = item.querySelector('link')?.textContent?.trim() || '#';
      const pubDate =
        item.querySelector('pubDate')?.textContent
        || item.querySelector('dc\\:date')?.textContent
        || item.querySelector('updated')?.textContent
        || '';
      const description =
        item.querySelector('description')?.textContent
        || item.querySelector('content\\:encoded')?.textContent
        || item.querySelector('summary')?.textContent
        || '';
      const date = formatRssDate(pubDate);
      const excerpt = buildExcerpt(description);
      return { title, link, date, excerpt };
    });
}

function renderRssItems({ items, container, label, key }) {
  const list = container.querySelector('[data-rss-items]');
  const status = container.querySelector('[data-rss-status]');
  const moreButton = container.querySelector('[data-rss-more]');

  if (!list) return;

  const visibleItems = items.slice(0, RSS_INITIAL_ITEMS);
  list.innerHTML = '';

  const renderSet = (set) => {
    list.innerHTML = '';
    set.forEach((item) => {
      const card = document.createElement('article');
      card.className = 'rss-item';

      const meta = document.createElement('div');
      meta.className = 'rss-item-meta';
      meta.innerHTML = `<span>${label}</span><span>${item.date}</span>`;

      const title = document.createElement('h4');
      const link = document.createElement('a');
      link.href = item.link;
      link.target = '_blank';
      link.rel = 'noreferrer';
      link.textContent = item.title;
      title.appendChild(link);

      const excerpt = document.createElement('p');
      excerpt.className = 'rss-item-excerpt';
      excerpt.textContent = item.excerpt;

      card.appendChild(meta);
      card.appendChild(title);
      card.appendChild(excerpt);
      list.appendChild(card);
    });
  };

  if (items.length) {
    renderSet(visibleItems);
    if (status) {
      status.textContent = `Dernière mise à jour · ${items[0].date}`;
    }
  } else {
    renderRssEmpty(container, status);
  }

  if (moreButton) {
    if (items.length > visibleItems.length) {
      moreButton.hidden = false;
      moreButton.onclick = () => {
        renderSet(items);
        moreButton.hidden = true;
        if (status) {
          status.textContent = `Affichage complet (${items.length} articles)`;
        }
      };
    } else {
      moreButton.hidden = true;
    }
  }
}

function renderRssEmpty(container, status) {
  const list = container.querySelector('[data-rss-items]');
  if (list) {
    list.innerHTML = '<p>Aucune entrée disponible pour le moment.</p>';
  }
  if (status) {
    status.textContent = 'Aucune entrée disponible.';
  }
}

function renderRssError(container, status) {
  const list = container.querySelector('[data-rss-items]');
  if (list) {
    list.innerHTML = '<p>Impossible de charger le flux pour le moment.</p>';
  }
  if (status) {
    status.textContent = 'Chargement indisponible.';
  }
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

function formatRssDate(value) {
  if (!value) return 'Date inconnue';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'Date inconnue';
  }
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function buildExcerpt(raw) {
  if (!raw) {
    return 'Extrait indisponible.';
  }
  const parser = new DOMParser();
  const doc = parser.parseFromString(raw, 'text/html');
  const text = (doc.body?.textContent || '').replace(/\s+/g, ' ').trim();
  if (!text) {
    return 'Extrait indisponible.';
  }
  const maxLength = 140;
  if (text.length <= maxLength) {
    return text;
  }
  return `${text.slice(0, maxLength).trim()}…`;
}
