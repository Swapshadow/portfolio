document.addEventListener('DOMContentLoaded', () => {
  initDisplayPreferences();
  initLanguageSwitcher();
  initMenu();
  initContactModal();
  initWatchCardCleanup();
  initStickyHeader();
  initScrollSpy();
  initRevealOnScroll();
  initCarousel();
  initCyberFeed();
  initVeilleTabs();
  initRssFeeds();
  initPwaInstall();
  initWatchReader();
  initShootingStars();
  initBlogSpaceEffects();
  initFrenchBreachesEmbed();
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
    key: 'cyberveille-esante',
    url: 'https://cyberveille.esante.gouv.fr/alertes-et-vulnerabilites/rss.xml',
    label: 'Cyberveille eSanté — Alertes & vulnérabilités',
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
    url: 'https://www.zataz.com/rss/zataz-news.rss',
    label: 'ZATAZ',
  },
  {
    key: 'flipboard-cybercrime',
    url: 'https://flipboard.com/topic/fr-cybercriminalit%C3%A9.rss',
    label: 'Cybercriminalité FR',
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
  'cyberveille-esante': 'alertes',
  'exploit-db': 'exploitation',
  'hacker-news': 'actualite',
  cybermalveillance: 'actualite',
  zataz: 'actualite',
  'flipboard-cybercrime': 'actualite',
  krebs: 'actualite',
  'hibp-leaks': 'leaks',
};

const RSS_TAB_COUNTS = new Map();
const RSS_ALL_ITEMS = [];

function initWatchCardCleanup() {
  const hero = document.querySelector('.hero#accueil');
  let watchSection = document.querySelector('.watch-card-section');

  document
    .querySelectorAll('.hero-floating-card, .home-watch-card, .standalone-watch-card, .section-watch-entry')
    .forEach((node) => node.remove());

  if (!watchSection && hero) {
    watchSection = document.createElement('section');
    watchSection.className = 'watch-card-section';
    watchSection.id = 'watch-entry';
    watchSection.dataset.section = 'watch-entry';
    hero.insertAdjacentElement('afterend', watchSection);
  }

  if (!watchSection) return;

  const watchCards = Array.from(document.querySelectorAll('.watch-card'));
  const canonicalCard = watchCards.find((card) => card.closest('.watch-card-section') === watchSection) || watchCards[0] || null;

  watchCards.forEach((card) => {
    if (card !== canonicalCard) {
      card.remove();
    }
  });

  let card = canonicalCard;

  if (!card) {
    card = document.createElement('a');
    watchSection.appendChild(card);
  }

  card.className = 'watch-card';
  card.setAttribute('href', 'veille.html');
  card.setAttribute('aria-label', 'Accéder à la veille cybersécurité');
  card.setAttribute('title', 'Accéder à la veille cybersécurité');
  card.innerHTML = '<span class="watch-card-number">24/7</span><span class="watch-card-label">Veille cybersécurité & CTI</span>';

  document.querySelectorAll('.watch-card-section').forEach((section) => {
    if (section !== watchSection) {
      section.remove();
    }
  });

  document.querySelectorAll('.watch-card-number, .watch-card-label').forEach((node) => {
    if (!node.closest('.watch-card')) {
      node.remove();
    }
  });

  if (hero && hero.nextElementSibling !== watchSection) {
    hero.insertAdjacentElement('afterend', watchSection);
  }
}

const I18N_MESSAGES = {
  fr: {
    'nav.home': 'Accueil',
    'nav.journey': 'Parcours',
    'nav.certs': 'Certifications',
    'nav.watch': 'Veille',
    'nav.blog': 'Blog',
    'nav.projects': 'Projets',
    'nav.game': 'Game Zone',
    'nav.hack': 'Hack Zone',
    'hero.eyebrow': 'Infrastructure & cybersécurité',
    'hero.title': 'Jean-Baptiste Terrazzoni',
    'hero.role': 'Administrateur d’infrastructures sécurisées · Cybersécurité · Pentest junior',
    'hero.summary1': 'Je conçois et sécurise des environnements systèmes, réseaux et cloud avec une approche orientée audit, conformité et amélioration continue.',
    'hero.badge1': 'Infrastructure sécurisée',
    'hero.badge2': 'Administration système & réseau',
    'hero.badge3': 'Audit & durcissement',
    'hero.cta1': 'Découvrir mon parcours',
    'hero.cta2': 'Voir mes projets',
    'domains.academic.title': 'Parcours académique',
    'domains.academic.text': 'Formation spécialisée en administration d’infrastructures sécurisées, systèmes, réseaux et cybersécurité.',
    'domains.cert.title': 'Certifications',
    'domains.cert.text': 'Certifications techniques et formations continues validant la progression en infrastructure, réseau, sécurité et cloud.',
    'domains.watch.title': 'Veille cybersécurité',
    'domains.watch.text': 'Suivi des vulnérabilités, alertes CERT-FR, tendances cyber, ransomware, CTI et durcissement défensif.',
    'domains.projects.title': 'Projets techniques',
    'domains.projects.text': 'Déploiements, labs et documentations autour de Docker, GLPI, NetBox, supervision, systèmes Linux/Windows et sécurité réseau.',
    'domains.blog.title': 'Blog cybersécurité',
    'domains.blog.text': 'Guides pratiques, retours d’expérience et analyses techniques sur le durcissement, l’administration et la défense des SI.',
    'home.latest.title': 'Accéder aux derniers articles',
    'home.latest.cta': 'Voir tous les articles',
    'home.domains.title': 'Domaines d’expertise',
    'projects.page.title': 'Projets',
    'projects.page.intro': 'Une sélection de missions axées sur l’infrastructure, l’audit et la sécurité offensive.',
    'projects.now.title': 'Ce que je construis actuellement',
    'projects.now.intro': 'Une sélection de projets et travaux en cours autour de l’infrastructure, de la cybersécurité, de la gouvernance et de la documentation technique.',
    'cert.page.title': 'Certifications',
    'cert.page.intro': 'Une sélection de certifications validant mes compétences en sécurité, réseau et conformité.',
    'watch.page.title': 'Veille cybersécurité',
    'watch.page.intro': 'Cette page centralise une veille cybersécurité orientée vulnérabilités, exploitation active, cybercriminalité, fuites de données et actualité opérationnelle. Les flux sont agrégés automatiquement afin de faciliter le suivi quotidien des signaux cyber pertinents.',
    'watch.page.goal': 'Objectif : collecter, filtrer, qualifier et prioriser les informations utiles.',
    'watch.search.placeholder': 'Rechercher une CVE, un éditeur, une menace, un mot-clé...',
    'watch.readSource': 'Lire la source →',
    'watch.showMore': 'Afficher plus',
    'watch.showLess': 'Réduire',
    'watch.stats.alerts': 'Alertes & CVE',
    'watch.stats.exploitation': 'Exploitation active',
    'watch.stats.news': 'Actualité cyber',
    'watch.stats.leaks': 'Fuites de données',
    'watch.stats.sources': 'Sources surveillées',
    'watch.stats.updated': 'Dernière mise à jour',
    'watch.alerts.title': '🚨 Alertes & vulnérabilités',
    'watch.alerts.desc': 'Alertes officielles et bulletins CERT à surveiller en priorité.',
    'watch.severity.critical': 'Critique',
    'watch.severity.high': 'Élevée',
    'watch.severity.info': 'Information',
    'hack.fbmap.title': 'Carte mondiale des fuites de données',
    'hack.fbmap.desc': 'La carte FrenchBreaches recense des incidents et fuites de données à travers le monde avec des filtres par pays, sévérité, secteur et groupe ransomware.',
    'hack.fbmap.cta': 'Ouvrir la carte FrenchBreaches →',
    'hack.threat.desc': 'Visualisation temps réel des cyberattaques mondiales, utile pour la veille opérationnelle, l’observation des tendances d’attaque et la sensibilisation défensive.',
    'hack.threat.cta': 'Ouvrir la Live Cyber Threat Map →',
    'watch.noResults': 'Aucun signal ne correspond à vos filtres.',
    'watch.reset': 'Réinitialiser les filtres',
    'watch.results': 'résultats affichés',
    'watch.view': 'Vue',
    'watch.view.global': 'Vue globale',
    'watch.view.source': 'Vue par source',
    'watch.sort': 'Trier par',
    'watch.sort.recent': 'Plus récent',
    'watch.sort.severity': 'Criticité',
    'watch.sort.source': 'Source',
    'watch.priority': 'À traiter en priorité',
    'watch.copy': 'Copier',
    'watch.copied': 'Copié',
    'watch.favorites': 'Favoris',
    'watch.priority.mode': 'Mode prioritaire',
    'watch.priority.enabled': 'Mode prioritaire activé — seuls les signaux critiques ou sensibles sont affichés.',
    'watch.compact': 'Vue compacte',
    'watch.summary': 'Synthèse de veille',
    'watch.results.of': 'résultats affichés sur',
    'pwa.install': 'Installer l’application',
    'pwa.ios': 'Sur iPhone : Partager → Ajouter à l’écran d’accueil',
    'pwa.installed': 'Application installée',
    'blog.page.title': 'Blog',
    'zones.game.text': 'Explorez des démonstrations interactives, mini-jeux et parcours cyber immersifs.',
    'zones.game.cta': 'Ouvrir la Game Zone',
    'zones.hack.text': 'Explorez un univers cyber immersif avec visualisation d’attaques, veille offensive et démonstrations interactives.',
    'zones.hack.cta': 'Ouvrir la Hack Zone',

    'blog.back': '← Retour au blog',
    'blog.enableJs': 'Veuillez activer JavaScript pour afficher l’article.',
    'footer.copy': 'Copyright © 2026 Jean-Baptiste Terrazzoni. Tous droits réservés.',
    'footer.contactAria': 'Coordonnées',
    'contact.title': 'Contact',
    'parcours.title': 'Parcours académique',
    'parcours.intro': 'Une chronologie structurée de mes formations en cybersécurité, infrastructure et gouvernance, avec les compétences clés développées à chaque étape.',
    'parcours.badge1': 'Cybersécurité experte',
    'parcours.badge2': 'Infrastructure sécurisée',
    'parcours.badge3': 'GRC & conformité',
    'parcours.milestones': 'Étapes de formation',
    'parcours.label.ongoing': 'Diplôme · En cours',
    'parcours.skills.subtitle': 'Compétences acquises / en cours d’acquisition',
    'parcours.skill1': 'Architecture de sécurité avancée',
    'parcours.skill2': 'Gouvernance, risque et conformité',
    'parcours.skill3': 'Threat intelligence & veille cyber',
    'parcours.skill4': 'Gestion de crise et réponse à incident',
    'parcours.skill5': 'Audit, conformité et amélioration continue',
    'parcours.skill6': 'Stratégie de cybersécurité d’entreprise',
  },
  en: {
    'nav.home': 'Home',
    'nav.journey': 'Journey',
    'nav.certs': 'Certifications',
    'nav.watch': 'Watch',
    'nav.blog': 'Blog',
    'nav.projects': 'Projects',
    'nav.game': 'Game Zone',
    'nav.hack': 'Hack Zone',
    'hero.eyebrow': 'Infrastructure & Cybersecurity',
    'hero.title': 'Jean-Baptiste Terrazzoni',
    'hero.role': 'Secure Infrastructure Administrator · Cybersecurity · Junior Pentester',
    'hero.summary1': 'I design and secure systems, network, and cloud environments with a focus on auditing, compliance, and continuous improvement.',
    'hero.badge1': 'Secure Infrastructure',
    'hero.badge2': 'System & Network Administration',
    'hero.badge3': 'Audit & Hardening',
    'hero.cta1': 'Explore my journey',
    'hero.cta2': 'View my projects',
    'domains.academic.title': 'Academic Journey',
    'domains.academic.text': 'Specialized training in secure infrastructure administration, systems, networking, and cybersecurity.',
    'domains.cert.title': 'Certifications',
    'domains.cert.text': 'Technical certifications and continuous training validating progression in infrastructure, network, security, and cloud.',
    'domains.watch.title': 'Cybersecurity Watch',
    'domains.watch.text': 'Monitoring vulnerabilities, CERT-FR alerts, cyber trends, ransomware, CTI, and defensive hardening.',
    'domains.projects.title': 'Technical Projects',
    'domains.projects.text': 'Deployments, labs, and documentation around Docker, GLPI, NetBox, monitoring, Linux/Windows systems, and network security.',
    'domains.blog.title': 'Cybersecurity Blog',
    'domains.blog.text': 'Practical guides, field feedback, and technical analyses on hardening, administration, and IS defense.',
    'home.latest.title': 'Read the latest articles',
    'home.latest.cta': 'View all articles',
    'home.domains.title': 'Areas of expertise',
    'projects.page.title': 'Projects',
    'projects.page.intro': 'A selection of missions focused on infrastructure, auditing, and offensive security.',
    'projects.now.title': 'What I am currently building',
    'projects.now.intro': 'A selection of ongoing projects around infrastructure, cybersecurity, governance, and technical documentation.',
    'cert.page.title': 'Certifications',
    'cert.page.intro': 'A selection of certifications validating my skills in security, networking, and compliance.',
    'watch.page.title': 'Cybersecurity watch',
    'watch.page.intro': 'This page centralizes cybersecurity monitoring focused on vulnerabilities, active exploitation, cybercrime, data leaks, and operational news. Feeds are aggregated automatically to streamline daily tracking of relevant cyber signals.',
    'watch.page.goal': 'Goal: collect, filter, qualify, and prioritize useful intelligence.',
    'watch.search.placeholder': 'Search for a CVE, vendor, threat, keyword...',
    'watch.readSource': 'Read source →',
    'watch.showMore': 'Show more',
    'watch.showLess': 'Collapse',
    'watch.stats.alerts': 'Alerts & CVEs',
    'watch.stats.exploitation': 'Active exploitation',
    'watch.stats.news': 'Cyber news',
    'watch.stats.leaks': 'Data leaks',
    'watch.stats.sources': 'Monitored sources',
    'watch.stats.updated': 'Last update',
    'watch.alerts.title': '🚨 Alerts & vulnerabilities',
    'watch.alerts.desc': 'Official alerts and CERT advisories to monitor as a priority.',
    'watch.severity.critical': 'Critical',
    'watch.severity.high': 'High',
    'watch.severity.info': 'Information',
    'hack.fbmap.title': 'Global data breach map',
    'hack.fbmap.desc': 'The FrenchBreaches map tracks incidents and data breaches worldwide with filters by country, severity, sector and ransomware group.',
    'hack.fbmap.cta': 'Open the FrenchBreaches map →',
    'hack.threat.desc': 'Real-time visualization of global cyberattacks, useful for operational monitoring, observing attack trends and defensive awareness.',
    'hack.threat.cta': 'Open the Live Cyber Threat Map →',
    'watch.noResults': 'No signal matches your filters.',
    'watch.reset': 'Reset filters',
    'watch.results': 'results displayed',
    'watch.view': 'View',
    'watch.view.global': 'Global view',
    'watch.view.source': 'By source',
    'watch.sort': 'Sort by',
    'watch.sort.recent': 'Most recent',
    'watch.sort.severity': 'Severity',
    'watch.sort.source': 'Source',
    'watch.priority': 'Priority items',
    'watch.copy': 'Copy',
    'watch.copied': 'Copied',
    'watch.favorites': 'Favorites',
    'watch.priority.mode': 'Priority mode',
    'watch.priority.enabled': 'Priority mode enabled — only critical or sensitive signals are displayed.',
    'watch.compact': 'Compact view',
    'watch.summary': 'Watch summary',
    'watch.results.of': 'results displayed out of',
    'pwa.install': 'Install app',
    'pwa.ios': 'On iPhone: Share → Add to Home Screen',
    'pwa.installed': 'App installed',
    'blog.page.title': 'Blog',
    'zones.game.text': 'Explore interactive demos, mini-games, and immersive cyber tracks.',
    'zones.game.cta': 'Open Game Zone',
    'zones.hack.text': 'Explore an immersive cyber universe with attack visualizations, offensive watch, and interactive demos.',
    'zones.hack.cta': 'Open Hack Zone',

    'blog.back': '← Back to blog',
    'blog.enableJs': 'Please enable JavaScript to display the article.',
    'footer.copy': 'Copyright © 2026 Jean-Baptiste Terrazzoni. All rights reserved.',
    'footer.contactAria': 'Contact details',
    'contact.title': 'Contact',
    'parcours.title': 'Academic background',
    'parcours.intro': 'A structured timeline of my cybersecurity, infrastructure, and governance studies, with the core skills developed at each step.',
    'parcours.badge1': 'Expert cybersecurity',
    'parcours.badge2': 'Secure infrastructure',
    'parcours.badge3': 'GRC & compliance',
    'parcours.milestones': 'Education milestones',
    'parcours.label.ongoing': 'Degree · Ongoing',
    'parcours.skills.subtitle': 'Skills acquired / currently being developed',
    'parcours.skill1': 'Advanced security architecture',
    'parcours.skill2': 'Governance, risk, and compliance',
    'parcours.skill3': 'Threat intelligence & cyber watch',
    'parcours.skill4': 'Crisis management and incident response',
    'parcours.skill5': 'Audit, compliance, and continuous improvement',
    'parcours.skill6': 'Enterprise cybersecurity strategy',
  },
};

function initDisplayPreferences() {
  const toggle = document.querySelector('[data-settings-toggle]');
  const panel = document.querySelector('[data-settings-panel]');
  if (!toggle) return;

  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const storedTheme = localStorage.getItem('siteTheme');
  const legacyThemeMode = localStorage.getItem('theme-mode');
  const legacyTheme = localStorage.getItem('theme');
  const initialTheme = ['light', 'dark'].includes(storedTheme)
    ? storedTheme
    : ['light', 'dark'].includes(legacyThemeMode)
      ? legacyThemeMode
      : ['light', 'dark'].includes(legacyTheme)
        ? legacyTheme
        : (prefersDark.matches ? 'dark' : 'light');

  const storedAnimations = localStorage.getItem('animations');
  const hasStoredAnimations = storedAnimations === 'on' || storedAnimations === 'off';
  const animationsMode = hasStoredAnimations
    ? storedAnimations
    : prefersReducedMotion.matches
      ? 'off'
      : 'on';

  const updateThemeButton = (theme) => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    const icon = theme === 'dark' ? '☀️' : '🌙';
    const label = theme === 'dark' ? 'Activer le thème clair' : 'Activer le thème sombre';
    const title = theme === 'dark' ? 'Passer en mode clair' : 'Passer en mode sombre';
    toggle.classList.add('theme-toggle-emoji');
    toggle.textContent = icon;
    toggle.dataset.theme = theme;
    toggle.dataset.nextTheme = nextTheme;
    toggle.setAttribute('aria-label', label);
    toggle.setAttribute('title', title);
  };

  const applyTheme = (theme) => {
    document.body.dataset.theme = theme;
    localStorage.setItem('siteTheme', theme);
    localStorage.setItem('theme-mode', theme);
    localStorage.removeItem('theme');
    updateThemeButton(theme);
  };

  const applyAnimationsMode = (mode) => {
    document.body.dataset.animations = mode;
    localStorage.setItem('animations', mode);
  };

  if (panel) {
    panel.hidden = true;
  }

  applyTheme(initialTheme);
  applyAnimationsMode(animationsMode);

  toggle.addEventListener('click', () => {
    const nextTheme = document.body.dataset.theme === 'dark' ? 'light' : 'dark';
    applyTheme(nextTheme);
  });

  prefersDark.addEventListener('change', (event) => {
    if (!localStorage.getItem('siteTheme')) {
      applyTheme(event.matches ? 'dark' : 'light');
    }
  });

  prefersReducedMotion.addEventListener('change', (event) => {
    if (!hasStoredAnimations) {
      applyAnimationsMode(event.matches ? 'off' : 'on');
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

function initLanguageSwitcher() {
  const navActions = document.querySelectorAll('.nav-actions, .nav-controls, .header-actions');
  navActions.forEach((navAction) => {
    if (navAction.querySelector('[data-language-toggle]')) return;
    const languageToggle = document.createElement('button');
    languageToggle.className = 'nav-icon-button language-toggle';
    languageToggle.type = 'button';
    languageToggle.dataset.languageToggle = '';
    const menuToggle = navAction.querySelector('.menu-toggle');
    if (menuToggle) navAction.insertBefore(languageToggle, menuToggle);
    else navAction.appendChild(languageToggle);
  });

  const languageToggles = document.querySelectorAll('[data-language-toggle], .language-toggle');
  if (!languageToggles.length) return;

  const applyLanguage = (lang) => {
    const locale = lang === 'en' ? 'en' : 'fr';
    document.documentElement.lang = locale;
    document.body.dataset.lang = locale;
    localStorage.setItem('portfolio-lang', locale);

    languageToggles.forEach((languageToggle) => {
      if (locale === 'fr') {
        languageToggle.textContent = '🇬🇧';
        languageToggle.setAttribute('aria-label', 'Switch to English');
        languageToggle.setAttribute('title', 'Switch to English');
      } else {
        languageToggle.textContent = '🇫🇷';
        languageToggle.setAttribute('aria-label', 'Passer en français');
        languageToggle.setAttribute('title', 'Passer en français');
      }
    });

    document.querySelectorAll('[data-i18n]').forEach((node) => {
      const key = node.dataset.i18n;
      const translation = I18N_MESSAGES[locale]?.[key];
      if (translation) node.textContent = translation;
      else if (key) console.warn(`[i18n] Missing translation for key "${key}" in locale "${locale}"`);
    });

    document.querySelectorAll('[data-i18n-aria-label]').forEach((node) => {
      const key = node.dataset.i18nAriaLabel;
      const translation = I18N_MESSAGES[locale]?.[key];
      if (translation) node.setAttribute('aria-label', translation);
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach((node) => {
      const key = node.dataset.i18nPlaceholder;
      const translation = I18N_MESSAGES[locale]?.[key];
      if (translation) node.setAttribute('placeholder', translation);
    });

    document.dispatchEvent(new CustomEvent('portfolio:languagechange', { detail: { lang: locale } }));
  };

  const storedLanguage = localStorage.getItem('portfolio-lang') || localStorage.getItem('siteLanguage') || localStorage.getItem('site-language');
  applyLanguage(storedLanguage === 'en' ? 'en' : 'fr');

  languageToggles.forEach((languageToggle) => {
    languageToggle.addEventListener('click', () => {
      const nextLanguage = document.documentElement.lang === 'fr' ? 'en' : 'fr';
      applyLanguage(nextLanguage);
    });
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

  const SPEED_PX_PER_SEC = 36;

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
    let isRebuildScheduled = false;

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
      const delta = Math.min(time - lastFrameTime, 64);
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

    const scheduleRebuild = () => {
      if (isRebuildScheduled) return;
      isRebuildScheduled = true;
      window.requestAnimationFrame(() => {
        isRebuildScheduled = false;
        buildTrack();
      });
    };

    baseTemplate.forEach((item) => {
      item.querySelectorAll('img').forEach((img) => {
        if (img.complete) return;
        img.addEventListener('load', scheduleRebuild, { once: true });
        img.addEventListener('error', scheduleRebuild, { once: true });
      });
    });

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
  Promise.allSettled(tasks).finally(() => updateWatchDashboard());
  initWatchFilters();
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
  const normalized = url.replace(/^https?:\/\//, '');
  return [
    ...customSources,
    { type: 'xml', url: `https://r.jina.ai/http://${normalized}` },
    { type: 'xml', url: `https://r.jina.ai/http://https://${normalized}` },
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
    return { title, link, pubDate, description, date, excerpt };
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
      return { title, link, pubDate, description, date, excerpt };
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
  const locale = document.documentElement.lang === 'en' ? 'en' : 'fr';
  const t = (k, f) => I18N_MESSAGES[locale]?.[k] || f;
  const favorites = new Set(JSON.parse(localStorage.getItem('watchFavorites') || '[]'));

  const visibleItems = items.slice(0, 6);
  list.innerHTML = '';

  const renderSet = (set) => {
    list.innerHTML = '';
    set.forEach((item) => {
      const card = document.createElement('article');
      card.className = 'rss-item';
      const severity = computeSeverity(`${item.title} ${item.excerpt}`);
      card.dataset.severity = severity.level;
      const panelKey = card.closest('.veille-panel')?.dataset.veillePanel || '';
      card.dataset.search = `${item.title} ${item.excerpt} ${label} ${item.date} ${panelKey} ${severity.label}`.toLowerCase();

      const meta = document.createElement('div');
      meta.className = 'rss-item-meta';
      meta.innerHTML = `<span>${label}</span><span>${item.date}</span>`;
      const sevBadge = document.createElement('span');
      sevBadge.className = `rss-severity rss-severity-${severity.level}`;
      sevBadge.textContent = severity.label;
      meta.appendChild(sevBadge);
      const priorityBadge = document.createElement('span');
      priorityBadge.className = 'rss-priority-score';
      priorityBadge.textContent = `${locale === 'en' ? 'Priority' : 'Priorité'} ${computePriorityScore(card.dataset.search, severity.level)}`;
      meta.appendChild(priorityBadge);

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
      const cta = document.createElement('a');
      cta.className = 'rss-read-more';
      cta.href = item.link;
      cta.target = '_blank';
      cta.rel = 'noopener noreferrer';
      cta.dataset.i18n = 'watch.readSource';
      cta.textContent = t('watch.readSource', 'Lire la source →');
      const actions = document.createElement('div');
      actions.className = 'rss-item-actions';
      const copyBtn = document.createElement('button');
      copyBtn.type = 'button';
      copyBtn.className = 'rss-copy';
      copyBtn.textContent = t('watch.copy', 'Copier');
      copyBtn.addEventListener('click', async () => {
        const payload = `[${severity.label}] ${item.title}\nSource : ${label}\nDate : ${item.date}\nCatégorie : ${key}\nRésumé : ${item.excerpt}\nLien : ${item.link}`;
        await navigator.clipboard.writeText(payload).catch(() => {});
        copyBtn.textContent = t('watch.copied', 'Copié');
        setTimeout(() => { copyBtn.textContent = t('watch.copy', 'Copier'); }, 1000);
      });
      const favBtn = document.createElement('button');
      favBtn.type = 'button';
      favBtn.className = 'rss-favorite';
      const favKey = item.link;
      const refreshFav = () => { favBtn.textContent = favorites.has(favKey) ? '★' : '☆'; card.dataset.favorite = favorites.has(favKey) ? '1' : ''; };
      favBtn.addEventListener('click', () => {
        if (favorites.has(favKey)) favorites.delete(favKey); else favorites.add(favKey);
        localStorage.setItem('watchFavorites', JSON.stringify(Array.from(favorites)));
        refreshFav();
      });
      refreshFav();
      actions.append(copyBtn, favBtn);
      const tags = detectWatchTags(`${item.title} ${item.excerpt}`);
      if (tags.length) {
        const wrap = document.createElement('div');
        wrap.className = 'rss-tags';
        tags.forEach((tag) => {
          const s = document.createElement('span');
          s.className = 'rss-tag';
          s.textContent = tag;
          wrap.appendChild(s);
        });
        card.appendChild(wrap);
      }

      card.appendChild(meta);
      card.appendChild(title);
      card.appendChild(excerpt);
      card.appendChild(cta);
      card.appendChild(actions);
      list.appendChild(card);
    });
  };

  if (items.length) {
    renderSet(visibleItems);
    if (status) {
      status.textContent = `${t('watch.stats.updated', 'Dernière mise à jour')} · ${items[0].date}`;
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
        moreButton.dataset.expanded = 'true';
        moreButton.textContent = t('watch.showLess', 'Réduire');
        moreButton.onclick = () => {
          renderSet(visibleItems);
          moreButton.dataset.expanded = 'false';
          moreButton.textContent = t('watch.showMore', 'Afficher plus');
        };
        if (status) {
          status.textContent = `Affichage complet (${items.length} articles)`;
        }
      };
      moreButton.textContent = t('watch.showMore', 'Afficher plus');
    } else {
      moreButton.hidden = true;
    }
  }
  RSS_ALL_ITEMS.push(...items.map((item) => ({ ...item, key, label })));
  updateWatchDashboard();
  document.dispatchEvent(new CustomEvent('rss:updated'));
}

function computeSeverity(text) {
  const locale = document.documentElement.lang === 'en' ? 'en' : 'fr';
  const t = (k, f) => I18N_MESSAGES[locale]?.[k] || f;
  const value = (text || '').toLowerCase();
  const critical = ['critical', 'critique', 'rce', 'remote code execution', '0-day', 'zero-day', 'exploited', 'exploitation active', 'ransomware', 'cvss 9', 'cvss 10'];
  const high = ['cve', 'vulnérabilité', 'vulnerability', 'patch', 'security update', 'compromission', 'malware'];
  if (critical.some((k) => value.includes(k))) return { level: 'critical', label: t('watch.severity.critical', 'Critique') };
  if (high.some((k) => value.includes(k))) return { level: 'high', label: t('watch.severity.high', 'Élevée') };
  return { level: 'info', label: t('watch.severity.info', 'Information') };
}

function detectWatchTags(text) {
  const value = (text || '').toLowerCase();
  const rules = ['CVE', 'Ransomware', 'Exploitation active', 'Patch', 'Microsoft', 'Fortinet', 'Cisco', 'Oracle', 'Linux', 'Cloud', 'Santé', 'Data leak', 'Malware'];
  return rules.filter((tag) => value.includes(tag.toLowerCase()));
}

function computePriorityScore(haystack, severity) {
  let score = severity === 'critical' ? 50 : severity === 'high' ? 20 : 0;
  const add = (k, v) => { if (haystack.includes(k)) score += v; };
  add('rce', 30); add('0-day', 30); add('zero-day', 30); add('exploited', 30); add('exploitation active', 30);
  add('ransomware', 25); add('cisa kev', 25); add('cvss 9', 25); add('cvss 10', 25);
  add('sante', 15); add('esante', 15); add('hospital', 15); add('healthcare', 15);
  add('cve', 10); add('patch', 5); add('security update', 5);
  return score;
}

function initWatchFilters() {
  const search = document.querySelector('[data-watch-search]');
  if (!search) return;
  const chips = Array.from(document.querySelectorAll('.watch-chip'));
  const resetButton = document.querySelector('[data-watch-reset]');
  const noResults = document.querySelector('[data-watch-no-results]');
  const resultsCount = document.querySelector('[data-watch-results-count]');
  const viewSelect = document.querySelector('[data-watch-view]');
  const sortSelect = document.querySelector('[data-watch-sort]');
  const priorityBox = document.querySelector('[data-watch-priority]');
  const priorityToggle = document.querySelector('[data-watch-priority-toggle]');
  const compactToggle = document.querySelector('[data-watch-compact-toggle]');
  const priorityBanner = document.querySelector('[data-watch-priority-banner]');
  const summaryText = document.querySelector('[data-watch-summary-text]');
  if (viewSelect) viewSelect.value = localStorage.getItem('watch-view') || 'source';
  if (sortSelect) sortSelect.value = localStorage.getItem('watch-sort') || 'recent';
  if (priorityToggle) priorityToggle.checked = localStorage.getItem('watch-priority') === '1';
  if (compactToggle) compactToggle.checked = localStorage.getItem('watch-compact') === '1';

  const normalize = (value) => (value || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const update = () => {
    const term = normalize(search.value);
    const activeFilters = chips.filter((chip) => chip.classList.contains('active')).map((chip) => normalize(chip.dataset.watchFilter));
    const activeTab = document.querySelector('.veille-panel.active')?.dataset.veillePanel || '';
    const viewMode = viewSelect?.value || localStorage.getItem('watch-view') || 'source';
    const sortMode = sortSelect?.value || localStorage.getItem('watch-sort') || 'recent';
    const priorityMode = priorityToggle?.checked;
    const compactMode = compactToggle?.checked;
    let visible = 0;
    let totalInTab = 0;
    const visibleCards = [];

    document.querySelectorAll('.rss-item').forEach((card) => {
      const inActiveTab = card.closest('.veille-panel')?.dataset.veillePanel === activeTab;
      const haystack = normalize(card.dataset.search || '');
      const severity = normalize(card.dataset.severity || '');
      const matchesSearch = !term || haystack.includes(term);
      const matchesFilters = activeFilters.every((filter) => haystack.includes(filter) || severity.includes(filter));
      const isPriority = card.dataset.severity === 'critical' || ['rce','0-day','zero-day','exploited','exploitation active','ransomware','cisa kev','cvss 9','cvss 10','sante','esante','hospital','healthcare','compromission','fuite de donnees majeure','vulnerabilite critique'].some((k)=> haystack.includes(normalize(k)));
      if (inActiveTab) totalInTab += 1;
      const isVisible = inActiveTab && matchesSearch && matchesFilters && (!priorityMode || isPriority);
      card.hidden = !isVisible;
      card.classList.toggle('rss-item-compact', !!compactMode);
      card.dataset.priorityScore = String(computePriorityScore(haystack, card.dataset.severity));
      if (isVisible) visible += 1;
      if (isVisible) visibleCards.push(card);
    });

    if (sortMode === 'source') visibleCards.sort((a,b)=> (a.dataset.search||'').localeCompare(b.dataset.search||''));
    if (sortMode === 'severity') visibleCards.sort((a,b)=> ({critical:3,high:2,info:1}[b.dataset.severity]-({critical:3,high:2,info:1}[a.dataset.severity])));
    visibleCards.forEach((card)=> card.parentElement?.appendChild(card));

    document.body.dataset.watchView = viewMode;
    document.querySelectorAll('.rss-sources').forEach((group)=> group.classList.toggle('watch-global-view', viewMode==='global'));

    document.querySelectorAll('.rss-source').forEach((source) => {
      const hasVisible = Array.from(source.querySelectorAll('.rss-item')).some((item) => !item.hidden);
      source.hidden = !hasVisible;
    });

    if (resultsCount) {
      const locale = document.documentElement.lang === 'en' ? 'en' : 'fr';
      const suffix = I18N_MESSAGES[locale]?.['watch.results.of'] || 'résultats affichés sur';
      resultsCount.textContent = term
        ? `${visible} ${I18N_MESSAGES[locale]?.['watch.results'] || 'résultats affichés'} "${search.value}"`
        : `${visible} ${suffix} ${totalInTab}`;
    }
    if (noResults) noResults.hidden = visible !== 0;
    if (priorityBanner) priorityBanner.hidden = !priorityMode;
    if (summaryText) {
      const critical = visibleCards.filter((c)=> c.dataset.severity === 'critical').length;
      const tags = visibleCards.flatMap((c)=> Array.from(c.querySelectorAll('.rss-tag')).map((n)=>n.textContent)).slice(0,4).join(', ');
      summaryText.textContent = `${critical} ${locale === 'en' ? 'critical signals detected.' : 'signaux critiques détectés.'} ${locale === 'en' ? 'Main topics:' : 'Thèmes dominants :'} ${tags || 'CVE, ransomware'}.`;
    }
  };

  search.addEventListener('input', update);
  chips.forEach((chip) => {
    chip.addEventListener('click', () => {
      chip.classList.toggle('active');
      update();
    });
  });
  viewSelect?.addEventListener('change', () => { localStorage.setItem('watch-view', viewSelect.value); update(); });
  sortSelect?.addEventListener('change', () => { localStorage.setItem('watch-sort', sortSelect.value); update(); });
  priorityToggle?.addEventListener('change', () => { localStorage.setItem('watch-priority', priorityToggle.checked ? '1' : '0'); update(); });
  compactToggle?.addEventListener('change', () => { localStorage.setItem('watch-compact', compactToggle.checked ? '1' : '0'); update(); });
  resetButton?.addEventListener('click', () => {
    search.value = '';
    chips.forEach((chip) => chip.classList.remove('active'));
    const firstTab = document.querySelector('[data-veille-tab]');
    firstTab?.click();
    update();
  });
  document.querySelector('[data-veille-tabs]')?.addEventListener('click', () => setTimeout(update, 0));
  document.addEventListener('portfolio:languagechange', update);
  update();
}

function updateWatchDashboard() {
  const set = (key, value) => {
    const node = document.querySelector(`[data-watch-stat="${key}"]`);
    if (node) node.textContent = value;
  };
  const bySeverity = { critical: 0, high: 0, info: 0 };
  RSS_ALL_ITEMS.forEach((item) => bySeverity[computeSeverity(`${item.title} ${item.excerpt}`).level] += 1);
  set('alerts', RSS_TAB_COUNTS.get('alertes') ? Array.from(RSS_TAB_COUNTS.get('alertes').values()).reduce((a,b)=>a+b,0) : 0);
  set('exploitation', RSS_TAB_COUNTS.get('exploitation') ? Array.from(RSS_TAB_COUNTS.get('exploitation').values()).reduce((a,b)=>a+b,0) : 0);
  set('news', RSS_TAB_COUNTS.get('actualite') ? Array.from(RSS_TAB_COUNTS.get('actualite').values()).reduce((a,b)=>a+b,0) : 0);
  set('leaks', RSS_TAB_COUNTS.get('leaks') ? Array.from(RSS_TAB_COUNTS.get('leaks').values()).reduce((a,b)=>a+b,0) : 0);
  set('sources', document.querySelectorAll('[data-rss-feed]').length);
  set('updated', new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }));
}

function initWatchReader() {
  const card = document.querySelector('[data-reader-card]');
  if (!card) return;
  const title = card.querySelector('[data-reader-title]');
  const meta = card.querySelector('[data-reader-meta]');
  const excerpt = card.querySelector('[data-reader-excerpt]');
  const link = card.querySelector('[data-reader-link]');
  const progress = card.querySelector('[data-reader-progress]');
  const progressBar = card.querySelector('[data-reader-progress-bar]');
  const nextBtn = card.querySelector('[data-reader-next]');
  const prevBtn = card.querySelector('[data-reader-prev]');
  const copyBtn = card.querySelector('[data-reader-copy]');
  const chips = Array.from(document.querySelectorAll('[data-reader-filter]'));
  let idx = 0;
  let currentFilter = 'all';

  const score = (item) => {
    const txt = `${item.title} ${item.excerpt}`.toLowerCase();
    let s = 0; if (computeSeverity(txt).level === 'critical') s += 100;
    if (txt.includes('exploitation active') || txt.includes('exploited') || txt.includes('rce') || txt.includes('0-day')) s += 80;
    if (txt.includes('fuite') || txt.includes('leak')) s += 60;
    if (txt.includes('ransomware')) s += 50;
    if (txt.includes('cve')) s += 30;
    return s;
  };

  const buildItems = () => (RSS_ALL_ITEMS.length ? RSS_ALL_ITEMS : Array.from(document.querySelectorAll('.rss-item')).map((el) => ({
    title: el.querySelector('h4 a')?.textContent || '',
    link: el.querySelector('h4 a')?.href || '#',
    date: el.querySelector('.rss-item-meta span:last-child')?.textContent || '',
    excerpt: el.querySelector('.rss-item-excerpt')?.textContent || '',
    label: el.querySelector('.rss-item-meta span:first-child')?.textContent || 'Source'
  })));
  const filtered = () => buildItems()
    .map((i) => ({ ...i, severity: computeSeverity(`${i.title} ${i.excerpt}`) }))
    .filter((i) => currentFilter === 'all' || `${i.title} ${i.excerpt} ${i.label}`.toLowerCase().includes(currentFilter))
    .sort((a,b) => score(b)-score(a));

  const render = () => {
    const items = filtered();
    document.querySelectorAll('.veille-panels').forEach((el)=> el.hidden = false);
    if (!items.length) {
      title.textContent = 'Aucune alerte disponible';
      meta.textContent = '';
      excerpt.textContent = '';
      progress.textContent = 'Article 0 / 0';
      link.href = '#';
      return;
    }
    if (idx >= items.length) {
      title.textContent = 'Vous avez consulté toutes les alertes.';
      meta.textContent = '';
      excerpt.textContent = '';
      progress.textContent = `Article ${items.length} / ${items.length}`;
      link.href = '#';
      nextBtn.textContent = 'Suivant';
      return;
    }
    const item = items[idx];
    nextBtn.textContent = 'Suivant';
    title.textContent = item.title;
    meta.textContent = `${item.label} · ${item.date} · ${item.severity.label}`;
    excerpt.textContent = item.excerpt;
    link.href = item.link;
    progress.textContent = `Article ${idx + 1} / ${items.length}`;
    progressBar.style.width = `${((idx + 1) / items.length) * 100}%`;
  };

  nextBtn?.addEventListener('click', () => { idx = Math.min(idx + 1, Math.max(filtered().length - 1, 0)); render(); });
  prevBtn?.addEventListener('click', () => { idx = Math.max(idx - 1, 0); render(); });
  copyBtn?.addEventListener('click', async () => { await navigator.clipboard.writeText(`${title.textContent}\n${meta.textContent}\n${excerpt.textContent}\n${link.href}`); });
  chips.forEach((chip) => chip.addEventListener('click', () => {
    chips.forEach((c) => c.classList.remove('active'));
    chip.classList.add('active');
    currentFilter = chip.dataset.readerFilter;
    idx = 0;
    render();
  }));
  card.addEventListener('touchstart', (e) => { card.dataset.touchX = String(e.changedTouches[0].clientX); }, { passive: true });
  card.addEventListener('touchend', (e) => { const dx = (parseFloat(card.dataset.touchX||'0') - e.changedTouches[0].clientX); if (dx > 45) { idx = Math.min(idx + 1, Math.max(filtered().length - 1, 0)); render(); } else if (dx < -45) { idx = Math.max(idx - 1, 0); render(); } }, { passive: true });
  document.addEventListener('keydown', (e) => { if (e.key === 'ArrowRight' || e.key === ' ') { idx = Math.min(idx + 1, Math.max(filtered().length - 1, 0)); render(); } if (e.key === 'ArrowLeft') { idx = Math.max(idx - 1, 0); render(); } });
  document.addEventListener('click', (e) => {
    const itemCard = e.target.closest('.rss-item');
    if (!itemCard) return;
    const t = itemCard.querySelector('h4 a')?.textContent;
    const items = filtered();
    const found = items.findIndex((it) => it.title === t);
    if (found >= 0) {
      idx = found;
      render();
      window.scrollTo({ top: card.getBoundingClientRect().top + window.scrollY - 90, behavior: 'smooth' });
    }
  });
  document.addEventListener('rss:updated', render);
  setInterval(render, 1500);
}

function initPwaInstall() {
  const btn = document.querySelector('[data-pwa-install]');
  const hint = document.querySelector('[data-pwa-ios-hint]');
  const installed = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
  if (installed) {
    if (hint) { hint.hidden = false; hint.textContent = I18N_MESSAGES[document.documentElement.lang === 'en' ? 'en' : 'fr']['pwa.installed']; }
    if (btn) btn.hidden = true;
    return;
  }
  let deferredPrompt = null;
  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    deferredPrompt = event;
    if (btn) btn.hidden = false;
  });
  btn?.addEventListener('click', async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    deferredPrompt = null;
    btn.hidden = true;
  });
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
  if (isIOS && hint) hint.hidden = false;
}

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/portfolio/sw.js').catch((error) => console.warn('Service worker registration failed:', error));
  });
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
  const locale = document.documentElement.lang === 'en' ? 'en' : 'fr';
  const t = (k, f) => I18N_MESSAGES[locale]?.[k] || f;



async function fetchRssItems(feed) {
  const entries = await fetchRssFeed(feed.url, feed.sources || []);
  return entries
    .map((item) => ({
      title: item.title || '',
      link: item.link || '',
      pubDate: item.pubDate || item.date || '',
      description: item.description || item.excerpt || '',
    }))
    .filter((item) => item.title && item.link);
}

function initCyberFeed() {
  const list = document.querySelector('[data-cyber-list]');
  if (!list) return;
  const disclaimer = document.querySelector('[data-cyber-disclaimer]');
  let allItems = [];

  const normalize = (v) => (v || '').toLowerCase();
  const containsAny = (text, terms) => terms.some((term) => text.includes(term));

  const classifySeverity = (text) => {
    const t = normalize(text);
    if (containsAny(t, ['zero-day', 'active exploitation', 'exploited', 'ransomware', 'kev', 'rce', 'cvss 9', 'cvss 10'])) return 'Critique';
    if (containsAny(t, ['cve', 'vulnerability', 'exploit', 'breach', 'malware', 'phishing'])) return 'Élevée';
    if (containsAny(t, ['warning', 'advisory', 'campaign', 'report'])) return 'Moyenne';
    return 'Info';
  };

  function render() {
    if (!allItems.length) {
      list.innerHTML = '';
      return;
    }
    list.innerHTML = allItems.map((it) => `<article class="cyber-feed-card"><div class="cyber-feed-meta"><span>Source : ${escapeHtml(it.source)}</span><span>${formatDate(it.pubDate)}</span></div><div class="cyber-feed-tags"><span class="rss-severity rss-severity-${it.severity.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')}">Criticité : ${it.severity}</span></div><h3>${escapeHtml(it.title)}</h3><p>${escapeHtml(truncateText(it.description || '', 170))}</p><div class="cyber-feed-card-actions"><a class="button" href="${it.link}" target="_blank" rel="noopener noreferrer">Lire la source</a></div></article>`).join('');
  }

  Promise.allSettled(RSS_FEEDS.map((feed) => fetchRssItems(feed).then((feedItems) => feedItems.forEach((it) => {
    const text = `${it.title || ''} ${it.description || ''}`;
    allItems.push({ ...it, source: feed.label, severity: classifySeverity(text) });
  })))).then((results) => {
    allItems = allItems.filter((it) => it.title && it.link).sort((a, b) => new Date(b.pubDate || 0) - new Date(a.pubDate || 0));
    const hasNoData = allItems.length === 0;
    if (disclaimer) {
      disclaimer.hidden = !hasNoData;
      disclaimer.textContent = 'Impossible de charger les flux RSS pour le moment.';
    }
    results.filter((r) => r.status === 'rejected').forEach((errorResult) => {
      console.error('[CyberFeed] RSS source indisponible:', errorResult.reason);
    });
    render();
  });
}
