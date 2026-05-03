import fs from 'node:fs/promises';
import crypto from 'node:crypto';

const OUTPUT_PATH = new URL('../data/cyber-feed.json', import.meta.url);
const MAX_ITEMS = 200;
export const RSS_SOURCES = [
  { name: 'CERT-FR', url: 'https://www.cert.ssi.gouv.fr/feed/', defaultType: 'CVE' },
  { name: 'CISA', url: 'https://www.cisa.gov/cybersecurity-advisories/all.xml', defaultType: 'CVE' },
  { name: 'Cyberveille Santé', url: 'https://cyberveille.esante.gouv.fr/alertes-et-vulnerabilites/rss.xml', defaultType: 'CVE' },
  { name: 'Exploit-DB', url: 'https://www.exploit-db.com/rss.xml', defaultType: 'CVE' },
  { name: 'The Hacker News', url: 'https://feeds.feedburner.com/TheHackersNews?format=xml', defaultType: 'NEWS' },
  { name: 'Cybermalveillance', url: 'https://www.cybermalveillance.gouv.fr/feed/atom-flux-complet', defaultType: 'NEWS' },
  { name: 'Zataz', url: 'https://www.zataz.com/rss/zataz-news.rss', defaultType: 'NEWS' },
  { name: 'Cybercriminalité FR', url: 'https://flipboard.com/topic/fr-cybercriminalit%C3%A9.rss', defaultType: 'NEWS' },
  { name: 'BleepingComputer', url: 'https://www.bleepingcomputer.com/feed/', defaultType: 'NEWS' },
  { name: 'Krebs on Security', url: 'https://krebsonsecurity.com/feed/', defaultType: 'NEWS' },
  { name: 'Have I Been Pwned', url: 'https://feeds.feedburner.com/HaveIBeenPwnedLatestBreaches', defaultType: 'LEAK' }
];

const generatedAt = new Date().toISOString();
const stripHtml = (v = '') => v.replace(/<!\[CDATA\[|\]\]>/g, '').replace(/<img[^>]*>/gi, ' ').replace(/<[^>]*>/g, ' ').replace(/&nbsp;/gi, ' ').replace(/\s+/g, ' ').trim();
const pick = (block, tags) => { for (const t of tags) { const m = block.match(new RegExp(`<${t}[^>]*>([\\s\\S]*?)<\\/${t}>`, 'i')); if (m) return m[1].trim(); const m2 = block.match(new RegExp(`<${t}[^>]*href="([^"]+)"[^>]*/?>`, 'i')); if (m2) return m2[1].trim(); } return ''; };
const normalizeUrl = (u = '') => { try { const x = new URL(u.trim()); ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'fbclid', 'gclid'].forEach((p) => x.searchParams.delete(p)); x.hash = ''; return x.toString(); } catch { return u.trim(); } };

function extractImageFromItem(block) {
  const fromMediaContent = block.match(/<media:content[^>]*url="([^"]+)"[^>]*>/i)?.[1];
  const fromMediaThumb = block.match(/<media:thumbnail[^>]*url="([^"]+)"[^>]*>/i)?.[1];
  const fromEnclosure = block.match(/<enclosure[^>]*url="([^"]+)"[^>]*type="image\/[^"]+"[^>]*>/i)?.[1]
    || block.match(/<enclosure[^>]*type="image\/[^"]+"[^>]*url="([^"]+)"[^>]*>/i)?.[1];
  const content = pick(block, ['content:encoded', 'content']);
  const desc = pick(block, ['description', 'summary']);
  const fromContentImg = content.match(/<img[^>]*src="([^"]+)"[^>]*>/i)?.[1];
  const fromDescImg = desc.match(/<img[^>]*src="([^"]+)"[^>]*>/i)?.[1];
  return normalizeUrl(fromMediaContent || fromMediaThumb || fromEnclosure || fromContentImg || fromDescImg || '');
}

const type = (t, d = 'NEWS') => /(cve|vulnerability|vulnérabilité|exploit|exploited|zero-day|patch|security update|kev|cvss|rce)/i.test(t) ? 'CVE' : /(leak|leaked|fuite|data breach|breach|données exposées|stolen data|database|dark web|exfiltration)/i.test(t) ? 'LEAK' : d;
const sev = (t) => /(zero-day|active exploitation|actively exploited|exploited in the wild|ransomware|kev|rce|cvss\s?9|cvss\s?10|critical vulnerability)/i.test(t) ? 'Critique' : /(cve|vulnerability|exploit|breach|malware|phishing|backdoor|trojan|botnet)/i.test(t) ? 'Élevée' : /(warning|advisory|campaign|report|threat actor|espionage)/i.test(t) ? 'Moyenne' : 'Info';

const statuses = [], merged = [];
for (const s of RSS_SOURCES) {
  try {
    const xml = await fetch(s.url, { headers: { 'user-agent': 'Mozilla/5.0' } }).then((r) => r.text());
    const blocks = [...xml.matchAll(/<(item|entry)[^>]*>([\s\S]*?)<\/\1>/gi)].map((m) => m[2]);
    let count = 0;
    for (const b of blocks) {
      const title = stripHtml(pick(b, ['title']));
      const url = normalizeUrl(pick(b, ['link', 'id']));
      if (!title || !url) continue;
      const rawSummary = pick(b, ['description', 'summary', 'content', 'content:encoded']);
      const summary = stripHtml(rawSummary).slice(0, 180);
      const imageUrl = extractImageFromItem(b) || null;
      const dRaw = stripHtml(pick(b, ['pubDate', 'published', 'updated', 'dc:date']));
      const d = new Date(dRaw);
      const publishedAt = Number.isNaN(d.getTime()) ? generatedAt : d.toISOString();
      const ctx = `${title} ${summary}`;
      merged.push({ id: crypto.createHash('sha1').update(`${url}|${s.name}`).digest('hex'), title, url, source: s.name, publishedAt, summary, type: type(ctx, s.defaultType), severity: sev(ctx), imageUrl });
      count++;
    }
    statuses.push({ name: s.name, url: s.url, status: 'ok', items: count });
  } catch (e) { statuses.push({ name: s.name, url: s.url, status: 'error', items: 0, error: String(e.message || e) }); }
}
const unique = new Map();
for (const i of merged) { const k = normalizeUrl(i.url) || `${i.title.toLowerCase()}|${i.source.toLowerCase()}`; if (!unique.has(k)) unique.set(k, i); }
const items = [...unique.values()].sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt)).slice(0, MAX_ITEMS);
await fs.writeFile(OUTPUT_PATH, `${JSON.stringify({ generatedAt, sources: statuses, items }, null, 2)}\n`);
console.info(`[Cyber Feed] ${items.length} articles générés.`);
