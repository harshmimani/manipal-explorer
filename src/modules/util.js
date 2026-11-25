// Shared helpers: data lookups, escaping, <picture>, month strip, guarded storage.
import { credits, byId } from './data.js';

export { byId };

export const BASE = import.meta.env.BASE_URL; // '/manipal-explorer/'
export const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export const MONTHS_LONG = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
export const today = new Date();
export const thisMonth = today.getMonth() + 1;

export const CHAPTERS = [
  { id: 'coast', num: 'I', title: 'The Coast', short: 'Coast' },
  { id: 'gods', num: 'II', title: 'The Gods', short: 'Gods' },
  { id: 'ghats', num: 'III', title: 'The Ghats', short: 'Ghats' },
  { id: 'heritage', num: 'IV', title: 'The Old Stones', short: 'Heritage' },
  { id: 'table', num: 'V', title: 'The Table', short: 'Table' },
  { id: 'plan', num: 'VI', title: 'The Plan', short: 'Plan' },
];
export const chapterOf = (id) => CHAPTERS.find((c) => c.id === id);
export const chapterLabel = (id) => { const c = chapterOf(id); return c ? `${c.num} · ${c.title}` : ''; };

export const place = (id) => byId.get(id);
export const credit = (id) => credits[id];

export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

export const isGoodNow = (p) => Array.isArray(p.bestMonths) && p.bestMonths.length < 12 && p.bestMonths.includes(thisMonth);
export const allYear = (p) => p.bestMonths?.length === 12;

// "Oct–Mar" style range, wrapping round the year end.
export function monthRange(ms) {
  if (!ms?.length) return 'Verify locally';
  if (ms.length === 12) return 'All year';
  const set = new Set(ms);
  // Find a start month whose previous month is not in the set.
  const start = [...set].find((m) => !set.has(((m + 10) % 12) + 1)) ?? ms[0];
  const runs = [];
  let m = start, run = null;
  for (let i = 0; i < 12; i++) {
    if (set.has(m)) { if (!run) run = [m, m]; else run[1] = m; }
    else if (run) { runs.push(run); run = null; }
    m = (m % 12) + 1;
  }
  if (run) runs.push(run);
  return runs.map(([a, b]) => (a === b ? MONTHS[a - 1] : `${MONTHS[a - 1]}–${MONTHS[b - 1]}`)).join(', ');
}

// Responsive <picture> with AVIF/WebP srcset and a blur placeholder behind it.
export function picture(id, { sizes = '100vw', cls = '', eager = false, alt } = {}) {
  const c = credit(id);
  if (!c) return '';
  const base = `${BASE}${c.file}`;
  const set = (fmt) => c.widths.map((w) => `${base}-${w}.${fmt} ${w}w`).join(', ');
  const fallback = c.widths.includes(960) ? 960 : c.widths[c.widths.length - 1];
  return `<picture class="${cls}" style="--dominant:${c.dominant};background-image:url('${c.placeholder}')">` +
    `<source type="image/avif" srcset="${set('avif')}" sizes="${sizes}">` +
    `<source type="image/webp" srcset="${set('webp')}" sizes="${sizes}">` +
    `<img src="${base}-${fallback}.webp" width="${c.width}" height="${c.height}" alt="${esc(alt ?? c.alt)}" ` +
    `${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async" onload="this.parentNode.classList.add('is-loaded')"></picture>`;
}

// Typographic stand-in for the 19 places without a licensed photo.
export function gradientArt(p) {
  return `<div class="gradart gradart--${p.chapter}" aria-hidden="true"><span>${esc(p.name.split(/[,(]/)[0])}</span></div>`;
}

export function creditLine(id, prefix = 'Photo: ') {
  const c = credit(id);
  if (!c) return '';
  // Some Commons URLs arrive HTML-encoded (&amp;); decode before escaping once.
  const url = (u) => (u ? esc(String(u).replace(/&amp;/g, '&')) : '');
  const link = (u, text, rel = 'noopener') => (u ? `<a href="${url(u)}" rel="${rel}">${esc(text)}</a>` : esc(text));
  return `${prefix}${link(c.authorUrl, c.author)}, ${link(c.licenceUrl, c.licence, 'noopener license')} via ${link(c.sourcePage, 'Wikimedia Commons')}`;
}

export const host = (u) => { try { return new URL(u).hostname.replace(/^www\./, ''); } catch { return u; } };
export const readerSources = (srcs = []) => srcs.filter((u) => !/osrm|nominatim/.test(u));

export function monthStrip(ms, { label = 'Best months', cls = 'months' } = {}) {
  return `<ol class="${cls}" aria-label="${esc(label)}">${MONTHS.map((m, i) => {
    const on = ms?.includes(i + 1), now = i + 1 === thisMonth;
    const sr = `${MONTHS_LONG[i]}${on ? ', in season' : ''}${now ? ', this month' : ''}`;
    return `<li class="${on ? 'on' : ''}${now ? ' now' : ''}"${now ? ' aria-current="date"' : ''}><span aria-hidden="true">${m[0]}</span><span class="vh">${sr}</span></li>`;
  }).join('')}</ol>`;
}

// Ride time "1h 25m" → bold numerals with small units.
export const rideHtml = (s) => (s ? esc(s).replace(/(\d+)\s*([hm])/g, '$1<small>$2</small>') : '—');
export const kmHtml = (n) => (n == null ? '—' : `${n}<small>km</small>`);

export const verifyTag = '<span class="verify">Verify locally</span>';
export const needsVerify = (s) => s == null || /verify locally|not confirmed|sources differ|isn'?t confirmed|aren'?t confirmed/i.test(s);

// localStorage, always guarded.
export const store = {
  get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* private mode or blocked */ } },
};

export const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
export const STAR = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.2l2.6 5.6 6.1.7-4.5 4.2 1.2 6.1L12 16.8 6.6 19.8l1.2-6.1L3.3 9.5l6.1-.7z"/></svg>';
export const CHECK = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.2 4.2L19 7"/></svg>';
