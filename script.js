document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initAnimationsToggle();
  initMenu();
  initContactModal();
  initStickyHeader();
  initScrollSpy();
  initRevealOnScroll();
  initCarousel();
  initTryHackMeLogo();
  initVeilleTabs();
  initRssFeeds();
  initShootingStars();
  initBlogSpaceEffects();
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
    key: 'cybermalveillance',
    url: 'https://www.cybermalveillance.gouv.fr/feed/atom-flux-complet',
    label: 'Cybermalveillance',
    sources: [
      {
        type: 'xml',
        url: 'https://r.jina.ai/http://https://www.cybermalveillance.gouv.fr/feed/atom-flux-complet',
      },
    ],
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
  {
    key: 'hibp-leaks',
    url: 'https://feeds.feedburner.com/HaveIBeenPwnedLatestBreaches',
    label: 'Have I Been Pwned',
  },
];

const RSS_TAB_MAP = {
  'cert-fr': 'alertes',
  cisa: 'alertes',
  'exploit-db': 'exploitation',
  'hacker-news': 'actualite',
  cybermalveillance: 'actualite',
  zataz: 'actualite',
  krebs: 'actualite',
  'hibp-leaks': 'leaks',
};

const RSS_TAB_COUNTS = new Map();

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

  let scrollPosition = 0;

  const setMenuState = (isOpen) => {
    menu.classList.toggle('open', isOpen);
    toggle.setAttribute('aria-expanded', String(isOpen));
    menu.setAttribute('aria-hidden', String(!isOpen));
    document.body.classList.toggle('menu-open', isOpen);
    if (isOpen) {
      scrollPosition = window.scrollY || window.pageYOffset;
      document.body.style.top = `-${scrollPosition}px`;
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
    } else {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      window.scrollTo(0, scrollPosition);
    }
  };

  toggle.addEventListener('click', () => {
    setMenuState(!menu.classList.contains('open'));
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
    if (event.key === 'Escape' && menu.classList.contains('open')) {
      setMenuState(false);
    }
  });
}

function initContactModal() {
  const modal = document.querySelector('.contact-modal');
  const triggers = document.querySelectorAll('[data-contact-href]');
  if (!modal || triggers.length === 0) return;

  const modalTitle = modal.querySelector('#contact-modal-title');
  const modalLink = modal.querySelector('#contact-modal-link');
  const closeButtons = modal.querySelectorAll('[data-modal-close]');
  const content = modal.querySelector('.contact-modal__content');
  const focusableSelector = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';
  let lastFocusedElement = null;
  let focusableElements = [];
  let firstFocusable = null;
  let lastFocusable = null;

  const setFocusableElements = () => {
    if (!content) return;
    focusableElements = Array.from(content.querySelectorAll(focusableSelector));
    firstFocusable = focusableElements[0] || null;
    lastFocusable = focusableElements[focusableElements.length - 1] || null;
  };

  const openModal = (trigger) => {
    lastFocusedElement = document.activeElement;
    if (modalTitle) {
      modalTitle.textContent = trigger.dataset.contactLabel || 'Contact';
    }
    if (modalLink) {
      modalLink.textContent = trigger.dataset.contactValue || '';
      modalLink.href = trigger.dataset.contactHref || '#';
    }
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    setFocusableElements();
    (firstFocusable || content)?.focus?.();
  };

  const closeModal = () => {
    if (!modal.classList.contains('open')) return;
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
    if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
      lastFocusedElement.focus();
    }
  };

  triggers.forEach((trigger) => {
    trigger.addEventListener('click', (event) => {
      event.preventDefault();
      openModal(trigger);
    });
  });

  closeButtons.forEach((button) => {
    button.addEventListener('click', closeModal);
  });

  modal.addEventListener('click', (event) => {
    if (event.target === modal) {
      closeModal();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (!modal.classList.contains('open')) return;
    if (event.key === 'Escape') {
      closeModal();
      return;
    }
    if (event.key !== 'Tab' || !focusableElements.length) return;
    if (event.shiftKey && document.activeElement === firstFocusable) {
      event.preventDefault();
      lastFocusable?.focus();
      return;
    }
    if (!event.shiftKey && document.activeElement === lastFocusable) {
      event.preventDefault();
      firstFocusable?.focus();
    }
  });
}

function initTryHackMeLogo() {
  const container = document.querySelector('[data-tryhackme-3d]');
  const surface = document.querySelector('[data-tryhackme-surface]');

  if (!container || !surface) return;

  // Vérifie la disponibilité de WebGL avant d'initialiser la scène 3D.
  if (typeof THREE === 'undefined' || !window.WebGLRenderingContext) {
    const fallback = document.createElement('img');
    fallback.src = 'assets/certif/tryhackme/101.png';
    fallback.alt = 'Logo TryHackMe';
    fallback.loading = 'lazy';
    fallback.decoding = 'async';
    fallback.style.width = '100%';
    fallback.style.height = '100%';
    fallback.style.objectFit = 'contain';
    surface.appendChild(fallback);
    return;
  }

  // Renderer transparent et performant pour un canvas limité au bloc.
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(0x000000, 0);
  surface.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
  camera.position.z = 2.6;

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
  const keyLight = new THREE.DirectionalLight(0xffffff, 0.7);
  keyLight.position.set(1.2, 1.1, 2.6);
  scene.add(ambientLight, keyLight);

  const group = new THREE.Group();
  scene.add(group);

  // Logo en PlaneGeometry avec un léger effet de profondeur via un plan arrière.
  const geometry = new THREE.PlaneGeometry(1, 1);
  const textureLoader = new THREE.TextureLoader();
  let logoMesh;
  let edgeMesh;
  const logoTexture = textureLoader.load('assets/certif/tryhackme/101.png', (texture) => {
    texture.colorSpace = THREE.SRGBColorSpace;
    const { width, height } = texture.image || {};
    if (width && height && logoMesh && edgeMesh) {
      const aspect = width / height;
      logoMesh.scale.set(aspect, 1, 1);
      edgeMesh.scale.set(1.02 * aspect, 1.02, 1);
    }
  });
  logoTexture.colorSpace = THREE.SRGBColorSpace;

  const logoMaterial = new THREE.MeshStandardMaterial({
    map: logoTexture,
    transparent: true,
    roughness: 0.45,
    metalness: 0.08,
  });

  logoMesh = new THREE.Mesh(geometry, logoMaterial);
  group.add(logoMesh);

  const edgeMaterial = new THREE.MeshStandardMaterial({
    color: 0x111827,
    transparent: true,
    opacity: 0.35,
    roughness: 0.85,
    metalness: 0.05,
  });
  edgeMesh = new THREE.Mesh(geometry.clone(), edgeMaterial);
  edgeMesh.position.z = -0.03;
  edgeMesh.scale.set(1.02, 1.02, 1);
  group.add(edgeMesh);

  const maxRotationX = 0.6;
  const maxRotationY = 0.8;
  const rotationSpeed = 0.005;
  const damping = 0.92;
  let velocityX = 0;
  let velocityY = 0;
  let isDragging = false;
  let lastX = 0;
  let lastY = 0;

  // Limite la rotation pour éviter des angles trop extrêmes.
  const clampRotation = () => {
    group.rotation.x = Math.max(-maxRotationX, Math.min(maxRotationX, group.rotation.x));
    group.rotation.y = Math.max(-maxRotationY, Math.min(maxRotationY, group.rotation.y));
  };

  // Gestion du drag souris/tactile avec inertie douce.
  const handlePointerDown = (event) => {
    isDragging = true;
    container.classList.add('is-dragging');
    lastX = event.clientX;
    lastY = event.clientY;
    renderer.domElement.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event) => {
    if (!isDragging) return;
    const deltaX = event.clientX - lastX;
    const deltaY = event.clientY - lastY;
    group.rotation.y += deltaX * rotationSpeed;
    group.rotation.x += deltaY * rotationSpeed;
    velocityY = deltaX * rotationSpeed;
    velocityX = deltaY * rotationSpeed;
    lastX = event.clientX;
    lastY = event.clientY;
    clampRotation();
  };

  const handlePointerUp = (event) => {
    isDragging = false;
    container.classList.remove('is-dragging');
    renderer.domElement.releasePointerCapture(event.pointerId);
  };

  const handlePointerLeave = () => {
    isDragging = false;
    container.classList.remove('is-dragging');
  };

  const handleResize = () => {
    const { width, height } = surface.getBoundingClientRect();
    if (!width || !height) return;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  };

  let resizeObserver = null;
  if (typeof ResizeObserver !== 'undefined') {
    resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(surface);
  }
  handleResize();

  const controller = new AbortController();
  const { signal } = controller;

  renderer.domElement.addEventListener('pointerdown', handlePointerDown, { signal });
  renderer.domElement.addEventListener('pointermove', handlePointerMove, { signal });
  renderer.domElement.addEventListener('pointerup', handlePointerUp, { signal });
  renderer.domElement.addEventListener('pointerleave', handlePointerLeave, { signal });
  window.addEventListener('resize', handleResize, { signal });

  const animate = () => {
    if (!isDragging) {
      group.rotation.x += velocityX;
      group.rotation.y += velocityY;
      velocityX *= damping;
      velocityY *= damping;
      if (Math.abs(velocityX) < 0.0001) velocityX = 0;
      if (Math.abs(velocityY) < 0.0001) velocityY = 0;
      clampRotation();
    }
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  };

  animate();

  window.addEventListener(
    'pagehide',
    () => {
      controller.abort();
      resizeObserver?.disconnect();
      geometry.dispose();
      logoMaterial.dispose();
      edgeMaterial.dispose();
      logoTexture.dispose();
      renderer.dispose();
    },
    { once: true }
  );
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

  if (!('IntersectionObserver' in window)) {
    elements.forEach((element) => {
      element.classList.add('is-visible');
    });
    return;
  }

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let observer;

  const reveal = (element) => {
    element.classList.add('is-visible');
  };

  const isInViewport = (element) => {
    const rect = element.getBoundingClientRect();
    return rect.top < window.innerHeight * 0.95 && rect.bottom > 0;
  };

  const revealIfInView = (element) => {
    if (isInViewport(element)) {
      reveal(element);
      return true;
    }
    return false;
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
      { rootMargin: '0px 0px -5% 0px', threshold: 0.05 }
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
      // Ensure initially visible elements appear on mobile even if the observer
      // doesn't fire when the page loads with animations enabled.
      elements.forEach((element) => {
        if (!element.classList.contains('is-visible')) {
          revealIfInView(element);
        }
      });
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

function initVeilleTabs() {
  const tabList = document.querySelector('[data-veille-tabs]');
  if (!tabList) return;

  const tabs = Array.from(tabList.querySelectorAll('[data-veille-tab]'));
  const panels = Array.from(document.querySelectorAll('[data-veille-panel]'));
  if (!tabs.length || !panels.length) return;

  const storedTab = sessionStorage.getItem('veille-tab');
  const initialTab =
    tabs.find((tab) => tab.dataset.veilleTab === storedTab)?.dataset.veilleTab
    || tabs[0]?.dataset.veilleTab;

  const setActiveTab = (tabKey, { shouldStore = true } = {}) => {
    if (!tabKey) return;

    tabs.forEach((tab) => {
      const isActive = tab.dataset.veilleTab === tabKey;
      tab.classList.toggle('active', isActive);
      tab.setAttribute('aria-selected', String(isActive));
    });

    panels.forEach((panel) => {
      const isActive = panel.dataset.veillePanel === tabKey;
      panel.classList.toggle('active', isActive);
      panel.setAttribute('aria-hidden', String(!isActive));
    });

    if (shouldStore) {
      sessionStorage.setItem('veille-tab', tabKey);
    }
  };

  setActiveTab(initialTab, { shouldStore: false });

  tabList.addEventListener('click', (event) => {
    const button = event.target.closest('[data-veille-tab]');
    if (!button) return;
    setActiveTab(button.dataset.veilleTab);
  });
}

function initCarousel() {
  const carousels = Array.from(document.querySelectorAll('[data-carousel]'));
  if (!carousels.length) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return;

  const SPEED_PX_PER_SEC = 48;

  carousels.forEach((carousel) => {
    const track = carousel.querySelector('[data-carousel-track]');
    if (!track) return;

    const baseTemplate = Array.from(track.children).map((item) => item.cloneNode(true));

    if (!baseTemplate.length) return;

    const getGapSize = () => {
      const styles = getComputedStyle(track);
      const gap = parseFloat(styles.columnGap || styles.gap || '0');
      return Number.isNaN(gap) ? 0 : gap;
    };

    const measureWidth = (items, gap) => {
      const totalWidth = items.reduce((total, item) => total + item.getBoundingClientRect().width, 0);
      const totalGap = gap * Math.max(items.length - 1, 0);
      return totalWidth + totalGap;
    };

    let baseWidth = 0;
    let offset = 0;
    let isDragging = false;
    let lastPointerX = 0;
    let rafId = null;
    let lastFrameTime = 0;

    const updateTransform = () => {
      track.style.transform = `translate3d(${offset}px, 0, 0)`;
    };

    const wrapOffset = () => {
      if (baseWidth <= 0) return;
      while (offset <= -baseWidth) {
        offset += baseWidth;
      }
      while (offset > 0) {
        offset -= baseWidth;
      }
    };

    const buildTrack = () => {
      track.innerHTML = '';
      const gap = getGapSize();
      const minWidth = carousel.clientWidth + gap;
      const baseItems = [];

      const appendBaseSet = () => {
        baseTemplate.forEach((item) => {
          const clone = item.cloneNode(true);
          clone.dataset.carouselItem = 'base';
          clone.setAttribute('draggable', 'false');
          clone.querySelectorAll('img').forEach((img) => {
            img.setAttribute('draggable', 'false');
          });
          track.appendChild(clone);
          baseItems.push(clone);
        });
      };

      appendBaseSet();
      baseWidth = measureWidth(baseItems, gap);

      while (baseWidth > 0 && baseWidth < minWidth) {
        appendBaseSet();
        baseWidth = measureWidth(baseItems, gap);
      }

      baseItems.forEach((item) => {
        const clone = item.cloneNode(true);
        clone.dataset.carouselItem = 'clone';
        clone.classList.add('is-clone');
        clone.setAttribute('aria-hidden', 'true');
        track.appendChild(clone);
      });

      offset = 0;
      wrapOffset();
      updateTransform();
    };

    const animate = (time) => {
      if (!lastFrameTime) lastFrameTime = time;
      const delta = time - lastFrameTime;
      lastFrameTime = time;

      if (!isDragging) {
        offset -= (SPEED_PX_PER_SEC * delta) / 1000;
        wrapOffset();
        updateTransform();
      }
      rafId = window.requestAnimationFrame(animate);
    };

    const stopAnimation = () => {
      if (rafId) {
        window.cancelAnimationFrame(rafId);
        rafId = null;
      }
      lastFrameTime = 0;
    };

    const startAnimation = () => {
      stopAnimation();
      rafId = window.requestAnimationFrame(animate);
    };

    const startDrag = (clientX) => {
      isDragging = true;
      lastPointerX = clientX;
      carousel.classList.add('is-dragging');
    };

    const moveDrag = (clientX) => {
      if (!isDragging) return;
      const deltaX = clientX - lastPointerX;
      lastPointerX = clientX;
      offset += deltaX;
      wrapOffset();
      updateTransform();
    };

    const endDrag = () => {
      if (!isDragging) return;
      isDragging = false;
      carousel.classList.remove('is-dragging');
    };

    buildTrack();
    startAnimation();
    window.addEventListener('resize', () => {
      buildTrack();
    });

    carousel.addEventListener('dragstart', (event) => event.preventDefault());

    carousel.addEventListener('mousedown', (event) => {
      startDrag(event.clientX);
    });

    window.addEventListener('mousemove', (event) => {
      moveDrag(event.clientX);
    });

    window.addEventListener('mouseup', endDrag);

    carousel.addEventListener('touchstart', (event) => {
      if (!event.touches.length) return;
      startDrag(event.touches[0].clientX);
    }, { passive: true });

    carousel.addEventListener('touchmove', (event) => {
      if (!isDragging || !event.touches.length) return;
      moveDrag(event.touches[0].clientX);
      event.preventDefault();
    }, { passive: false });

    carousel.addEventListener('touchend', endDrag);
    carousel.addEventListener('touchcancel', endDrag);
  });
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

function initBlogSpaceEffects() {
  const section = document.querySelector('#blog');
  if (!section) return;

  const shootingLayer = section.querySelector('[data-blog-shooting]');
  const meteorLayer = section.querySelector('[data-blog-meteors]');
  if (!shootingLayer || !meteorLayer) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const isMobile = window.matchMedia('(max-width: 720px)');
  let shootingTimeoutId;
  let meteorTimeoutId;

  const canAnimate = () => {
    return (
      document.body.dataset.animations !== 'off'
      && !prefersReducedMotion.matches
      && !isMobile.matches
    );
  };

  const clearLayers = () => {
    shootingLayer.innerHTML = '';
    meteorLayer.innerHTML = '';
  };

  const spawnShootingStar = () => {
    if (!canAnimate()) return;
    const star = document.createElement('span');
    star.className = 'blog-shooting-star';
    const top = 10 + Math.random() * 45;
    const left = 5 + Math.random() * 70;
    const distanceX = 220 + Math.random() * 180;
    const distanceY = 120 + Math.random() * 160;
    const duration = 1.2 + Math.random() * 0.8;
    star.style.top = `${top}%`;
    star.style.left = `${left}%`;
    star.style.setProperty('--shooting-distance-x', `${distanceX}px`);
    star.style.setProperty('--shooting-distance-y', `${distanceY}px`);
    star.style.setProperty('--shooting-duration', `${duration}s`);
    star.addEventListener('animationend', () => star.remove(), { once: true });
    shootingLayer.appendChild(star);
  };

  const spawnMeteor = () => {
    if (!canAnimate()) return;
    const meteor = document.createElement('span');
    meteor.className = 'blog-meteor';
    const top = 15 + Math.random() * 55;
    const left = 0 + Math.random() * 60;
    const distanceX = 260 + Math.random() * 200;
    const distanceY = 160 + Math.random() * 180;
    const duration = 2.4 + Math.random() * 1.2;
    meteor.style.top = `${top}%`;
    meteor.style.left = `${left}%`;
    meteor.style.setProperty('--meteor-distance-x', `${distanceX}px`);
    meteor.style.setProperty('--meteor-distance-y', `${distanceY}px`);
    meteor.style.setProperty('--meteor-duration', `${duration}s`);
    meteor.addEventListener('animationend', () => meteor.remove(), { once: true });
    meteorLayer.appendChild(meteor);
  };

  const scheduleShootingStars = () => {
    clearTimeout(shootingTimeoutId);
    if (!canAnimate()) {
      shootingTimeoutId = setTimeout(scheduleShootingStars, 2000);
      return;
    }
    const delay = 1400 + Math.random() * 2200;
    shootingTimeoutId = setTimeout(() => {
      spawnShootingStar();
      scheduleShootingStars();
    }, delay);
  };

  const scheduleMeteors = () => {
    clearTimeout(meteorTimeoutId);
    if (!canAnimate()) {
      meteorTimeoutId = setTimeout(scheduleMeteors, 3000);
      return;
    }
    const delay = 4200 + Math.random() * 4200;
    meteorTimeoutId = setTimeout(() => {
      spawnMeteor();
      scheduleMeteors();
    }, delay);
  };

  const refreshAnimationState = () => {
    if (!canAnimate()) {
      clearLayers();
    }
    scheduleShootingStars();
    scheduleMeteors();
  };

  const observer = new MutationObserver(refreshAnimationState);
  observer.observe(document.body, {
    attributes: true,
    attributeFilter: ['data-animations'],
  });

  prefersReducedMotion.addEventListener('change', refreshAnimationState);
  isMobile.addEventListener('change', refreshAnimationState);
  refreshAnimationState();
}

async function loadRssFeed({ key, url, label, container, sources }) {
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
    const items = await fetchRssFeed(url, sources);
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

function buildRssSources(url, customSources = []) {
  return [
    ...customSources,
    { type: 'xml', url: `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}` },
    { type: 'json', url: `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(url)}` },
  ];
}

async function fetchRssFeed(url, customSources = []) {
  const sources = buildRssSources(url, customSources);
  let lastError = null;

  for (const source of sources) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), RSS_TIMEOUT_MS);
    try {
      const response = await fetch(source.url, { signal: controller.signal, cache: 'no-store' });
      if (!response.ok) {
        throw new Error('Flux inaccessible');
      }
      if (source.type === 'json') {
        const payload = await response.json();
        const items = parseRssJsonItems(payload);
        if (items.length) {
          return items;
        }
        continue;
      }
      const text = await response.text();
      const items = parseRssItems(text);
      if (items.length) {
        return items;
      }
    } catch (error) {
      lastError = error;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  throw lastError || new Error('Flux inaccessible');
}

function parseRssJsonItems(payload) {
  const items = Array.isArray(payload?.items) ? payload.items : [];
  return items.slice(0, RSS_MAX_ITEMS).map((item) => {
    const title = item?.title?.trim() || 'Sans titre';
    const link = item?.link || item?.guid || '#';
    const pubDate = item?.pubDate || item?.published || '';
    const description = item?.description || item?.content || '';
    const date = formatRssDate(pubDate);
    const excerpt = buildExcerpt(description);
    return { title, link, date, excerpt };
  });
}

function parseRssItems(xmlText) {
  const parser = new DOMParser();
  const xml = parser.parseFromString(xmlText, 'text/xml');
  if (xml.querySelector('parsererror')) {
    throw new Error('Flux invalide');
  }
  return Array.from(xml.querySelectorAll('item, entry'))
    .slice(0, RSS_MAX_ITEMS)
    .map((entry) => {
      const title = entry.querySelector('title')?.textContent?.trim() || 'Sans titre';
      const linkElement =
        entry.querySelector('link[rel="alternate"]')
        || entry.querySelector('link');
      const link =
        linkElement?.getAttribute('href')
        || linkElement?.textContent?.trim()
        || '#';
      const pubDate =
        entry.querySelector('pubDate')?.textContent
        || entry.querySelector('dc\\:date')?.textContent
        || entry.querySelector('updated')?.textContent
        || entry.querySelector('published')?.textContent
        || '';
      const description =
        entry.querySelector('description')?.textContent
        || entry.querySelector('content\\:encoded')?.textContent
        || entry.querySelector('summary')?.textContent
        || entry.querySelector('content')?.textContent
        || '';
      const date = formatRssDate(pubDate);
      const excerpt = buildExcerpt(description);
      return { title, link, date, excerpt };
    });
}

function updateRssTabCount(feedKey, count) {
  const tabKey = RSS_TAB_MAP[feedKey];
  if (!tabKey) return;

  if (!RSS_TAB_COUNTS.has(tabKey)) {
    RSS_TAB_COUNTS.set(tabKey, new Map());
  }
  const feedCounts = RSS_TAB_COUNTS.get(tabKey);
  feedCounts.set(feedKey, count);

  const total = Array.from(feedCounts.values()).reduce((sum, value) => sum + value, 0);
  const badge = document.querySelector(`[data-veille-count="${tabKey}"]`);
  if (badge) {
    badge.textContent = total;
  }
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
    updateRssTabCount(key, items.length);
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
  if (container.dataset.rssFeed) {
    updateRssTabCount(container.dataset.rssFeed, 0);
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
  if (container.dataset.rssFeed) {
    updateRssTabCount(container.dataset.rssFeed, 0);
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
