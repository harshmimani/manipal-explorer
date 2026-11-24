// Shared data helpers for the Part 3 art-direction explorations.
// Everything rendered comes from src/data (Parts 1–2). No copy is invented here
// except the hero headline/sub-line and chapter opener lines, which are site copy.
import places from '../../src/data/places.json';
import credits from '../../src/data/image-credits.json';
import trips from '../../src/data/tripIdeas.json';
import festivals from '../../src/data/festivals.json';

export const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export const thisMonth = new Date().getMonth() + 1;

export const place = (id) => places.find((p) => p.id === id);
export const credit = (id) => credits[id];
export const stats = {
  places: places.length,
  trips: trips.length,
  festivals: festivals.length,
  chapter: (c) => places.filter((p) => p.chapter === c).length,
};

export const isGoodNow = (p) => Array.isArray(p.bestMonths) && p.bestMonths.includes(thisMonth);

const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
export { esc };

// Responsive <picture> from a credit id. Images live in public/, served at the Vite base.
export function picture(id, { sizes = '100vw', cls = '', eager = false, alt } = {}) {
  const c = credit(id);
  if (!c) return '';
  const base = `../${c.file}`;
  const set = (fmt) => c.widths.map((w) => `${base}-${w}.${fmt} ${w}w`).join(', ');
  const [w, h] = [c.width, c.height];
  return `<picture class="${cls}" style="--dominant:${c.dominant};background-image:url('${c.placeholder}')">
    <source type="image/avif" srcset="${set('avif')}" sizes="${sizes}">
    <source type="image/webp" srcset="${set('webp')}" sizes="${sizes}">
    <img src="${base}-960.webp" width="${w}" height="${h}" alt="${esc(alt ?? c.alt)}"
      ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async">
  </picture>`;
}

export function creditLine(id) {
  const c = credit(id);
  if (!c) return '';
  return `Photo: <a href="${esc(c.sourcePage)}">${esc(c.author)}</a>, <a href="${esc(c.licenceUrl)}">${esc(c.licence)}</a>`;
}

export const host = (u) => {
  try { return new URL(u).hostname.replace(/^www\./, ''); } catch { return u; }
};

// Sources worth showing to a reader (drop routing/geocoding API calls).
export const readerSources = (p) => p.sources.filter((u) => !/osrm|nominatim/.test(u));

export function monthStrip(p, cls = 'months') {
  return `<ol class="${cls}" aria-label="Best months">${MONTHS.map((m, i) => {
    const on = p.bestMonths?.includes(i + 1);
    const now = i + 1 === thisMonth;
    return `<li class="${on ? 'on' : ''} ${now ? 'now' : ''}" ${now ? 'aria-current="date"' : ''}><span>${m}</span></li>`;
  }).join('')}</ol>`;
}

// localStorage, always guarded.
export const store = {
  get(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* private mode */ } },
};

export function wireStars(root = document) {
  const list = new Set(store.get('me:list', []));
  root.querySelectorAll('[data-star]').forEach((b) => {
    const id = b.dataset.star;
    const sync = () => { b.setAttribute('aria-pressed', list.has(id)); };
    sync();
    b.addEventListener('click', () => {
      list.has(id) ? list.delete(id) : list.add(id);
      store.set('me:list', [...list]);
      sync();
    });
  });
}

// The specimen set used by all three directions, so they compare like for like.
export const SPEC = {
  heroImg: 'st-marys-island/73902011',
  heroPlace: place('st-marys-island'),
  card: place('agumbe-sunset-point-and-ghat'),
  cardImg: 'agumbe-sunset-point-and-ghat/51493764',
  openerImg: 'udupi-sri-krishna-matha/23255985',
  openerAlt: 'udupi-sri-krishna-matha/109461871',
  detail: place('kollur-mookambika-temple'),
  detailImg: 'kollur-mookambika-temple/187366341',
  detailImg2: 'kollur-mookambika-temple/47280688',
};

export const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

// Reveal-on-scroll used by all three (CSS decides what a reveal looks like).
export function reveals() {
  const els = document.querySelectorAll('[data-reveal]');
  if (reduced || !('IntersectionObserver' in window)) { els.forEach((e) => e.classList.add('in')); return; }
  const io = new IntersectionObserver((es) => es.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }), { threshold: 0.15 });
  els.forEach((e) => io.observe(e));
}
