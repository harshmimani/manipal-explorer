// Explore everything: filter state → grid visibility, live count, and the map.
import places from '../data/places.json';
import { isGoodNow } from './util.js';
import { has, subscribe } from './state.js';
import { CATEGORY } from './sections.js';

const CAT = Object.fromEntries(CATEGORY.map(([k, , fn]) => [k, fn]));
const DIST = { near: (d) => d != null && d < 30, mid: (d) => d != null && d >= 30 && d <= 100, far: (d) => d != null && d > 100 };
const annadanaTemples = new Set(['udupi-sri-krishna-matha', 'kollur-mookambika-temple', 'dharmasthala-manjunatha-temple', 'kukke-subramanya-temple', 'horanadu-annapoorneshwari-temple', 'sringeri-sharada-peetham']);

const listeners = new Set();
export const onFilter = (fn) => { listeners.add(fn); return () => listeners.delete(fn); };
let currentIds = new Set(places.map((p) => p.id));
export const visibleIds = () => currentIds;

function readForm(form) {
  const fd = new FormData(form);
  const all = (k) => fd.getAll(k);
  return {
    q: String(fd.get('q') || '').trim().toLowerCase(),
    chapter: all('chapter'), cat: all('cat'), how: all('how'), dist: all('dist'), trip: all('trip'), diff: all('diff'),
    now: fd.get('now') === '1', month: Number(fd.get('month')) || 0, only: all('only'),
  };
}

// Within a group: OR. Across groups: AND.
function match(p, f) {
  if (f.q && !`${p.name} ${p.hook} ${p.tags.join(' ')}`.toLowerCase().includes(f.q)) return false;
  if (f.chapter.length && !f.chapter.includes(p.chapter)) return false;
  if (f.cat.length && !f.cat.some((c) => CAT[c](p))) return false;
  if (f.how.length && !f.how.some((h) => (h === 'bike' ? p.transport?.bike : p.transport?.train?.available))) return false;
  if (f.dist.length && !f.dist.some((d) => DIST[d](p.distanceKmFromManipal))) return false;
  if (f.trip.length && !f.trip.includes(p.tripType)) return false;
  if (f.diff.length && !(p.trek && f.diff.includes(p.trek.difficulty))) return false;
  if (f.now && !isGoodNow(p)) return false;
  if (f.month && !p.bestMonths?.includes(f.month)) return false;
  for (const o of f.only) {
    if (o === 'temples' && !p.temple) return false;
    if (o === 'food' && !p.vegFoodNearby?.length) return false;
    if (o === 'annadana' && !(annadanaTemples.has(p.id) || p.tags.includes('annadana'))) return false;
    if (o === 'list' && !has('list', p.id)) return false;
    if (o === 'been' && !has('been', p.id)) return false;
    if (o === 'notbeen' && has('been', p.id)) return false;
  }
  return true;
}

export function initExplore() {
  const sec = document.getElementById('explore');
  const form = sec.querySelector('[data-filter-form]');
  const cards = [...sec.querySelectorAll('[data-grid] .card')];
  const sheet = sec.querySelector('[data-filters]');
  const openBtn = sec.querySelector('[data-filters-open]');
  const reset = sec.querySelector('[data-reset]');
  const activeN = sec.querySelector('[data-active-n]');
  const counts = [sec.querySelector('[data-count]'), sec.querySelector('[data-count2]')];
  const label = sec.querySelector('[data-count-label]');
  const empty = sec.querySelector('[data-empty]');
  const groups = [...sec.querySelectorAll('[data-fgroup]')];

  // Desktop: each group is a dropdown in the sticky bar. Phone: all groups open in the sheet.
  const desk = matchMedia('(min-width: 1000px)');
  const layout = () => groups.forEach((g) => { g.open = !desk.matches; });
  desk.addEventListener('change', layout);
  layout();
  groups.forEach((g) => {
    g.querySelector('summary').addEventListener('click', (e) => {
      if (!desk.matches) { e.preventDefault(); return; }
      groups.forEach((o) => { if (o !== g) o.open = false; });
    });
    // Keep the dropdown on screen: flip it to right-aligned near the edge.
    g.addEventListener('toggle', () => {
      if (!g.open || !desk.matches) return;
      g.classList.remove('is-right');
      const r = g.querySelector('.fchips').getBoundingClientRect();
      if (r.right > document.documentElement.clientWidth - 8) g.classList.add('is-right');
    });
  });
  document.addEventListener('click', (e) => { if (desk.matches && !e.target.closest('[data-fgroup]')) groups.forEach((g) => { g.open = false; }); });
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape' || !desk.matches) return;
    const g = groups.find((x) => x.open); if (g) { g.open = false; g.querySelector('summary').focus(); }
  });

  const apply = () => {
    const f = readForm(form);
    const ids = new Set();
    cards.forEach((c) => { const ok = match(places.find((p) => p.id === c.dataset.place), f); c.hidden = !ok; if (ok) ids.add(c.dataset.place); });
    currentIds = ids;
    counts.forEach((el) => { el.textContent = ids.size; });
    label.textContent = ids.size === 1 ? 'place' : 'places';
    empty.hidden = ids.size > 0;
    const n = [...new FormData(form).entries()].filter(([, v]) => v !== '').length;
    activeN.hidden = !n; activeN.textContent = n;
    reset.hidden = !n;
    groups.forEach((g) => {
      const k = g.querySelectorAll('input:checked').length + (g.querySelector('select')?.value ? 1 : 0);
      const b = g.querySelector('.fgroup__n'); b.hidden = !k; b.textContent = k;
    });
    listeners.forEach((fn) => fn(ids));
  };
  form.addEventListener('input', apply);
  form.addEventListener('change', apply);
  form.addEventListener('submit', (e) => e.preventDefault());
  reset.addEventListener('click', () => { form.reset(); apply(); });
  subscribe(() => { if (new FormData(form).getAll('only').length) apply(); });

  // Mobile: bottom sheet. Desktop: the same panel is an inline sticky bar.
  const setOpen = (on) => {
    sheet.classList.toggle('is-open', on);
    openBtn.setAttribute('aria-expanded', String(on));
    document.documentElement.classList.toggle('has-filters', on);
    if (on) sheet.querySelector('input, select')?.focus({ preventScroll: true });
    else openBtn.focus({ preventScroll: true });
  };
  openBtn.addEventListener('click', () => setOpen(!sheet.classList.contains('is-open')));
  sec.querySelector('[data-filters-close]').addEventListener('click', () => setOpen(false));
  sheet.addEventListener('click', (e) => { if (e.target === sheet) setOpen(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && sheet.classList.contains('is-open')) setOpen(false); });
  apply();
}
