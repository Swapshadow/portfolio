document.addEventListener('DOMContentLoaded', () => {
  initCarousel();
  initRssFeeds();
});

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
    track.style.transform = `translateX(-${index * cardWidth}px)`;
  };

  prev.addEventListener('click', () => {
    index = Math.max(index - 1, 0);
    update();
  });

  next.addEventListener('click', () => {
    const total = track.children.length;
    const maxIndex = Math.max(total - 1, 0);
    index = Math.min(index + 1, maxIndex);
    update();
  });

  window.addEventListener('resize', update);
  update();
}

function initRssFeeds() {
  const certContainer = document.querySelector('[data-rss-container="cert-fr"]');
  const hnContainer = document.querySelector('[data-rss-container="hacker-news"]');

  if (certContainer) {
    fetchRss(
      'https://cert.ssi.gouv.fr/feed/',
      certContainer,
      'CERT-FR'
    );
  }

  if (hnContainer) {
    fetchRss(
      'https://feeds.feedburner.com/TheHackersNews',
      hnContainer,
      'The Hacker News'
    );
  }
}

async function fetchRss(url, container, sourceLabel) {
  const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;

  try {
    const response = await fetch(proxyUrl);
    if (!response.ok) {
      throw new Error('Flux inaccessible');
    }
    const text = await response.text();
    const parser = new DOMParser();
    const xml = parser.parseFromString(text, 'text/xml');
    const items = Array.from(xml.querySelectorAll('item')).slice(0, 6);

    container.innerHTML = '';

    items.forEach((item) => {
      const title = item.querySelector('title')?.textContent ?? 'Sans titre';
      const link = item.querySelector('link')?.textContent ?? '#';
      const pubDate = item.querySelector('pubDate')?.textContent ?? '';
      const date = pubDate ? new Date(pubDate).toLocaleDateString('fr-FR') : 'Date inconnue';

      const card = document.createElement('article');
      card.className = 'rss-card';
      card.innerHTML = `
        <h3>${title}</h3>
        <p class="timeline-meta">${sourceLabel} · ${date}</p>
        <a href="${link}" target="_blank" rel="noreferrer">Lire l’article →</a>
      `;
      container.appendChild(card);
    });

    if (!items.length) {
      container.innerHTML = '<p>Aucune entrée disponible pour le moment.</p>';
    }
  } catch (error) {
    container.innerHTML = '<p>Impossible de charger le flux pour le moment.</p>';
  }
}
